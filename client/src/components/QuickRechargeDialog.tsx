import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { RechargeForm } from "./RechargeForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function QuickRechargeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRecharge = async (phone: string, amount: number) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          amount: amount,
          currency: 'USD',
          userId: user ? user.id : 'guest'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors du paiement");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de démarrer la recharge",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          Recharge Rapide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Recharge</DialogTitle>
        </DialogHeader>
        
        {/* ✅ Now correctly passing the onSubmit handler */}
        <RechargeForm 
          onSubmit={handleRecharge} 
          isSubmitting={isSubmitting} 
        />
        
      </DialogContent>
    </Dialog>
  );
}

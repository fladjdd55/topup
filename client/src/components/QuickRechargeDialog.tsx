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

export function QuickRechargeDialog() {
  return (
    <Dialog>
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
        
        {/* ✅ REUSABLE FORM */}
        <RechargeForm />
        
      </DialogContent>
    </Dialog>
  );
}

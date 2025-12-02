import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { validatePhoneNumber } from '@shared/phoneValidation';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';

// Validation schema
const phoneSchema = z.object({
  phone: z.string().min(8, "Numéro invalide")
});

export function CompleteProfileDialog() {
  const { user, refetchUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError, setValue } = useForm({
    resolver: zodResolver(phoneSchema)
  });

  // ✅ Check user status on load
  useEffect(() => {
    // If user exists BUT has no phone number (e.g., Google/Telegram signup)
    if (user && !user.phone) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // 1. Format phone number
      let formatted = data.phone.trim();
      if (!formatted.startsWith('+')) {
        formatted = '+' + formatted;
      }

      // 2. Validate phone number
      const validation = validatePhoneNumber(formatted);
      if (!validation.isValid) {
        setError('phone', { message: 'Numéro invalide ou mal formaté' });
        setIsSubmitting(false);
        return;
      }

      // 3. Update Profile
      // This triggers the backend logic to link "Ask a Friend" requests!
      await apiRequest('PUT', '/api/profile', { phone: formatted });
      
      // 4. Refresh User Data
      await refetchUser(); 
      
      toast({ 
        title: "Profil complété ! 🎉", 
        description: "Votre numéro a été ajouté. Vos demandes d'amis sont maintenant liées." 
      });
      
      setIsOpen(false);

    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erreur", 
        description: error.message || "Impossible de sauvegarder le numéro" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if not logged in
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // 🔒 Prevent closing if phone is missing (Force update)
      if (user && !user.phone) return; 
      setIsOpen(open);
    }}>
      {/* Prevent clicking outside or using Escape to close */}
      <DialogContent 
        className="sm:max-w-[425px]" 
        onPointerDownOutside={e => e.preventDefault()} 
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">Finalisez votre inscription</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Pour sécuriser votre compte et recevoir les recharges de vos amis, nous avons besoin de votre numéro de téléphone.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Votre numéro de mobile</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                id="phone" 
                placeholder="+509 3123 4567" 
                className="pl-10 h-11" 
                {...register('phone')}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <span className="inline-block h-1 w-1 rounded-full bg-red-500"></span>
                {errors.phone.message as string}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Format international requis (ex: +509...)
            </p>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
              ) : (
                'Confirmer mon numéro'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

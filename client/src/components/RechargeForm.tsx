import { useState, useEffect } from 'react';
import { validatePhoneNumber } from '@shared/phoneValidation';
import { Loader2, Phone, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RechargeFormProps {
  onSubmit: (phone: string, amount: number) => Promise<void>;
  isSubmitting?: boolean;
  defaultPhone?: string;
  defaultAmount?: string;
}

export function RechargeForm({ 
  onSubmit, 
  isSubmitting = false,
  defaultPhone = '',
  defaultAmount = '10'
}: RechargeFormProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const [amount, setAmount] = useState(defaultAmount);
  const [error, setError] = useState('');
  
  // ✅ NEW: Detection State
  const [validationState, setValidationState] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Sync defaults
  useEffect(() => {
    if (defaultPhone) {
      setPhone(defaultPhone);
      // Trigger validation immediately for defaults
      const res = validatePhoneNumber(defaultPhone, 'HT');
      setValidationState(res);
    }
    if (defaultAmount) setAmount(defaultAmount);
  }, [defaultPhone, defaultAmount]);

  // ✅ REAL-TIME DETECTION LOGIC
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phone.length >= 8) { // Only check if enough digits
        setIsValidating(true);
        const res = validatePhoneNumber(phone, 'HT');
        setValidationState(res);
        setIsValidating(false);
        setError(''); // Clear errors if valid
      } else {
        setValidationState(null);
      }
    }, 500); // 500ms delay to avoid flickering while typing

    return () => clearTimeout(timer);
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Final Validation
    const validation = validatePhoneNumber(phone, 'HT');
    if (!validation.isValid) {
      setError(validation.error || 'Numéro de téléphone invalide');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Le montant doit être valide');
      return;
    }

    try {
      await onSubmit(validation.fullNumber!, numAmount);
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="phone"
            type="tel"
            placeholder="+509 3700 1234"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="pl-10"
            disabled={isSubmitting}
          />
        </div>
        
        {/* ✅ VISUAL OPERATOR FEEDBACK */}
        {isValidating && <div className="text-xs text-muted-foreground flex gap-1 items-center"><Loader2 className="h-3 w-3 animate-spin"/> Détection...</div>}
        
        {validationState?.isValid && (
          <div className="flex items-center gap-3 rounded-md border border-green-200 bg-green-50 p-3 mt-2 animate-in fade-in slide-in-from-top-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-green-900">{validationState.carrier || 'Opérateur détecté'}</div>
              <div className="text-xs text-green-700">
                {validationState.country} {validationState.fullNumber}
              </div>
            </div>
            <Badge variant="outline" className="bg-white text-green-700 border-green-200">Auto</Badge>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Montant (USD)</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="amount"
            type="number"
            placeholder="10.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-10"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex gap-2 mt-2">
          {['5', '10', '20', '50'].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className={`text-xs px-3 py-1 rounded border transition-colors ${
                amount === amt 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting || !validationState?.isValid}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement...
          </>
        ) : (
          'Recharger maintenant'
        )}
      </Button>
    </form>
  );
}

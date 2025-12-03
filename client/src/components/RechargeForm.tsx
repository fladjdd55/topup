// client/src/components/RechargeForm.tsx
import { useState } from 'react';
import { validatePhoneNumber } from '@shared/phoneValidation';
import { Loader2 } from 'lucide-react';

interface RechargeFormProps {
  onSubmit: (phone: string, amount: number) => Promise<void>;
  isSubmitting?: boolean;
}

export function RechargeForm({ onSubmit, isSubmitting = false }: RechargeFormProps) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('10');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePhoneNumber(phone, 'HT');
    
    if (!validation.isValid) {
      setError(validation.error || 'Invalid number');
      return;
    }
    
    // Pass clean data back to parent
    await onSubmit(validation.fullNumber!, parseFloat(amount));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... inputs ... */}
      <button disabled={isSubmitting} className="...">
        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Recharge'}
      </button>
    </form>
  );
}

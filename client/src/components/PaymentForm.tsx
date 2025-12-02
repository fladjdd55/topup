import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PaymentFormProps {
  amount: number;
  commission: number;
  phoneNumber: string;
  operatorCode: string;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function PaymentForm({ amount, commission, phoneNumber, operatorCode, currency = 'USD', onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || t('payment.form_validation_error'));
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/history`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || t('payment.payment_error'));
        onError(error.message || t('payment.payment_error'));
      } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
        // ✅ With manual capture, status is 'requires_capture' instead of 'succeeded'
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('payment.payment_error');
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-payment">
      {/* 🔒 Badges de sécurité */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-900 dark:text-green-100">
            {t('payment.secure_ssl')}
          </span>
        </div>
        <Badge variant="outline" className="bg-white dark:bg-gray-900 border-green-300 dark:border-green-700">
          <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
          {t('payment.pci_compliant')}
        </Badge>
        <Badge variant="outline" className="bg-white dark:bg-gray-900 border-green-300 dark:border-green-700">
          <Lock className="h-3 w-3 mr-1 text-green-600" />
          {t('payment.stripe_certified')}
        </Badge>
      </div>

      {/* Message de sécurité rassurant */}
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Lock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <strong>{t('payment.bank_info_protected')}</strong> - {t('payment.stripe_security_message')}
        </AlertDescription>
      </Alert>

      <div className="rounded-lg border-2 border-primary/20 p-6 space-y-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-semibold">
            <CreditCard className="h-5 w-5 text-primary" />
            {t('payment.payment_information')}
          </div>
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            {t('payment.secured')}
          </Badge>
        </div>

        {/* Labels explicites avant le PaymentElement */}
        <div className="space-y-3 mb-4">
          <div className="text-sm">
            <p className="font-medium text-foreground mb-1">📇 {t('payment.card_number')}</p>
            <p className="text-xs text-muted-foreground">{t('payment.card_number_helper')}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">📅 {t('payment.expiry_date')}</p>
              <p className="text-xs text-muted-foreground">{t('payment.expiry_helper')}</p>
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">🔐 {t('payment.cvv_code')}</p>
              <p className="text-xs text-muted-foreground">{t('payment.cvv_helper')}</p>
            </div>
          </div>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card'],
            fields: {
              billingDetails: {
                address: {
                  country: 'auto',
                  postalCode: 'auto',
                },
              },
            },
            terms: {
              card: 'auto',
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {errorMessage && (
        <Alert variant="destructive" data-testid="alert-payment-error">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg bg-muted p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('payment.number')}:</span>
          <span className="font-mono font-medium">{phoneNumber}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('payment.operator')}:</span>
          <span className="font-medium">{operatorCode}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('payment.recharge_amount')}:</span>
          <span className="font-medium">{amount.toFixed(2)} {currency}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('payment.commission')}:</span>
          <span className="font-medium text-muted-foreground">+{commission.toFixed(2)} {currency}</span>
        </div>
        <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
          <span className="font-semibold">{t('payment.total_to_pay')}:</span>
          <span className="text-lg font-bold">{(amount + commission).toFixed(2)} {currency}</span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !elements || isProcessing}
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t('payment.processing')}
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            {t('payment.pay_button')} {(amount + commission).toFixed(2)} {currency}
          </>
        )}
      </Button>
    </form>
  );
}

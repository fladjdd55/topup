import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Download, Home, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Transaction } from '@shared/schema';
import { generateReceipt } from '@/utils/receiptGenerator';

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ NEW: Handle Telegram WebApp Context
  useEffect(() => {
    const Telegram = (window as any).Telegram;
    if (Telegram?.WebApp) {
      // Ensure full height visibility
      Telegram.WebApp.expand();
      
      if (!loading && transaction) {
        // Show native Close button
        Telegram.WebApp.MainButton.setText("TERMINER");
        Telegram.WebApp.MainButton.show();
        Telegram.WebApp.MainButton.onClick(() => {
          Telegram.WebApp.close();
        });
      }
    }
  }, [loading, transaction]);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          if (params.get('success') === 'true') {
             setLoading(false);
             return;
          }
          setError(t('payment_success.invalid_session'));
          setLoading(false);
          return;
        }

        let attempts = 0;
        const maxAttempts = 5;
        
        const checkStatus = async () => {
          try {
            const sessionRes = await apiRequest('GET', `/api/stripe/checkout-success?session_id=${sessionId}`);
            const sessionData = await sessionRes.json();

            setTransaction({
                id: 0,
                phoneNumber: sessionData.metadata?.phoneNumber,
                amount: sessionData.metadata?.baseAmount,
                currency: sessionData.metadata?.baseCurrency,
                totalReceived: sessionData.metadata?.totalWithCommission,
                commission: sessionData.metadata?.commission,
                status: 'completed',
                createdAt: new Date().toISOString(),
            } as any);
            setLoading(false);

          } catch (e) {
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(checkStatus, 1000);
            } else {
              console.warn("Could not fetch details, but payment likely succeeded");
              setLoading(false);
            }
          }
        };

        checkStatus();
        
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setLoading(false); 
      }
    };

    fetchTransaction();
  }, [t]); // Added dependency

  const handleDownloadReceipt = async () => {
    if (!transaction) return;
    await generateReceipt(transaction, language);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-bold mb-2">{t('payment_success.processing_payment')}</h2>
              <p className="text-muted-foreground">Finalisation de votre commande...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-400">{t('payment_success.payment_successful')}</CardTitle>
          <CardDescription className="text-base mt-2">
            Votre recharge a été envoyée avec succès !
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {transaction ? (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 space-y-3 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('payment_success.phone_number')}:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{transaction.phoneNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('payment_success.amount')}:</span>
                <span className="font-medium">{transaction.amount} {transaction.currency}</span>
              </div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-2"></div>
              <div className="flex justify-between text-base">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('payment_success.total_paid')}:</span>
                <span className="text-lg font-bold text-primary">${transaction.totalReceived}</span>
              </div>
            </div>
          ) : (
             <p className="text-center text-muted-foreground text-sm">
               Les détails de la transaction seront disponibles dans votre historique.
             </p>
          )}

          <div className="grid grid-cols-1 gap-3">
            {transaction && (
                <Button onClick={handleDownloadReceipt} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                {t('payment_success.download_receipt')}
                </Button>
            )}
            <Button onClick={() => navigate('/dashboard')} className="w-full bg-primary hover:bg-primary/90">
              <Home className="mr-2 h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

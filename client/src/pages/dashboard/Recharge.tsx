import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, Phone, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import type { Favorite } from '@shared/schema';
import { exceedsGuestLimit, getGuestLimit } from '@shared/currencyUtils';
import { isAmountValid, getMinimumAmountMessage } from '@shared/currencyRates';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSendRechargeTranslation } from '@/translations/sendRecharge';
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
// ✅ Import the reusable form
import { RechargeForm } from '@/components/RechargeForm';

export default function Recharge() {
  const { t, language } = useLanguage();
  const translations = getSendRechargeTranslation(language);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isTelegram } = useTelegramAuth(); 
  
  // State for pre-filling the form (from Favorites or Session)
  const [initialData, setInitialData] = useState<{ phone?: string; amount?: string } | null>(null);
  const [recurringRechargeId, setRecurringRechargeId] = useState<number | null>(null);

  // Fetch Favorites
  const { data: favorites, isLoading: loadingFavorites } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  // Handle Session Storage & Local Storage Prefills
  useEffect(() => {
    try {
      // 1. Check for Initial Recharge (First time flow)
      const initialRecharge = sessionStorage.getItem('initialRecharge');
      if (initialRecharge) {
        const data = JSON.parse(initialRecharge);
        setInitialData({ 
          phone: data.phoneNumber, 
          amount: data.amount?.toString() 
        });
        if (data.recurringRechargeId) setRecurringRechargeId(data.recurringRechargeId);
        
        toast({
          title: translations.first_recharge,
          description: translations.complete_first_recharge,
          duration: 6000,
        });
        return;
      }

      // 2. Check for Home Page Prefill
      const prefilledData = sessionStorage.getItem('prefilledRechargeData');
      if (prefilledData) {
        const data = JSON.parse(prefilledData);
        setInitialData({ 
          phone: data.phoneNumber, 
          amount: data.amount?.toString() 
        });
        return;
      }

      // 3. Check Local Storage fallbacks
      const savedPhone = localStorage.getItem('recharge_phone');
      if (savedPhone) {
        setInitialData(prev => ({ ...prev, phone: savedPhone }));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, [translations]);

  // STRIPE MUTATION
  const createCheckoutSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        ...data,
        recurringRechargeId: recurringRechargeId || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Cleanup storage
      sessionStorage.removeItem('prefilledRechargeData');
      sessionStorage.removeItem('initialRecharge');
      if (data.url) window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: translations.error,
        description: error.message,
      });
    },
  });

  // TELEGRAM MUTATION
  const createTelegramInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/telegram/create-invoice', data);
      return res.json();
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('prefilledRechargeData');
      if (data.url) {
        const Telegram = (window as any).Telegram;
        if (Telegram?.WebApp) {
          Telegram.WebApp.openInvoice(data.url, (status: string) => {
            if (status === 'paid') {
              toast({ title: 'Succès', description: 'Paiement réussi !' });
            } else if (status === 'failed') {
               toast({ variant: 'destructive', title: 'Échec', description: 'Paiement refusé.' });
            }
          });
        } else {
          window.open(data.url, '_blank');
        }
      }
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    }
  });

  // CENTRAL SUBMIT HANDLER
  const handleRechargeSubmit = async (phoneNumber: string, amount: number) => {
    const currency = 'USD'; // Default currency for logic checks

    // 1. Validation Logic
    if (amount <= 0) {
      toast({ variant: 'destructive', title: 'Montant invalide', description: 'Le montant doit être positif' });
      return;
    }

    if (!isAmountValid(amount, currency)) {
      toast({
        variant: 'destructive',
        title: 'Montant trop faible',
        description: getMinimumAmountMessage(currency),
      });
      return;
    }

    if (!user && exceedsGuestLimit(amount, currency)) {
      const limit = getGuestLimit(currency);
      toast({
        variant: 'destructive',
        title: translations.loginRequired,
        description: translations.loginRequiredDesc
          .replace('{limit}', Math.floor(limit).toString())
          .replace('{currency}', currency),
      });
      return;
    }

    // 2. Execute Payment
    const payload = { amount: amount.toString(), phoneNumber, currency };
    
    if (isTelegram) {
      await createTelegramInvoiceMutation.mutateAsync(payload);
    } else {
      await createCheckoutSessionMutation.mutateAsync(payload);
    }
  };

  const handleFavoriteClick = (favorite: Favorite) => {
    // Update the form by changing the initialData key or value
    setInitialData({ phone: favorite.phoneNumber, amount: '10' }); // Default amount for favorites
  };

  const isSubmitting = createCheckoutSessionMutation.isPending || createTelegramInvoiceMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl" data-testid="title-recharge">
          {translations.sendRecharge}
        </h1>
        <p className="text-sm text-muted-foreground">{t('recharge_page.subtitle')}</p>
      </div>

      {/* Favorites Section */}
      {favorites && favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {t('recharge_page.favorites')}
            </CardTitle>
            <CardDescription>{t('recharge_page.quick_recharge_favorites')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFavorites ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favorites.map((favorite) => (
                  <button
                    key={favorite.id}
                    onClick={() => handleFavoriteClick(favorite)}
                    className="flex items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-muted active:scale-95"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-600">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{favorite.nickname || favorite.phoneNumber}</div>
                      <div className="text-xs text-muted-foreground truncate">{favorite.phoneNumber}</div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recharge Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('recharge_page.new_recharge_title')}
          </CardTitle>
          <CardDescription>{t('recharge_page.enter_number_amount')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* ✅ USING THE SHARED RECHARGE FORM */}
          {/* Ensure RechargeForm accepts 'key' to reset state when favorites change */}
          <RechargeForm 
            key={initialData?.phone} 
            onSubmit={handleRechargeSubmit} 
            isSubmitting={isSubmitting}
            // If you updated RechargeForm to accept default props:
            // defaultPhone={initialData?.phone}
            // defaultAmount={initialData?.amount}
          />
        </CardContent>
      </Card>
    </div>
  );
}

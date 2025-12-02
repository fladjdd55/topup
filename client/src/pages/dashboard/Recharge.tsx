import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Star, Phone, DollarSign, AlertCircle, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import type { Favorite } from '@shared/schema';
import { validatePhoneNumber } from '@shared/phoneValidation';
import { exceedsGuestLimit, getGuestLimit } from '@shared/currencyUtils';
import { isAmountValid, getMinimumAmountMessage, getQuickAmounts } from '@shared/currencyRates';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSendRechargeTranslation } from '@/translations/sendRecharge';
import { useTelegramAuth } from "@/hooks/useTelegramAuth";

const DINGCONNECT_FEE = 0.09; 
const STRIPE_FEE = 0.03; 
const PROFIT_MARGIN = 0.03; 

const calculateTotalWithFees = (amount: number) => {
  const withDingConnect = amount * (1 + DINGCONNECT_FEE);
  const total = withDingConnect / (1 - STRIPE_FEE - PROFIT_MARGIN);
  return parseFloat(total.toFixed(2));
};

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    const country = cleaned.slice(0, 4);
    const rest = cleaned.slice(4).match(/.{1,4}/g)?.join(' ') || '';
    return `${country} ${rest}`.trim();
  }
  return cleaned;
};

export default function Recharge() {
  const { t, language } = useLanguage();
  const translations = getSendRechargeTranslation(language);
  const { toast } = useToast();
  const { user } = useAuth();
  const { isTelegram } = useTelegramAuth(); 
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [phoneValidation, setPhoneValidation] = useState<any>(null);
  const [recurringRechargeId, setRecurringRechargeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { data: favorites, isLoading: loadingFavorites } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  useEffect(() => {
    try {
      const initialRecharge = sessionStorage.getItem('initialRecharge');
      if (initialRecharge) {
        const data = JSON.parse(initialRecharge);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.amount) setAmount(data.amount.toString());
        if (data.currency) setCurrency(data.currency);
        if (data.recurringRechargeId) setRecurringRechargeId(data.recurringRechargeId);
        
        toast({
          title: translations.first_recharge,
          description: translations.complete_first_recharge,
          duration: 6000,
        });
        return;
      }
    } catch (error) {
      console.error('Error reading initialRecharge:', error);
    }
    
    try {
      const prefilledData = sessionStorage.getItem('prefilledRechargeData');
      if (prefilledData) {
        const data = JSON.parse(prefilledData);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.amount) setAmount(data.amount.toString());
        if (data.currency) setCurrency(data.currency);
        return;
      }
    } catch (error) {
      console.error('Error reading sessionStorage:', error);
    }

    const savedPhone = localStorage.getItem('recharge_phone') || localStorage.getItem('recharge_prefill_phone');
    const savedAmount = localStorage.getItem('recharge_prefill_amount');
    
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }
    
    if (savedAmount) {
      setAmount(savedAmount);
    }
  }, [translations]);

  useEffect(() => {
    if (phoneNumber.length >= 10) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        const validation = validatePhoneNumber(phoneNumber);
        setPhoneValidation(validation);
        
        if (validation.isValid && validation.currency) {
          setCurrency(validation.currency);
        }
        
        setIsValidating(false);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setPhoneValidation(null);
      setIsValidating(false);
      setCurrency('USD');
    }
  }, [phoneNumber]);

  // WEB MUTATION (Stripe Redirect)
  const createCheckoutSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        amount,
        phoneNumber: phoneValidation.fullNumber,
        operatorCode: phoneValidation.operator,
        currency,
        recurringRechargeId: recurringRechargeId || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
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
      setIsSubmitting(false);
    },
  });

  // ✅ TELEGRAM MUTATION (Improved Error Handling)
  const createTelegramInvoiceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/telegram/create-invoice', {
        amount,
        phoneNumber: phoneValidation.fullNumber,
        currency,
      });
      return res.json();
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('prefilledRechargeData');
      
      if (data.url) {
        const Telegram = (window as any).Telegram;
        if (Telegram?.WebApp) {
          // Open the Invoice Popup inside Telegram
          Telegram.WebApp.openInvoice(data.url, (status: string) => {
            console.log('[Telegram Pay] Status:', status);
            
            if (status === 'paid') {
              toast({ 
                title: 'Succès', 
                description: 'Paiement réussi ! Recharge en cours...',
                className: "bg-green-50 border-green-200"
              });
            } else if (status === 'cancelled') {
              toast({ 
                variant: 'destructive', 
                title: 'Annulé', 
                description: 'Vous avez annulé le paiement.' 
              });
            } else if (status === 'failed') {
               toast({ 
                variant: 'destructive', 
                title: 'Échec', 
                description: 'Le paiement a été refusé par la banque.' 
              });
            } else {
               toast({ 
                variant: 'destructive', 
                title: 'Erreur', 
                description: `Statut inconnu: ${status}` 
              });
            }
            setIsSubmitting(false);
          });
        } else {
          window.open(data.url, '_blank');
          setIsSubmitting(false);
        }
      }
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message });
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      if (!phoneValidation || !phoneValidation.isValid) {
        toast({
          variant: 'destructive',
          title: translations.invalidNumber,
          description: phoneValidation?.error || translations.invalidNumber,
        });
        setIsSubmitting(false);
        return;
      }
      
      const numAmount = parseFloat(amount);
      if (!amount || numAmount <= 0) {
        toast({
          variant: 'destructive',
          title: t('recharge_page.invalid_amount'),
          description: t('recharge_page.amount_must_be_positive'),
        });
        setIsSubmitting(false);
        return;
      }

      if (!isAmountValid(numAmount, currency)) {
        toast({
          variant: 'destructive',
          title: t('recharge_page.amount_too_small'),
          description: getMinimumAmountMessage(currency),
          duration: 5000,
        });
        setIsSubmitting(false);
        return;
      }

      if (!user && exceedsGuestLimit(numAmount, currency)) {
        const limit = getGuestLimit(currency);
        toast({
          variant: 'destructive',
          title: translations.loginRequired,
          description: translations.loginRequiredDesc
            .replace('{limit}', Math.floor(limit).toString())
            .replace('{currency}', currency),
        });
        setIsSubmitting(false);
        return;
      }

      if (isTelegram) {
        await createTelegramInvoiceMutation.mutateAsync();
      } else {
        await createCheckoutSessionMutation.mutateAsync();
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleFavoriteClick = (favorite: Favorite) => setPhoneNumber(favorite.phoneNumber);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const quickAmounts = useMemo(() => getQuickAmounts(currency), [currency]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl" data-testid="title-recharge">
          {translations.sendRecharge}
        </h1>
        <p className="text-sm text-muted-foreground">{t('recharge_page.subtitle')}</p>
      </div>

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
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favorites.map((favorite) => (
                  <button
                    key={favorite.id}
                    onClick={() => handleFavoriteClick(favorite)}
                    className="flex items-center gap-3 rounded-md border border-border p-3 text-left transition-colors hover-elevate active-elevate-2"
                    data-testid={`favorite-${favorite.id}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-600">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {favorite.nickname || favorite.phoneNumber}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {favorite.phoneNumber}
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('recharge_page.new_recharge_title')}
          </CardTitle>
          <CardDescription>{t('recharge_page.enter_number_amount')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{translations.phoneToRecharge}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+509 1234 5678"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className="pl-10"
                  data-testid="input-phone-number"
                  required
                />
              </div>
              
              {isValidating && phoneNumber.length >= 10 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{translations.detecting_operator}</span>
                </div>
              )}
              
              {phoneNumber.length > 0 && phoneNumber.length < 10 && !isValidating && (
                <div className="text-xs text-muted-foreground">
                  {translations.continue_typing}
                </div>
              )}
            </div>

            {phoneValidation && phoneValidation.isValid && !isValidating && (
              <div className="space-y-2">
                <Label>{translations.operator}</Label>
                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/50 p-4">
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-md" 
                    style={{ backgroundColor: phoneValidation.operatorColor || '#666' }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{phoneValidation.operatorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {phoneValidation.flag} {phoneValidation.countryName}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {translations.auto_detected}
                  </Badge>
                </div>
              </div>
            )}
            
            {phoneValidation && !phoneValidation.isValid && phoneNumber.length >= 10 && !isValidating && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{translations.invalidNumber}</AlertTitle>
                <AlertDescription>
                  {phoneValidation.error}
                  <br />
                  <span className="text-xs">
                    {translations.format_hint}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">
                {translations.amount}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  {currency}
                </span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="10.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="pl-16"
                  data-testid="input-amount"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setAmount(quickAmount)}
                    data-testid={`quick-amount-${quickAmount}`}
                  >
                    {quickAmount} {currency}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{translations.paymentMethod}</Label>
              <div className="flex items-center gap-3 rounded-md border border-border p-4">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-semibold">{translations.creditCard}</div>
                  <div className="text-xs text-muted-foreground">
                    {translations.securePayment}
                  </div>
                </div>
                {/* ✅ DYNAMIC BADGE */}
                <Badge>{isTelegram ? 'Smart Glocal / Telegram' : 'Stripe'}</Badge>
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (() => {
              const amt = parseFloat(amount);
              const total = calculateTotalWithFees(amt);
              const commission = parseFloat((total - amt).toFixed(2));
              
              return (
                <div className="space-y-2 rounded-md border border-border bg-muted/30 p-4">
                  <div className="flex justify-between text-sm">
                    <span>{translations.rechargeAmount}</span>
                    <span className="font-medium">{amt.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {translations.service_fees}
                    </span>
                    <span className="text-muted-foreground">
                      +{commission.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span>{translations.totalToPay}</span>
                    <span className="text-lg text-primary">
                      {total.toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {translations.fees_breakdown}
                  </div>
                </div>
              );
            })()}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting || 
                isValidating || 
                !phoneValidation?.isValid || 
                !amount || 
                parseFloat(amount) <= 0
              }
              data-testid="button-proceed-payment"
            >
              {isSubmitting || createCheckoutSessionMutation.isPending || createTelegramInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {translations.processing}
                </>
              ) : (
                translations.confirmAndPay
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

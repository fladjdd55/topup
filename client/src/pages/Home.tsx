import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LanguageSelector from "@/components/LanguageSelector";
import AuthModals from "@/components/AuthModals";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useTelegramAuth } from "@/hooks/useTelegramAuth"; // ✅ Import Telegram Hook
import { 
  Smartphone, Shield, History, Headset, CheckCircle, Gift,
  Menu, X, ArrowRight, Star, Quote, ChevronLeft, ChevronRight,
  Zap, CheckCircle2, AlertCircle, Globe, Search
} from "lucide-react";

import { 
  validatePhoneNumber,
} from "@shared/phoneValidation";
import { exceedsGuestLimit } from "@shared/currencyUtils";
import { getQuickAmounts, isAmountValid, getMinimumAmountMessage } from "@shared/currencyRates";

const features = [
  {
    icon: Zap,
    key: 'instant_topup',
    descKey: 'instant_topup_desc',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  },
  {
    icon: Shield,
    key: 'secure_transactions',
    descKey: 'secure_transactions_desc', 
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  },
  {
    icon: Globe,
    key: 'global_coverage',
    descKey: 'global_coverage_desc',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  },
  {
    icon: Smartphone,
    key: 'mobile_first',
    descKey: 'mobile_first_desc',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  },
  {
    icon: History,
    key: 'transaction_tracking',
    descKey: 'transaction_tracking_desc',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  },
  {
    icon: Headset,
    key: 'customer_support',
    descKey: 'customer_support_desc',
    color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  }
];

const detectPhoneOperator = (phoneNumber: string) => {
  if (!phoneNumber) return null;
  
  try {
    const validation = validatePhoneNumber(phoneNumber);
    
    if (!validation.isValid || !validation.country) {
      return null;
    }
    
    const result = {
      isValid: true,
      country: validation.country,
      countryName: validation.countryName,
      currency: validation.currency || 'USD',
      operator: {
        code: validation.operator || 'mobile',
        name: validation.operatorName || `Mobile ${validation.countryName}`
      },
      formattedPhone: validation.fullNumber || phoneNumber,
      originalInput: phoneNumber,
      confidence: 'high',
      source: 'universal_detection',
      flag: validation.flag,
      isInternational: validation.country !== 'HT',
      requiresGateway: validation.country !== 'HT'
    };
    
    return result;
    
  } catch (error) {
    console.error('Erreur détection:', error);
    return null;
  }
};

const CountryFlag = ({ country }: { country: string }) => {
  const flags: { [key: string]: string } = {
    'HT': '🇭🇹', 'US': '🇺🇸', 'CA': '🇨🇦', 'DO': '🇩🇴', 'PR': '🇵🇷', 
    'JM': '🇯🇲', 'TT': '🇹🇹', 'BB': '🇧🇧', 'FR': '🇫🇷', 'GB': '🇬🇧', 
    'DE': '🇩🇪', 'NG': '🇳🇬', 'IN': '🇮🇳', 'BR': '🇧🇷', 'CN': '🇨🇳',
    'ES': '🇪🇸', 'IT': '🇮🇹', 'MX': '🇲🇽', 'INTL': '🌍'
  };
  return <span className="text-xl">{flags[country] || '🌍'}</span>;
};

const getCountryDisplayName = (country: string, countryName?: string) => {
  const displayNames: { [key: string]: string } = {
    'DO': 'République Dominicaine',
    'PR': 'Porto Rico', 
    'JM': 'Jamaïque',
    'TT': 'Trinidad et Tobago',
    'BB': 'Barbados',
    'HT': 'Haïti',
    'US': 'États-Unis',
    'CA': 'Canada',
    'FR': 'France',
    'GB': 'Royaume-Uni',
    'DE': 'Allemagne'
  };
  
  return displayNames[country] || countryName || country;
};

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // ✅ Check if inside Telegram
  const { isTelegram } = useTelegramAuth(); 
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [phoneInput, setPhoneInput] = useState('');
  const [detectedNumber, setDetectedNumber] = useState<any>(null);
  const [currency, setCurrency] = useState('USD');
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-detect phone number and currency
  useEffect(() => {
    if (!phoneInput || phoneInput.length < 4) {
      setDetectedNumber(null);
      setCurrency('USD');
      return;
    }

    setIsDetecting(true);
    
    const timer = setTimeout(() => {
      const result = detectPhoneOperator(phoneInput);
      setDetectedNumber(result);
      
      // Mettre à jour la devise depuis le résultat détecté
      if (result && result.currency) {
        setCurrency(result.currency);
      }
      
      setIsDetecting(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsDetecting(false);
    };
  }, [phoneInput]);

  // Auto-play testimonial slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Montants rapides dynamiques selon la devise détectée
  const quickAmounts = useMemo(() => {
    return getQuickAmounts(currency).map(a => parseFloat(a));
  }, [currency]);

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;
  const isHighAmount = exceedsGuestLimit(finalAmount, currency);
  const canProceed = !isHighAmount || user;
  const hasValidAmount = finalAmount > 0 && isAmountValid(finalAmount, currency);
  // Permettre le clic même si montant > $300 pour ouvrir modale connexion
  const canRecharge = detectedNumber && hasValidAmount;

  const scrollToRecharge = () => {
    const rechargeSection = document.getElementById('recharge-section');
    if (rechargeSection) {
      rechargeSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation - HIDDEN IF INSIDE TELEGRAM */}
      {!isTelegram && (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex justify-between items-center h-16 lg:h-18">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-lg">
                  T
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Taptopload
                </h1>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <LanguageSelector />
                
                {user ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('nav.hello')}, {user.firstName || user.email}
                    </span>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" data-testid="button-dashboard-nav">
                        {t('nav.dashboard')}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                      data-testid="button-login-nav"
                    >
                      {t('nav.login')}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900"
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                      }}
                      data-testid="button-register-nav"
                    >
                      {t('nav.register')}
                    </Button>
                  </div>
                )}
              </div>

              <div className="md:hidden flex items-center space-x-2">
                <LanguageSelector />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  data-testid="button-mobile-menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 mb-2">
                      {t('nav.hello')}, {user.firstName || user.email}
                    </div>
                    <Link href="/dashboard">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="button-dashboard-mobile"
                      >
                        {t('nav.dashboard')}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="space-y-2 px-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      data-testid="button-login-mobile"
                    >
                      {t('nav.login')}
                    </Button>
                    <Button
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      data-testid="button-register-mobile"
                    >
                      {t('nav.register')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://img.freepik.com/photos-gratuite/femme-africaine-faire-du-shopping-ligne-aide-ordinateur-portable-smartphone-tout-tenant-sa-carte-credit_181624-34979.jpg?w=1800&q=95')`,
              imageRendering: 'crisp-edges'
            }}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 w-full py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('hero.badge')}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                <span className="block">{t('hero.title')}</span>
                <span className="block text-gray-100">
                  {t('hero.title_highlight')}
                </span>
              </h1>
              
              <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {t('hero.description')}
              </p>
              
              <div className="grid grid-cols-3 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">200+</div>
                  <div className="text-sm text-gray-300">{t('hero.operators')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-sm text-gray-300">{t('hero.service')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">99.9%</div>
                  <div className="text-sm text-gray-300">{t('hero.reliability')}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold bg-gray-900 hover:bg-gray-800 text-white border-0"
                  onClick={scrollToRecharge}
                  data-testid="button-start-now"
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  {t('hero.start_now')}
                </Button>
                
                <Link href="/send-recharge">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                    data-testid="button-gift-recharge"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    {t('hero.gift_recharge')}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side with floating cards */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative">
                {/* Floating feature cards */}
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-float">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-semibold">{t('feature.instant')}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{t('feature.instant_desc')}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-float-delay ml-8">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-semibold">{t('feature.secure')}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{t('feature.secure_desc')}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-float">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-semibold">{t('feature.global')}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{t('feature.global_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section recharge */}
      <section id="recharge-section" className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('recharge.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('recharge.description')}
            </p>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-6">
              
              {/* Input numéro */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('recharge.enter_number')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="tel"
                    placeholder={t('recharge.placeholder')}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="pl-10 h-12 border-gray-300 dark:border-gray-600"
                    data-testid="input-phone-number"
                  />
                  {isDetecting && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Résultat détection */}
              {detectedNumber && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="font-medium text-green-800 dark:text-green-300">
                      {t('recharge.operator_detected')}
                    </span>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CountryFlag country={detectedNumber.country} />
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {getCountryDisplayName(detectedNumber.country, detectedNumber.countryName)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-medium">
                        {detectedNumber.operator?.name}
                      </span>
                    </div>
                    
                    <div className="mt-2 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {detectedNumber.formattedPhone}
                    </div>
                  </div>
                </div>
              )}

              {/* Sélection montant */}
              {detectedNumber && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('recharge.select_amount_first')}
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? "default" : "outline"}
                        className="h-12 text-base font-medium rounded-lg transition-colors"
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        data-testid={`button-amount-${amount}`}
                      >
                        {amount} {currency}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">
                        {currency}
                      </span>
                    </div>
                    <Input
                      type="number"
                      placeholder={t('recharge.custom_amount')}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="pl-8 h-12 border-gray-300 dark:border-gray-600"
                      data-testid="input-custom-amount"
                    />
                  </div>

                  {/* Avertissement montant élevé */}
                  {isHighAmount && !user && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4 mt-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-1">
                            {t('recharge.account_required')}
                          </h4>
                          <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                            {t('recharge.account_required_desc')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setAuthMode('login');
                                setShowAuthModal(true);
                              }}
                              className="bg-orange-600 hover:bg-orange-700"
                              data-testid="button-signin-high-amount"
                            >
                              {t('recharge.sign_in')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setAuthMode('register');
                                setShowAuthModal(true);
                              }}
                              className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                              data-testid="button-signup-high-amount"
                            >
                              {t('recharge.sign_up')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bouton Start top-up */}
              {detectedNumber ? (
                <div>
                  <Button
                    size="lg"
                    disabled={!canRecharge}
                    className={`w-full h-12 text-base font-semibold rounded-lg transition-colors ${
                      !canRecharge
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                    onClick={() => {
                      if (!canRecharge) return;
                      
                      // Bloquer si montant > $300 ET utilisateur non connecté
                      if (isHighAmount && !user) {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        return;
                      }
                      
                      const rechargeData = {
                        phoneNumber: detectedNumber.originalInput || phoneInput,
                        formattedPhone: detectedNumber.formattedPhone,
                        operator: detectedNumber.operator?.code,
                        operatorName: detectedNumber.operator?.name,
                        country: detectedNumber.country,
                        countryName: detectedNumber.countryName,
                        flag: detectedNumber.flag,
                        confidence: detectedNumber.confidence,
                        amount: finalAmount,
                        currency: currency,
                        isInternational: detectedNumber.isInternational,
                        timestamp: Date.now()
                      };

                      try {
                        sessionStorage.setItem('prefilledRechargeData', JSON.stringify(rechargeData));
                      } catch (error) {
                        console.error('Erreur sauvegarde:', error);
                      }

                      // Rediriger vers la page de recharge (invités autorisés si montant ≤ $300)
                      setLocation('/dashboard/recharge');
                    }}
                    data-testid="button-start-topup"
                  >
                    {!detectedNumber ? t('recharge.enter_number_first') :
                     !hasValidAmount ? t('recharge.select_amount_first') :
                     !canProceed ? t('recharge.signin_required') :
                     t('recharge.start_topup')}
                  </Button>
                  
                  {canRecharge && (
                    <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-center">
                        <Shield className="w-4 h-4 mr-1" />
                        {t('recharge.secure_payment')}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('recharge.enter_to_start')}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('recharge.auto_detection')}
                  </p>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t('features.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, key, descKey, color }, index) => (
              <Card 
                key={key} 
                className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group bg-white dark:bg-gray-800"
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    {t(key)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(descKey)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section témoignages */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('testimonials.description')}
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {[
                  {
                    id: 1,
                    name: "Marie Joseph",
                    location: "Port-au-Prince",
                    rating: 5,
                    comment: t('testimonials.comment1'),
                    avatar: "👩🏾‍💼"
                  },
                  {
                    id: 2,
                    name: "Jean-Claude Pierre",
                    location: "Cap-Haïtien", 
                    rating: 5,
                    comment: t('testimonials.comment2'),
                    avatar: "👨🏾‍🔧"
                  },
                  {
                    id: 3,
                    name: "Alexandra Laurent",
                    location: "Les Cayes",
                    rating: 5,
                    comment: t('testimonials.comment3'),
                    avatar: "👩🏾‍🎓"
                  }
                ].map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                      <CardContent className="p-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <Quote className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="flex justify-center mb-6">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        
                        <blockquote className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed italic">
                          "{testimonial.comment}"
                        </blockquote>
                        
                        <div className="flex items-center justify-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-xl">
                            {testimonial.avatar}
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">{testimonial.location}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + 3) % 3)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
              data-testid="button-prev-testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % 3)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white dark:bg-gray-800 shadow-lg rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300"
              data-testid="button-next-testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="flex justify-center mt-8 space-x-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-gray-900 dark:bg-white w-8' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                  data-testid={`button-testimonial-${index}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Taptopload</h3>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                {t('footer.description')}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('footer.services')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.mobile_recharge')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.credit_transfer')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.data_plans')}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">{t('footer.help_center')}</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">{t('footer.contact')}</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">{t('footer.faq')}</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">{t('footer.about')}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                &copy; 2025 Taptopload. {t('footer.rights')}
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
                <Link href="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
                <Link href="/security" className="hover:text-white transition-colors">{t('footer.security')}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales d'authentification */}
      <AuthModals
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />

      {/* Styles CSS pour les animations */}
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-10px) rotate(2deg); 
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float 3s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}

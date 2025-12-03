import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LanguageSelector from "@/components/LanguageSelector";
import AuthModals from "@/components/AuthModals";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { 
  Smartphone, Shield, History, Headset, CheckCircle, Gift,
  Menu, X, Globe, Zap, Quote, ChevronLeft, ChevronRight, Star
} from "lucide-react";
// ✅ IMPORT RECHARGE FORM
import { RechargeForm } from '@/components/RechargeForm';
import { exceedsGuestLimit } from "@shared/currencyUtils";

const features = [
  { icon: Zap, key: 'instant_topup', descKey: 'instant_topup_desc', color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' },
  { icon: Shield, key: 'secure_transactions', descKey: 'secure_transactions_desc', color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' },
  { icon: Globe, key: 'global_coverage', descKey: 'global_coverage_desc', color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' },
  { icon: Smartphone, key: 'mobile_first', descKey: 'mobile_first_desc', color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' },
  { icon: History, key: 'transaction_tracking', descKey: 'transaction_tracking_desc', color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' },
  { icon: Headset, key: 'customer_support', descKey: 'customer_support_desc', color: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' }
];

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isTelegram } = useTelegramAuth(); 
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-play testimonial slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const scrollToRecharge = () => {
    const rechargeSection = document.getElementById('recharge-section');
    if (rechargeSection) {
      rechargeSection.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // ✅ SIMPLE STRIPE HANDLER FOR HOME PAGE
  const handleQuickRecharge = async (phone: string, amount: number) => {
    // Check limits
    if (!user && exceedsGuestLimit(amount, 'USD')) {
      setAuthMode('register');
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone, // Already E.164 from validator
          amount: amount,
          currency: 'USD',
          userId: user ? user.id : 'guest'
        })
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Error creating checkout');
      }
    } catch (error) {
      console.error('Recharge error:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation - HIDDEN IF INSIDE TELEGRAM */}
      {!isTelegram && (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex justify-between items-center h-16 lg:h-18">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-lg">T</div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Taptopload</h1>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <LanguageSelector />
                {user ? (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">{t('nav.dashboard')}</Button>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>{t('nav.login')}</Button>
                    <Button size="sm" className="bg-gray-900 text-white" onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>{t('nav.register')}</Button>
                  </div>
                )}
              </div>

              <div className="md:hidden flex items-center space-x-2">
                <LanguageSelector />
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-0">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('https://img.freepik.com/photos-gratuite/femme-africaine-faire-du-shopping-ligne-aide-ordinateur-portable-smartphone-tout-tenant-sa-carte-credit_181624-34979.jpg?w=1800&q=95')` }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 w-full py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm text-white border border-white/20 mb-6">
                <Globe className="w-4 h-4 mr-2" /> {t('hero.badge')}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto lg:mx-0">
                {t('hero.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-gray-900 text-white" onClick={scrollToRecharge}>
                  <Smartphone className="w-5 h-5 mr-2" /> {t('hero.start_now')}
                </Button>
                <Link href="/send-recharge">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10">
                    <Gift className="w-5 h-5 mr-2" /> {t('hero.gift_recharge')}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side floating cards */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 animate-float">
                  <div className="flex items-center mb-3 text-white font-semibold">
                    <CheckCircle className="w-5 h-5 mr-2" /> {t('feature.instant')}
                  </div>
                  <p className="text-gray-200 text-sm">{t('feature.instant_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recharge Section */}
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

          <Card className="border border-gray-200 dark:border-gray-700 shadow-xl">
            <CardContent className="p-8">
              {/* ✅ DIRECT RECHARGE FORM */}
              <RechargeForm 
                onSubmit={handleQuickRecharge} 
              />
              <div className="mt-4 text-center text-sm text-gray-500">
                <Shield className="w-4 h-4 inline mr-1" />
                Paiement sécurisé par Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, key, descKey, color }, index) => (
              <Card key={key} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{t(key)}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{t(descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Taptopload</h3>
              <p className="text-gray-400 max-w-md">{t('footer.description')}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">{t('footer.contact')}</Link></li>
                <li><Link href="/faq" className="hover:text-white">{t('footer.faq')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-gray-400 text-center">
            &copy; 2025 Taptopload. {t('footer.rights')}
          </div>
        </div>
      </footer>

      <AuthModals 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        mode={authMode} 
        onModeChange={setAuthMode} 
      />
    </div>
  );
}

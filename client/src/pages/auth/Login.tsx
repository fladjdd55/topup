import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Zap, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { SiGoogle, SiFacebook, SiTelegram } from 'react-icons/si'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth'; 
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { z } from 'zod';
import { loginSchema } from '@shared/schema';
import TelegramLoginButton from '@/components/TelegramLoginButton';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, refetchUser } = useAuth();
  const { loginWithTelegram, isTelegram, hasInitData } = useTelegramAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  // Handle Browser Widget Login (for Web users)
  const handleWidgetAuth = async (widgetData: any) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetData })
      });
      
      const data = await res.json();
      
      if (data.user) {
        await refetchUser();
        toast({ title: `Bienvenue ${data.user.firstName}!`, description: "Connexion réussie" });
        setLocation('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: "Échec de connexion Telegram" });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'telegram') => {
    // Prevent Google/Facebook login attempts inside Telegram
    if (isTelegram && (provider === 'google' || provider === 'facebook')) {
      toast({
        variant: "destructive",
        title: "Non supporté",
        description: "Veuillez utiliser votre email et mot de passe dans Telegram."
      });
      return;
    }

    if (provider === 'google') window.location.href = '/api/auth/google';
    if (provider === 'facebook') window.location.href = '/api/auth/facebook';
    
    if (provider === 'telegram') {
      if (isTelegram) {
        // Only attempt auto-login if we have the data
        if (hasInitData) {
          await loginWithTelegram();
        } else {
          toast({
            variant: "destructive",
            title: "Mode Invité",
            description: "Pour la connexion rapide, ouvrez l'app via le bouton Menu du bot.",
          });
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = loginSchema.parse(formData);
      await login(validated.identifier, validated.password);
      toast({
        title: t('auth.success_login'),
        description: t('auth.success_login_desc'),
      });
      setLocation('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: t('auth.error'),
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('auth.error'),
          description: error instanceof Error ? error.message : t('auth.error_desc'),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[380px] bg-white dark:bg-white rounded-lg shadow-2xl border-0 p-5">
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3 shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {t('auth.login_title')}
          </h2>
          <p className="text-gray-500 text-xs leading-relaxed">
            {t('auth.login_subtitle')}
          </p>
        </div>

        {/* --- SCENARIO 1: INSIDE TELEGRAM --- */}
        {isTelegram && (
          <div className="mb-6 space-y-4">
            {/* 1. Quick Login Button (Only if InitData is present) */}
            {hasInitData && (
              <button
                type="button"
                onClick={() => handleSocialLogin('telegram')}
                className="w-full h-11 rounded-lg bg-[#24A1DE] hover:bg-[#208bbf] text-white flex items-center justify-center gap-2 transition-all duration-200 font-medium text-sm shadow-sm"
              >
                <SiTelegram className="w-5 h-5" />
                Continuer avec Telegram
              </button>
            )}

            {/* 2. Alert for Google/Facebook Users */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div className="ml-2 text-xs text-blue-800">
                <p className="font-semibold mb-1">Utilisateur Google / Facebook ?</p>
                La connexion sociale n'est pas disponible ici.
                <ul className="list-disc list-inside mt-1 space-y-1 opacity-90">
                  <li>Utilisez votre <strong>Email et Mot de passe</strong> ci-dessous.</li>
                  <li>Pas de mot de passe ? Cliquez sur <strong>"Mot de passe oublié"</strong> pour en créer un.</li>
                </ul>
              </div>
            </Alert>
          </div>
        )}

        {/* --- SCENARIO 2: WEB BROWSER (NOT TELEGRAM) --- */}
        {!isTelegram && (
          <div className="space-y-4 mb-6">
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 flex items-center justify-center transition-all duration-200"
                title="Google"
              >
                <SiGoogle className="w-4 h-4 text-red-600" />
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all duration-200"
                title="Facebook"
              >
                <SiFacebook className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            {/* Telegram Widget for Web Users */}
            <TelegramLoginButton 
              botName="taptoploadbot" 
              onAuth={handleWidgetAuth} 
            />
          </div>
        )}

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">
              {isTelegram ? "Ou connexion par email" : "Ou continuer avec email"}
            </span>
          </div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
              {t('auth.email_or_phone')}
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="identifier"
                type="text"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                className="h-10 pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors text-sm text-gray-900"
                placeholder={t('auth.identifier_placeholder')}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t('auth.password')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 pl-12 pr-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-colors text-gray-900"
                placeholder={t('auth.password_placeholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/reset-password">
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors cursor-pointer">
                {t('auth.forgot_password')}
              </span>
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={loading}
          >
            {loading ? t('auth.loading') : t('auth.login_button')}
          </Button>

          <div className="text-center pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {t('auth.no_account')}{' '}
              <Link href="/register">
                <span className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer">
                  {t('auth.register_link')}
                </span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

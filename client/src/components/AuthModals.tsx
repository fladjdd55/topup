import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Phone, Zap } from 'lucide-react';
import { SiGoogle, SiFacebook, SiTelegram } from 'react-icons/si'; 
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { apiRequest } from '@/lib/queryClient';
import TelegramLoginButton from './TelegramLoginButton';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register' | 'forgot';
  onModeChange: (mode: 'login' | 'register' | 'forgot') => void;
}

export default function AuthModals({ isOpen, onClose, mode, onModeChange }: AuthModalsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { login: authLogin, register: authRegister, refetchUser } = useAuth();
  
  // ✅ Get Telegram context
  const { loginWithTelegram, isTelegram } = useTelegramAuth();

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // ✅ Handle Browser Widget Login
  const handleWidgetAuth = async (widgetData: any) => {
    try {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/auth/telegram", {
        widgetData: widgetData
      });
      const data = await res.json();
      
      if (data.user) {
        await refetchUser();
        toast({ title: `Bienvenue ${data.user.firstName}!`, description: "Connexion réussie" });
        onClose();
        setLocation('/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: "Échec de connexion Telegram" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'telegram') => {
    if (provider === 'google') window.location.href = '/api/auth/google';
    if (provider === 'facebook') window.location.href = '/api/auth/facebook';
    
    if (provider === 'telegram') {
      if (isTelegram) {
        // Mini App Context - One tap login
        await loginWithTelegram();
        onClose();
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (mode === 'register') {
        await authRegister(identifier || '', phone || '', password, firstName || '', lastName || '');
      } else {
        await authLogin(identifier, password);
      }
      toast({ title: t('auth.success_login'), description: t('auth.success_login_desc') });
      onClose();
      setLocation('/dashboard');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-y-auto bg-white dark:bg-white border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{mode}</DialogTitle>
          <DialogDescription>{mode}</DialogDescription>
        </DialogHeader>
        <div className="p-5">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3 shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {mode === 'login' ? t('auth.login_title') : t('auth.register_title')}
            </h2>
          </div>

          {/* Social Buttons */}
          {mode !== 'forgot' && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                <button type="button" onClick={() => handleSocialLogin('google')} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-red-500 flex items-center justify-center">
                  <SiGoogle className="w-4 h-4 text-red-600" />
                </button>
                <button type="button" onClick={() => handleSocialLogin('facebook')} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-blue-600 flex items-center justify-center">
                  <SiFacebook className="w-4 h-4 text-blue-600" />
                </button>
                
                {/* Custom Telegram Button for Mini App users */}
                {isTelegram && (
                  <button type="button" onClick={() => handleSocialLogin('telegram')} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-blue-400 flex items-center justify-center">
                    <SiTelegram className="w-5 h-5 text-blue-500" />
                  </button>
                )}
              </div>

              {/* Official Telegram Widget for Browser users (Replaces "X") */}
              {!isTelegram && (
                <TelegramLoginButton 
                  botName="taptoploadbot" 
                  onAuth={handleWidgetAuth} 
                />
              )}
            </div>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-500">Ou continuez avec email</span></div>
          </div>

          {/* Email Form */}
          {mode !== 'forgot' && (
            <form onSubmit={handleEmailAuth} className="space-y-3">
               <div className="space-y-1">
                  <Label className="text-gray-700">{mode === 'login' ? t('auth.email_or_phone') : t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      value={identifier} 
                      onChange={(e) => setIdentifier(e.target.value)} 
                      className="pl-10 text-gray-900" 
                      placeholder={mode === 'login' ? t('auth.identifier_placeholder') : t('auth.email_placeholder')}
                    />
                  </div>
               </div>
               
               <div className="space-y-1">
                  <Label className="text-gray-700">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input 
                      type="password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="pl-10 text-gray-900" 
                      placeholder="••••••" 
                    />
                  </div>
               </div>

               <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                 {isLoading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire')}
               </Button>
            </form>
          )}
          
          {mode === 'login' && (
            <div className="text-center mt-3">
               <button type="button" onClick={() => onModeChange('forgot')} className="text-sm text-blue-600">
                 Mot de passe oublié ?
               </button>
            </div>
          )}
          
          <div className="text-center mt-3">
             <button type="button" onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')} className="text-sm text-blue-600">
               {mode === 'login' ? 'Créer un compte' : 'J\'ai déjà un compte'}
             </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

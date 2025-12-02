import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Zap, User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { SiGoogle, SiFacebook, SiTelegram } from 'react-icons/si'; // ✅ Replaced SiX
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useTelegramAuth } from '@/hooks/useTelegramAuth'; // ✅ Import Telegram Hook
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import TelegramLoginButton from '@/components/TelegramLoginButton'; // ✅ Import Widget

const registerSchema = z.object({
  email: z.string().email('Email invalide').or(z.literal('')),
  phone: z.string().min(8, 'Numéro invalide').or(z.literal('')),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.email || data.phone, {
  message: 'Email ou téléphone requis',
  path: ['email'],
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, refetchUser } = useAuth();
  const { loginWithTelegram, isTelegram } = useTelegramAuth(); // ✅ Get Telegram context
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  // ✅ Handle Browser Widget Login
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
        toast({ title: `Bienvenue ${data.user.firstName}!`, description: "Compte créé avec succès" });
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
    if (provider === 'google') window.location.href = '/api/auth/google';
    if (provider === 'facebook') window.location.href = '/api/auth/facebook';
    
    if (provider === 'telegram') {
      if (isTelegram) {
        await loginWithTelegram();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = registerSchema.parse(formData);
      await register(
        validated.email,
        validated.phone,
        validated.password,
        validated.firstName,
        validated.lastName
      );
      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès!',
      });
      setLocation('/dashboard');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: 'destructive',
          title: 'Erreur de validation',
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Échec d\'inscription',
          description: error instanceof Error ? error.message : 'Une erreur est survenue',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[380px] bg-white dark:bg-white rounded-lg shadow-2xl border-0 p-5">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl mb-3 shadow-lg">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Inscription</h1>
          <p className="text-gray-500 text-xs leading-relaxed">Créez votre compte gratuitement</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-center gap-2">
            <button type="button" onClick={() => handleSocialLogin('google')} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-red-500 flex items-center justify-center">
              <SiGoogle className="w-4 h-4 text-red-600" />
            </button>
            <button type="button" onClick={() => handleSocialLogin('facebook')} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-blue-600 flex items-center justify-center">
              <SiFacebook className="w-4 h-4 text-blue-600" />
            </button>
            
            {/* ✅ Custom Telegram Button (Only visible inside Telegram) */}
            {isTelegram && (
              <button type="button" onClick={() => handleSocialLogin('telegram')} className="w-11 h-11 rounded-full border-2 border-gray-200 hover:border-blue-400 flex items-center justify-center">
                <SiTelegram className="w-5 h-5 text-blue-500" />
              </button>
            )}
          </div>

          {/* ✅ Official Telegram Widget (Only visible in Browser) */}
          {!isTelegram && (
            <TelegramLoginButton 
              botName="taptoploadbot" 
              onAuth={handleWidgetAuth} 
            />
          )}
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-gray-500">Ou continuez avec email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-gray-700">Prénom</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="firstName" placeholder="John" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="h-10 pl-10 text-gray-900" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-gray-700">Nom</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="h-10 pl-10 text-gray-900" />
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="email" type="email" placeholder="email@exemple.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10 pl-10 text-gray-900" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-12 pl-12 pr-12 text-gray-900" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword" className="text-gray-700">Confirmer</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="h-12 pl-12 pr-12 text-gray-900" required />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Déjà un compte?{' '}
              <Link href="/login">
                <span className="font-semibold text-blue-600 hover:underline cursor-pointer">Se connecter</span>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

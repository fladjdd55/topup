import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/ThemeProvider';

export function useTelegramAuth() {
  const { user, refetchUser } = useAuth();
  const { toggleTheme } = useTheme();
  const { toast } = useToast();
  
  const [isTelegram, setIsTelegram] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitData, setHasInitData] = useState(false);
  
  const autoLoginAttempted = useRef(false);

  // Manual trigger for the "Continuer" button
  const loginWithTelegram = useCallback(async () => {
    const Telegram = (window as any).Telegram;
    const tg = Telegram?.WebApp;

    if (!tg?.initData) {
      toast({
        variant: "destructive",
        title: "Guest Mode",
        description: "To login with Telegram, please open the app via the 'Menu' or 'Open App' button in the bot, not via a link.",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("[Telegram] Authenticating...");
      const res = await apiRequest("POST", "/api/auth/telegram", {
        initData: tg.initData,
        user: tg.initDataUnsafe?.user 
      });

      const data = await res.json();

      if (data.user) {
        await refetchUser();
        toast({
          title: `Hello ${data.user.firstName} 👋`,
          description: "Login successful",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("[Telegram] Auth failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Automatic login failed.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [refetchUser, toast]);

  useEffect(() => {
    const Telegram = (window as any).Telegram;
    const tg = Telegram?.WebApp;

    // Detect if we are inside Telegram
    if (tg && (tg.initData || tg.platform !== 'unknown')) {
      setIsTelegram(true);
      
      // Check if we have secure initData
      if (tg.initData) {
        setHasInitData(true);
        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
      } else {
        setHasInitData(false);
      }

      try {
        tg.ready();
        tg.expand();
        if (tg.colorScheme === 'dark' && document.documentElement.classList.contains('light')) {
          toggleTheme();
        }
      } catch (e) {
        console.error("[Telegram] UI Init Error:", e);
      }

      // Auto-Login only if initData is present
      if (tg.initData && !user && !autoLoginAttempted.current) {
        autoLoginAttempted.current = true;
        loginWithTelegram();
      }
    }
    
    setIsReady(true);
  }, [user, toggleTheme, loginWithTelegram]);

  return { 
    isTelegram, 
    isReady, 
    hasInitData,
    telegramUser, 
    loginWithTelegram,
    isLoading 
  };
}

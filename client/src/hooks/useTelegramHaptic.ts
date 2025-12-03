import { useCallback } from 'react';

export function useTelegramHaptic() {
  // For buttons, clicks, and interactions
  const trigger = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  }, []);

  // For operation results (success/failure)
  const notify = useCallback((type: 'error' | 'success' | 'warning') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
    }
  }, []);

  // For changing sliders, pickers, or tabs
  const selection = useCallback(() => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  }, []);

  return { trigger, notify, selection };
}

// client/src/hooks/useTelegramHaptic.ts
export function useTelegramHaptic() {
  const trigger = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
  };
  
  const notify = (type: 'error' | 'success' | 'warning') => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
  };
  
  return { trigger, notify };
}

// Use in Dashboard.tsx:
const { trigger, notify } = useTelegramHaptic();

// Add to all buttons:
<Button onClick={() => {
  trigger();
  setLocation("/dashboard/recharge");
}}>

// Add to mutations:
onSuccess: () => {
  notify('success');
  toast({ title: 'Request sent!' });
},

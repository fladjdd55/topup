import { useEffect, useRef } from 'react';

interface TelegramLoginButtonProps {
  onAuth: (user: any) => void;
  botName: string; 
}

export default function TelegramLoginButton({ onAuth, botName }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    (window as any).onTelegramAuth = (user: any) => {
      onAuth(user);
    };
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    containerRef.current.appendChild(script);
  }, [botName, onAuth]);

  return (
    <div className="flex justify-center my-4" ref={containerRef}>
      {/* Widget injects here */}
    </div>
  );
}

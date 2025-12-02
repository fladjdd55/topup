import { Link, useLocation } from "wouter";
import { Home, Zap, History, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Function to handle viewport changes
    const handleViewportChange = () => {
      if (!window.visualViewport) return;

      const currentHeight = window.visualViewport.height;
      const screenHeight = window.innerHeight;

      // Logic: If the visual viewport is significantly smaller than the window inner height
      // (e.g., < 80%), it means something (like a keyboard) is displacing content.
      // We hide the nav in this case.
      if (currentHeight < screenHeight * 0.85) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Attach listeners if the API is supported
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      
      // Initial check
      handleViewportChange();
    }

    // Fallback for older browsers or focus events
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        setIsVisible(false);
      }
    };

    const handleBlur = () => {
      // Delay allows for focus switching between inputs without flashing the nav
      setTimeout(() => {
        // Double check with visual viewport if available
        if (window.visualViewport) {
             if (window.visualViewport.height >= window.innerHeight * 0.85) {
                 setIsVisible(true);
             }
        } else {
             setIsVisible(true);
        }
      }, 200);
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // If hidden (keyboard open), do not render
  if (!isVisible) return null;

  const navItems = [
    { icon: Home, label: "Accueil", path: "/dashboard" },
    { icon: Zap, label: "Recharge", path: "/dashboard/recharge" },
    { icon: History, label: "Historique", path: "/dashboard/history" },
    { icon: User, label: "Profil", path: "/dashboard/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-2 z-50 flex justify-between items-center transition-transform duration-200 pb-[calc(10px+env(safe-area-inset-bottom))] shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = location === item.path;
        return (
          <Link key={item.path} href={item.path}>
            <div className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-all active:scale-95 cursor-pointer min-w-[60px]",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <item.icon className={cn("h-6 w-6 transition-colors", isActive && "fill-current/10")} />
              <span className={cn(
                "text-[10px] font-medium transition-all",
                isActive ? "scale-105 font-semibold" : ""
              )}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

import { ReactNode } from "react";
import BottomNav from "@/components/telegram/BottomNav";

export default function TelegramLayout({ children }: { children: ReactNode }) {
  return (
    // ✅ Updated Padding: 
    // 1. 'min-h-screen' ensures full height
    // 2. 'pb-[calc(...)]' ensures content isn't hidden behind the Bottom Nav or Home Bar
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      
      {/* Dynamic Content */}
      <main className="animate-in fade-in duration-500">
        {children}
      </main>

      {/* Persistent Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

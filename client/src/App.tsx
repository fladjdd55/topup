import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { WebSocketProvider } from "@/components/WebSocketProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ResetPassword from "@/pages/ResetPassword";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Overview from "@/pages/dashboard/Overview";
import Recharge from "@/pages/dashboard/Recharge";
import Favorites from "@/pages/dashboard/Favorites";
import History from "@/pages/dashboard/History";
import Requests from "@/pages/dashboard/Requests";
import Profile from "@/pages/dashboard/Profile";
import Admin from "@/pages/dashboard/Admin";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Security from "@/pages/Security";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Help from "@/pages/Help";
import About from "@/pages/About";
import SendRecharge from "@/pages/SendRecharge";
import RequestFulfill from "@/pages/RequestFulfill";
import RecurringRecharges from "@/pages/RecurringRecharges";
import Loyalty from "@/pages/Loyalty";
import CountryTest from "@/pages/dashboard/CountryTest";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";

// ✅ Telegram Imports
import TelegramAuthPage from "@/pages/telegram/AuthPage";
import TelegramDashboard from "@/pages/telegram/Dashboard";
import TelegramLayout from "@/pages/telegram/Layout"; 

// ✅ New Component for "Ask a Friend" logic
import { CompleteProfileDialog } from "@/components/CompleteProfileDialog";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    } else if (!loading && user && adminOnly && user.role !== 'admin' && user.role !== 'super_admin') {
      setLocation('/dashboard');
    }
  }, [user, loading, adminOnly, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && user.role !== 'admin' && user.role !== 'super_admin') return null;

  return <Component />;
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation]);

  if (loading) return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
  );
  
  if (user) {
    if (location === '/login' || location === '/register') {
      setLocation('/');
    }
    return null;
  }

  return <Component />;
}

function DashboardLayout() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      if (location === '/dashboard' || location === '/dashboard/') {
        setLocation('/dashboard/admin');
      }
    }
  }, [user, location, setLocation]);

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-sidebar-border p-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Switch>
                <Route path="/dashboard" component={() => <ProtectedRoute component={Overview} />} />
                <Route path="/dashboard/recharge" component={Recharge} />
                <Route path="/dashboard/favorites" component={() => <ProtectedRoute component={Favorites} />} />
                <Route path="/dashboard/history" component={() => <ProtectedRoute component={History} />} />
                <Route path="/dashboard/requests" component={() => <ProtectedRoute component={Requests} />} />
                <Route path="/dashboard/profile" component={() => <ProtectedRoute component={Profile} />} />
                <Route path="/dashboard/settings" component={() => <ProtectedRoute component={Profile} />} />
                <Route path="/dashboard/recurring" component={() => <ProtectedRoute component={RecurringRecharges} />} />
                <Route path="/dashboard/loyalty" component={() => <ProtectedRoute component={Loyalty} />} />
                <Route path="/dashboard/admin" component={() => <ProtectedRoute component={Admin} adminOnly />} />
                <Route path="/dashboard/country-test" component={() => <ProtectedRoute component={CountryTest} adminOnly />} />
                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isTelegram, isReady } = useTelegramAuth();

  // 1. Wait for detection to finish to avoid flash of web content
  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // 2. ✅ UPDATED TELEGRAM ROUTING
  if (isTelegram) {
    return (
      <Switch>
        {/* Auth Page (No Bottom Nav) */}
        <Route path="/auth" component={TelegramAuthPage} />
        
        {/* Main Dashboard Pages (With Bottom Nav) */}
        <Route path="/dashboard" component={() => (
          <TelegramLayout><TelegramDashboard /></TelegramLayout>
        )} />
        
        <Route path="/dashboard/recharge" component={() => (
          <TelegramLayout><Recharge /></TelegramLayout>
        )} />
        
        <Route path="/dashboard/history" component={() => (
          <TelegramLayout><History /></TelegramLayout>
        )} />
        
        <Route path="/dashboard/profile" component={() => (
          <TelegramLayout><Profile /></TelegramLayout>
        )} />

        {/* ✅ FIX: Add Payment Success & Fulfill Route Here */}
        <Route path="/payment-success" component={PaymentSuccess} />
        
        {/* ✅ FIX: Add /fulfill route for request payment flow */}
        <Route path="/fulfill" component={() => (
          <TelegramLayout><Recharge /></TelegramLayout>
        )} />

        {/* Other Routes */}
        <Route path="/request/:code" component={RequestFulfill} />
        <Route path="/send-recharge" component={SendRecharge} />

        {/* Redirect root to Auth or Dashboard logic */}
        <Route path="/">
          <PublicRoute component={TelegramAuthPage} />
        </Route>

        {/* Auth Routes inside Telegram */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        <Route component={TelegramAuthPage} />
      </Switch>
    );
  }

  // 3. Standard Web Routing
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={() => <PublicRoute component={Login} />} />
        <Route path="/register" component={() => <PublicRoute component={Register} />} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/fulfill" component={Recharge} />
        <Route path="/dashboard" component={DashboardLayout} />
        <Route path="/dashboard/:rest*" component={DashboardLayout} />
        <Route path="/request/:code" component={RequestFulfill} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/security" component={Security} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/help" component={Help} />
        <Route path="/about" component={About} />
        <Route path="/send-recharge" component={SendRecharge} />
        <Route path="/recurring-recharges" component={() => <ProtectedRoute component={RecurringRecharges} />} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <WebSocketProvider>
                <Toaster />
                <Router />
                {/* ✅ ADD THE DIALOG HERE: It will show up anywhere if user is logged in but has no phone */}
                <CompleteProfileDialog />
              </WebSocketProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

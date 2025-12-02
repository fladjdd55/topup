import { Home, Zap, Star, History, Send, User, Users, Settings, LogOut, Clock, Award, TestTube2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTelegramAuth } from '@/hooks/useTelegramAuth'; // ✅ This is the critical import

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  // ✅ Safe check for Telegram environment
  const { isTelegram } = useTelegramAuth();
  
  // If inside Telegram, we return null to hide the sidebar completely
  if (isTelegram) return null;

  const { data: requestsData } = useQuery<{ count: number }>({
    queryKey: ['/api/recharge-requests/count'],
    enabled: !!user,
    refetchInterval: 30000,
  });

  const guestItems = [
    { titleKey: 'dashboard.home', url: '/', icon: Home, testId: 'link-overview' },
    { titleKey: 'dashboard.recharge', url: '/dashboard/recharge', icon: Zap, testId: 'link-recharge' },
  ];

  const userItems = user ? [
    { titleKey: 'dashboard.overview', url: '/dashboard', icon: Home, testId: 'link-overview' },
    { titleKey: 'dashboard.recharge', url: '/dashboard/recharge', icon: Zap, testId: 'link-recharge' },
    { titleKey: 'dashboard.favorites', url: '/dashboard/favorites', icon: Star, testId: 'link-favorites' },
    { titleKey: 'dashboard.history', url: '/dashboard/history', icon: History, testId: 'link-history' },
    { titleKey: 'dashboard.requests', url: '/dashboard/requests', icon: Send, testId: 'link-requests', badge: requestsData?.count || 0 },
  ] : guestItems;

  const advancedItems = [
    { titleKey: 'recurringRecharges', url: '/dashboard/recurring', icon: Clock, testId: 'link-recurring' },
    // { titleKey: 'loyaltyProgram', url: '/dashboard/loyalty', icon: Award, testId: 'link-loyalty' }, // Désactivé temporairement
  ];

  const adminItems = [
    { titleKey: 'dashboard.admin', url: '/dashboard/admin', icon: Users, testId: 'link-admin' },
    { titleKey: 'Test Pays', url: '/dashboard/country-test', icon: TestTube2, testId: 'link-country-test' },
  ];

  const settingsItems = [
    { titleKey: 'dashboard.profile', url: '/dashboard/profile', icon: User, testId: 'link-profile' },
    { titleKey: 'dashboard.settings', url: '/dashboard/settings', icon: Settings, testId: 'link-settings' },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-600">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">TapTopLoad</span>
            <span className="text-xs text-muted-foreground">{t('dashboard.mobile_recharge')}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>{t('dashboard.administration')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.titleKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>{t('dashboard.navigation')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userItems.map((item) => (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
                        <Link href={item.url} data-testid={item.testId}>
                          <item.icon className="h-4 w-4" />
                          <span>{t(item.titleKey)}</span>
                          {item.badge && item.badge > 0 ? (
                            <Badge className="ml-auto" variant="destructive">{item.badge}</Badge>
                          ) : null}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user && (
              <SidebarGroup>
                <SidebarGroupLabel>Fonctionnalités</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {advancedItems.map((item) => (
                      <SidebarMenuItem key={item.titleKey}>
                        <SidebarMenuButton asChild isActive={location === item.url}>
                          <Link href={item.url} data-testid={item.testId}>
                            <item.icon className="h-4 w-4" />
                            <span>{t(item.titleKey)}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>{t('dashboard.account')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild isActive={location === item.url}>
                      <Link href={item.url} data-testid={item.testId}>
                        <item.icon className="h-4 w-4" />
                        <span>{t(item.titleKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-md border border-sidebar-border bg-sidebar-accent p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profilePicture || undefined} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-semibold">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || user?.phone}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email || user?.phone}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            data-testid="button-logout"
            className="hover-elevate active-elevate-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

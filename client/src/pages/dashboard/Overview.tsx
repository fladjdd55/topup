import { useQuery } from '@tanstack/react-query';
import { DollarSign, Activity, TrendingUp, Clock, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { useCountUp } from '@/hooks/useCountUp';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStats {
  totalRecharged: string;
  transactionCount: number;
  successRate: number;
  pendingRequests: number;
  recentTransactions: Transaction[];
}

export default function Overview() {
  const { t, language } = useLanguage();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: 30000,
  });

  // Extract numeric value from totalRecharged string (e.g., "$1,234.56" -> 1234.56)
  const totalAmount = parseFloat(stats?.totalRecharged?.replace(/[$,]/g, '') || '0');
  
  // Animated values
  const animatedAmount = useCountUp(totalAmount, 1500);
  const animatedCount = useCountUp(stats?.transactionCount || 0, 1200);
  const animatedRate = useCountUp(stats?.successRate || 0, 1200);
  const animatedPending = useCountUp(stats?.pendingRequests || 0, 1000);

  // Date locale based on language
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  const statCards = [
    {
      title: t('overview.total_recharged'),
      value: isLoading ? '$0.00' : `$${animatedAmount.toFixed(2)}`,
      icon: DollarSign,
      description: t('overview.total_amount'),
      trend: null,
      bgGradient: 'from-blue-600 to-purple-600',
      testId: 'stat-total-recharged'
    },
    {
      title: t('overview.transactions'),
      value: Math.round(animatedCount),
      icon: Activity,
      description: t('overview.total_completed'),
      trend: null,
      bgGradient: 'from-green-600 to-emerald-600',
      testId: 'stat-transaction-count'
    },
    {
      title: t('overview.success_rate'),
      value: `${animatedRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: t('overview.successful_transactions'),
      trend: stats?.successRate && stats.successRate > 90 ? 'up' : stats?.successRate ? 'down' : null,
      bgGradient: 'from-orange-600 to-red-600',
      testId: 'stat-success-rate'
    },
    {
      title: t('overview.pending_requests'),
      value: Math.round(animatedPending),
      icon: Clock,
      description: t('overview.to_process'),
      trend: null,
      bgGradient: 'from-cyan-600 to-blue-600',
      testId: 'stat-pending-requests'
    },
  ];

  const getStatusColor = (status: string | null) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return t('overview.status_unknown') || 'Unknown';
    const labels: Record<string, string> = {
      pending: t('history.status_pending'),
      processing: t('history.status_processing'),
      completed: t('history.status_completed'),
      failed: t('history.status_failed'),
      cancelled: t('history.status_cancelled'),
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl" data-testid="title-overview">{t('overview.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('overview.subtitle')}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="overflow-hidden" data-testid={card.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br ${card.bgGradient}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold lg:text-3xl">{card.value}</div>
                    {card.trend === 'up' && (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    )}
                    {card.trend === 'down' && (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('overview.recent_transactions')}
            </CardTitle>
            <CardDescription>{t('overview.last_activities')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 rounded-md border border-border p-4 hover-elevate"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                      <Zap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{transaction.phoneNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.createdAt && formatDistanceToNow(new Date(transaction.createdAt), { 
                          addSuffix: true,
                          locale: dateLocale 
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${transaction.amount}</div>
                      <Badge variant={getStatusColor(transaction.status)} className="mt-1">
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <h3 className="mb-2 font-semibold">{t('overview.no_transactions')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('overview.no_transactions_desc')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('overview.quick_actions')}</CardTitle>
            <CardDescription>{language === 'fr' ? 'Raccourcis utiles' : language === 'es' ? 'Accesos útiles' : language === 'ht' ? 'Akses itil' : 'Useful shortcuts'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/dashboard/recharge"
              className="flex items-center gap-3 rounded-md border border-border p-4 hover-elevate active-elevate-2"
              data-testid="link-quick-recharge"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-600">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-semibold">{t('overview.new_recharge')}</div>
                <div className="text-xs text-muted-foreground">{t('overview.recharge_now')}</div>
              </div>
            </a>
            <a
              href="/dashboard/favorites"
              className="flex items-center gap-3 rounded-md border border-border p-4 hover-elevate active-elevate-2"
              data-testid="link-quick-favorites"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-semibold">{t('overview.my_favorites')}</div>
                <div className="text-xs text-muted-foreground">{t('overview.quick_access')}</div>
              </div>
            </a>
            <a
              href="/dashboard/history"
              className="flex items-center gap-3 rounded-md border border-border p-4 hover-elevate active-elevate-2"
              data-testid="link-quick-history"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-semibold">{t('overview.history')}</div>
                <div className="text-xs text-muted-foreground">{t('overview.view_all')}</div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

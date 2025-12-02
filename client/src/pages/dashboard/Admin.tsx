import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, DollarSign, Activity, TrendingUp, Search, User as UserIcon, Trash2, Wallet, CreditCard, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { User, Transaction } from '@shared/schema';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdminStats {
  totalUsers: number;
  totalRevenue: string;
  totalTransactions: number;
  successRate: number;
}

interface DingConnectBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
  error?: string;
}

interface DingConnectTest {
  configured: boolean;
  connected: boolean;
  mode: 'sandbox' | 'production' | 'preprod' | 'none';
  baseUrl?: string;
  message: string;
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [transactionSearch, setTransactionSearch] = useState('');

  const { data: stats, isLoading: loadingStats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000,
  });

  const { data: dingConnectBalance, isLoading: loadingBalance } = useQuery<DingConnectBalance>({
    queryKey: ['/api/admin/dingconnect/balance'],
    refetchInterval: 60000,
  });

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: allTransactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
  });

  const [dingConnectTestResult, setDingConnectTestResult] = useState<DingConnectTest | null>(null);

  const testDingConnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/dingconnect/test', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to test DingConnect');
      return response.json() as Promise<DingConnectTest>;
    },
    onSuccess: (data) => {
      setDingConnectTestResult(data);
      toast({
        title: data.connected ? 'Connexion réussie' : 'Connexion échouée',
        description: data.message,
        variant: data.connected ? 'default' : 'destructive',
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de tester la connexion DingConnect',
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('DELETE', `/api/admin/users/${userId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Utilisateur supprimé',
        description: 'L\'utilisateur a été supprimé avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) =>
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.phone?.toLowerCase().includes(search.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter((transaction) =>
      transaction.phoneNumber?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      transaction.transactionId?.toLowerCase().includes(transactionSearch.toLowerCase())
    );
  }, [allTransactions, transactionSearch]);

  const statCards = [
    {
      title: 'Crédits DingConnect',
      value: dingConnectBalance ? `$${dingConnectBalance.balance.toFixed(2)}` : 'Chargement...',
      subtitle: dingConnectBalance ? `Mis à jour ${format(new Date(dingConnectBalance.lastUpdated), 'HH:mm', { locale: fr })}` : '',
      icon: Wallet,
      bgGradient: 'from-purple-600 to-pink-600',
      testId: 'stat-dingconnect-balance',
      isLoading: loadingBalance
    },
    {
      title: 'Utilisateurs',
      value: stats?.totalUsers || 0,
      subtitle: `${filteredUsers.length} total`,
      icon: Users,
      bgGradient: 'from-blue-600 to-cyan-600',
      testId: 'stat-total-users',
      isLoading: loadingStats
    },
    {
      title: 'Revenu Total',
      value: stats?.totalRevenue || '$0.00',
      subtitle: 'Recharges effectuées',
      icon: DollarSign,
      bgGradient: 'from-green-600 to-emerald-600',
      testId: 'stat-total-revenue',
      isLoading: loadingStats
    },
    {
      title: 'Transactions',
      value: stats?.totalTransactions || 0,
      subtitle: `${stats?.successRate || 0}% succès`,
      icon: Activity,
      bgGradient: 'from-orange-600 to-red-600',
      testId: 'stat-total-transactions',
      isLoading: loadingStats
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'processing': return 'outline';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En cours',
      completed: 'Terminée',
      failed: 'Échouée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl" data-testid="title-admin">Tableau de bord Admin</h1>
        <p className="text-sm text-muted-foreground">Gestion complète de la plateforme TapTopLoad</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} data-testid={card.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br ${card.bgGradient}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {card.isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold lg:text-3xl">{card.value}</div>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DingConnect Status */}
      <Card data-testid="card-dingconnect-status">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            État de la connexion DingConnect
          </CardTitle>
          <CardDescription>
            Vérifiez que votre intégration DingConnect fonctionne correctement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => testDingConnectMutation.mutate()}
              disabled={testDingConnectMutation.isPending}
              data-testid="button-test-dingconnect"
            >
              {testDingConnectMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Test en cours...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tester la connexion
                </>
              )}
            </Button>

            {dingConnectBalance?.error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{dingConnectBalance.error}</span>
              </div>
            )}
          </div>

          {dingConnectTestResult && (
            <div className="rounded-lg border p-4 space-y-3" data-testid="dingconnect-test-result">
              <div className="flex items-center gap-2">
                {dingConnectTestResult.connected ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-medium">
                  {dingConnectTestResult.connected ? 'Connexion réussie' : 'Connexion échouée'}
                </span>
              </div>

              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Configuration:</span>
                  <Badge variant={dingConnectTestResult.configured ? 'default' : 'destructive'}>
                    {dingConnectTestResult.configured ? 'Configurée' : 'Non configurée'}
                  </Badge>
                </div>

                {dingConnectTestResult.mode !== 'none' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Mode:</span>
                      <Badge variant={
                        dingConnectTestResult.mode === 'sandbox' ? 'secondary' : 
                        dingConnectTestResult.mode === 'preprod' ? 'outline' : 
                        'default'
                      }>
                        {dingConnectTestResult.mode === 'sandbox' ? 'Sandbox (Test)' : 
                         dingConnectTestResult.mode === 'preprod' ? 'Pré-Production' : 
                         'Production'}
                      </Badge>
                    </div>
                    {dingConnectTestResult.baseUrl && (
                      <div className="text-xs text-muted-foreground">
                        URL: <code className="bg-background px-1 py-0.5 rounded">{dingConnectTestResult.baseUrl}</code>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-muted-foreground">{dingConnectTestResult.message}</p>

                {!dingConnectTestResult.configured && (
                  <div className="mt-2 p-3 bg-muted rounded-md text-sm">
                    <p className="font-medium mb-2">Pour configurer DingConnect:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Ajoutez DINGCONNECT_API_KEY dans les Secrets</li>
                      <li>Optionnel: DINGCONNECT_SIMULATION="true" pour mode simulation</li>
                      <li>Redémarrez l'application</li>
                    </ol>
                    <p className="mt-2 text-xs">Contactez partnersupport@ding.com pour obtenir une clé API.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gestion des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
          <CardDescription>{filteredUsers.length} utilisateur(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email, téléphone ou nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              {/* Vue tableau pour desktop */}
              <div className="hidden lg:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} data-testid={`user-${user.id}`}>
                        <TableCell className="font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email || user.phone}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.email && <span className="text-sm">{user.email}</span>}
                            {user.phone && <span className="text-sm text-muted-foreground">{user.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role || 'user')}</TableCell>
                        <TableCell>
                          {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr }) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.role !== 'admin' && user.role !== 'super_admin' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setUserToDelete(user)}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Supprimer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Vue cartes pour mobile */}
              <div className="lg:hidden space-y-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} data-testid={`user-card-${user.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email || user.phone}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.createdAt ? format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: fr }) : '-'}
                          </div>
                        </div>
                        {getRoleBadge(user.role || 'user')}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-col gap-1 text-sm">
                        {user.email && <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>}
                        {user.phone && <div className="text-muted-foreground">{user.phone}</div>}
                      </div>
                      {user.role !== 'admin' && user.role !== 'super_admin' && (
                        <div className="pt-2 border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => setUserToDelete(user)}
                            data-testid={`button-delete-user-mobile-${user.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer l'utilisateur
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toutes les transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Transactions</CardTitle>
          <CardDescription>{filteredTransactions.length} transaction(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou ID de transaction..."
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-transactions"
              />
            </div>
          </div>

          {loadingTransactions ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length > 0 ? (
            <>
              {/* Vue tableau pour desktop */}
              <div className="hidden lg:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaction</TableHead>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.slice(0, 20).map((transaction) => (
                      <TableRow key={transaction.id} data-testid={`transaction-${transaction.id}`}>
                        <TableCell className="font-mono text-xs">
                          {transaction.transactionId}
                        </TableCell>
                        <TableCell>{transaction.phoneNumber}</TableCell>
                        <TableCell className="font-semibold">
                          {transaction.amountUsd 
                            ? `$${parseFloat(transaction.amountUsd).toFixed(2)} USD`
                            : `${transaction.amount} ${transaction.currency || 'USD'}`
                          }
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.totalReceivedUsd 
                            ? `$${parseFloat(transaction.totalReceivedUsd).toFixed(2)} USD`
                            : `$${transaction.commission || '0.00'}`
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(transaction.status || 'pending')}>
                            {getStatusLabel(transaction.status || 'pending')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.createdAt
                            ? format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Vue cartes pour mobile */}
              <div className="lg:hidden space-y-4">
                {filteredTransactions.slice(0, 20).map((transaction) => (
                  <Card key={transaction.id} data-testid={`transaction-card-${transaction.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-mono text-xs text-muted-foreground">
                          {transaction.transactionId}
                        </div>
                        <Badge variant={getStatusColor(transaction.status || 'pending')}>
                          {getStatusLabel(transaction.status || 'pending')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">{transaction.phoneNumber}</div>
                        <div className="font-semibold">
                          {transaction.amountUsd 
                            ? `$${parseFloat(transaction.amountUsd).toFixed(2)}`
                            : `${transaction.amount} ${transaction.currency || 'USD'}`
                          }
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t pt-2">
                        <div className="text-muted-foreground">Commission</div>
                        <div className="text-muted-foreground">
                          {transaction.totalReceivedUsd 
                            ? `$${parseFloat(transaction.totalReceivedUsd).toFixed(2)}`
                            : `$${transaction.commission || '0.00'}`
                          }
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.createdAt
                          ? format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })
                          : '-'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Aucune transaction trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <span className="font-semibold">
                {userToDelete?.email || userToDelete?.phone}
              </span>
              ? Cette action est irréversible et supprimera également toutes les données associées à cet utilisateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Check, X, Clock, Phone, DollarSign, User, PlusCircle, Copy, Share2, Link, Trash2, CreditCard } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import type { RechargeRequest } from '@shared/schema';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { validatePhoneNumber } from '@shared/phoneValidation';

export default function Requests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('received');
  
  // État pour le formulaire d'envoi de demande
  const [newRequestForm, setNewRequestForm] = useState({
    phoneNumber: user?.phone || '',
    amount: '',
    message: '',
    senderName: '',
    receiverPhone: '',
  });

  // Auto-remplir le numéro de téléphone de l'utilisateur connecté
  useEffect(() => {
    if (user?.phone && !newRequestForm.phoneNumber) {
      setNewRequestForm(prev => ({ ...prev, phoneNumber: user.phone || '' }));
    }
  }, [user]);

  // Détecter automatiquement la devise basée sur le numéro de téléphone
  const [detectedCurrency, setDetectedCurrency] = useState('USD');
  
  useEffect(() => {
    if (newRequestForm.phoneNumber) {
      const validation = validatePhoneNumber(newRequestForm.phoneNumber);
      if (validation.isValid && validation.currency) {
        setDetectedCurrency(validation.currency);
      }
    }
  }, [newRequestForm.phoneNumber]);

  // Demandes reçues par l'utilisateur
  const { data: receivedRequests, isLoading: loadingReceived } = useQuery<RechargeRequest[]>({
    queryKey: ['/api/recharge-requests'],
    refetchInterval: 10000,
  });
  
  // Demandes envoyées par l'utilisateur
  const { data: sentRequests, isLoading: loadingSent } = useQuery<RechargeRequest[]>({
    queryKey: ['/api/recharge-requests/sent'],
    refetchInterval: 10000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/recharge-requests/${id}/accept`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Demande acceptée',
        description: 'La recharge a été initiée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Échec',
        description: error.message,
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/recharge-requests/${id}/decline`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Demande refusée',
        description: 'La demande a été déclinée',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Échec',
        description: error.message,
      });
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof newRequestForm) => {
      // FIX: Format receiver phone
      let formattedReceiver = data.receiverPhone.trim();
      if (!formattedReceiver.startsWith('+')) {
        formattedReceiver = `+${formattedReceiver}`;
      }

      return apiRequest('POST', '/api/recharge-requests', {
        ...data,
        receiverPhone: formattedReceiver,
        amount: parseFloat(data.amount)
      });
    },
    onSuccess: () => {
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande de recharge a été envoyée avec succès',
      });
      setNewRequestForm({ phoneNumber: user?.phone || '', amount: '', message: '', senderName: '', receiverPhone: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
      setActiveTab('sent');
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Échec de l\'envoi',
        description: error.message,
      });
    },
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestForm.phoneNumber || !newRequestForm.amount || !newRequestForm.receiverPhone) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
      });
      return;
    }

    // FIX: Prevent self-requests
    const normalize = (p: string) => p.replace(/\s+/g, '');
    if (normalize(newRequestForm.phoneNumber) === normalize(newRequestForm.receiverPhone)) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous ne pouvez pas envoyer une demande à votre propre numéro',
      });
      return;
    }

    createRequestMutation.mutate(newRequestForm);
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'secondary';
    switch (status) {
      case 'pending': return 'secondary';
      case 'accepted': return 'default';
      case 'completed': return 'default';
      case 'declined': return 'destructive';
      case 'expired': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string | null) => {
    if (!status) return 'Inconnu';
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'En cours',
      completed: 'Terminé',
      declined: 'Refusée',
      expired: 'Expirée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const pendingReceived = receivedRequests?.filter((r) => r.status === 'pending') || [];
  const acceptedReceived = receivedRequests?.filter((r) => r.status === 'accepted') || [];
  const otherReceived = receivedRequests?.filter((r) => r.status !== 'pending' && r.status !== 'accepted') || [];
  
  const pendingSent = sentRequests?.filter((r) => r.status === 'pending') || [];
  const otherSent = sentRequests?.filter((r) => r.status !== 'pending') || [];

  const copyRequestCode = async (requestCode: string) => {
    try {
      await navigator.clipboard.writeText(requestCode);
      toast({
        title: 'Code copié',
        description: `Le code ${requestCode} a été copié dans le presse-papiers`,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le code',
      });
    }
  };

  const shareRequest = async (request: RechargeRequest) => {
    const requestCode = request.requestCode || `REQ-${request.id}`;
    const message = `Bonjour! Je vous demande de recharger mon numéro:\n\n📱 Numéro: ${request.phoneNumber}\n💵 Montant: $${request.amount}\n🔑 Code: ${requestCode}\n\n${request.message ? `Message: ${request.message}\n\n` : ''}Merci!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Demande de recharge',
          text: message,
        });
        toast({
          title: 'Partagé avec succès',
          description: 'La demande a été partagée',
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') fallbackToWhatsApp(message);
      }
    } else {
      fallbackToWhatsApp(message);
    }
  };

  const fallbackToWhatsApp = (message: string) => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyRequestLink = async (request: RechargeRequest) => {
    const requestCode = request.requestCode || `REQ-${request.id}`;
    const baseUrl = window.location.origin;
    const requestLink = `${baseUrl}/send-recharge?code=${requestCode}`;
    
    try {
      await navigator.clipboard.writeText(requestLink);
      toast({
        title: 'Lien copié',
        description: 'Le lien de la demande a été copié dans le presse-papiers',
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de copier le lien',
      });
    }
  };

  const cancelRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/recharge-requests/${id}/cancel`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Demande annulée',
        description: 'Votre demande a été annulée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Échec',
        description: error.message,
      });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/recharge-requests/${id}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: 'Demande supprimée',
        description: 'La demande a été supprimée avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Échec',
        description: error.message,
      });
    },
  });

  // Updated to use the new Send Recharge page
  const handleFulfillRequest = (request: RechargeRequest) => {
    const requestCode = request.requestCode || '';
    // Redirect to the dedicated send recharge page with the code
    setLocation(`/send-recharge?code=${requestCode}`);
  };

  const renderRequestCard = (request: RechargeRequest, showActions = false, showShareButtons = false) => (
    <Card key={request.id} className={request.status === 'pending' && showActions ? 'border-primary' : ''} data-testid={`request-${request.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-md ${request.status === 'pending' ? 'bg-gradient-to-br from-primary to-purple-600' : 'bg-muted'}`}>
              <Send className={`h-6 w-6 ${request.status === 'pending' ? 'text-white' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <CardTitle className="text-base">
                {request.senderName || 'Demande de recharge'}
              </CardTitle>
              <CardDescription>
                {request.createdAt ? (showActions 
                  ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: fr })
                  : format(new Date(request.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })
                ) : 'Date inconnue'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusColor(request.status)}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Numéro:</span>
            <span className="text-sm font-mono">{request.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Montant:</span>
            <span className="text-sm font-bold">${request.amount}</span>
          </div>
          {request.senderPhone && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">De:</span>
              <span className="text-sm">{request.senderPhone}</span>
            </div>
          )}
          {request.message && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">{request.message}</p>
            </div>
          )}
          {request.expiresAt && request.status === 'pending' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Expire le {format(new Date(request.expiresAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </div>
          )}
        </div>

        {showActions && request.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleFulfillRequest(request)}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid={`button-accept-${request.id}`}
            >
              <Check className="mr-2 h-4 w-4" />
              Payer
            </Button>
            <Button
              variant="destructive"
              onClick={() => declineMutation.mutate(request.id)}
              disabled={declineMutation.isPending}
              className="flex-1"
              data-testid={`button-decline-${request.id}`}
            >
              <X className="mr-2 h-4 w-4" />
              Refuser
            </Button>
          </div>
        )}

        {showActions && request.status === 'accepted' && (
          <div className="space-y-3 pt-4 border-t">
            <div className="rounded-md bg-green-50 dark:bg-green-950 p-3 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                ✓ Demande acceptée
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Vous pouvez maintenant effectuer la recharge
              </p>
            </div>
            <Button
              onClick={() => handleFulfillRequest(request)}
              className="w-full bg-primary"
              data-testid={`button-fulfill-${request.id}`}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Effectuer la recharge
            </Button>
          </div>
        )}

        {showShareButtons && (
          <div className="space-y-3 pt-4 border-t">
            {request.status === 'pending' && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Code de la demande:</span>
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">{request.requestCode || `REQ-${request.id}`}</code>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyRequestLink(request)}
                    data-testid={`button-copy-link-${request.id}`}
                  >
                    <Link className="mr-2 h-4 w-4" />
                    Copier le lien
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyRequestCode(request.requestCode || `REQ-${request.id}`)}
                    data-testid={`button-copy-code-${request.id}`}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Code
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareRequest(request)}
                    className="col-span-2"
                    data-testid={`button-share-${request.id}`}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => cancelRequestMutation.mutate(request.id)}
                  disabled={cancelRequestMutation.isPending}
                  className="w-full"
                  data-testid={`button-cancel-${request.id}`}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler la demande
                </Button>
              </>
            )}
            {request.status === 'accepted' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => cancelRequestMutation.mutate(request.id)}
                disabled={cancelRequestMutation.isPending}
                className="w-full"
                data-testid={`button-delete-${request.id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
            {(request.status === 'completed' || request.status === 'declined' || request.status === 'cancelled' || request.status === 'expired') && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteRequestMutation.mutate(request.id)}
                disabled={deleteRequestMutation.isPending}
                className="w-full"
                data-testid={`button-delete-${request.id}`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
          </div>
        )}

        {!showActions && !showShareButtons && (request.status === 'completed' || request.status === 'declined' || request.status === 'cancelled' || request.status === 'expired') && (
          <div className="pt-4 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteRequestMutation.mutate(request.id)}
              disabled={deleteRequestMutation.isPending}
              className="w-full"
              data-testid={`button-delete-${request.id}`}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl" data-testid="title-requests">Demandes de Recharge</h1>
        <p className="text-sm text-muted-foreground">
          Envoyez et gérez vos demandes de recharge
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received" data-testid="tab-received">
            Reçues {pendingReceived.length > 0 && <Badge className="ml-2" variant="destructive">{pendingReceived.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="send" data-testid="tab-send">
            <PlusCircle className="mr-2 h-4 w-4" />
            Envoyer
          </TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">
            Envoyées {pendingSent.length > 0 && <Badge className="ml-2">{pendingSent.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Onglet: Demandes Reçues */}
        <TabsContent value="received" className="mt-6">
          {loadingReceived ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <>
              {pendingReceived.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">En attente ({pendingReceived.length})</h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {pendingReceived.map((request) => renderRequestCard(request, true))}
                  </div>
                </div>
              )}

              {acceptedReceived.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold">Acceptées ({acceptedReceived.length})</h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {acceptedReceived.map((request) => renderRequestCard(request, true))}
                  </div>
                </div>
              )}

              {otherReceived.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h2 className="text-lg font-semibold">Historique</h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {otherReceived.map((request) => renderRequestCard(request, false))}
                  </div>
                </div>
              )}

              {receivedRequests && receivedRequests.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Send className="mb-4 h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mb-2 text-lg font-semibold">Aucune demande reçue</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Vous n'avez reçu aucune demande de recharge
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Onglet: Envoyer une Demande */}
        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Demande de Recharge</CardTitle>
              <CardDescription>Demandez à quelqu'un de recharger votre numéro</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Votre numéro (à recharger)</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+509 1234 5678"
                    value={newRequestForm.phoneNumber}
                    disabled={!!user?.phone} 
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, phoneNumber: e.target.value })}
                    required
                    data-testid="input-request-phone"
                    className={user?.phone ? "bg-muted cursor-not-allowed" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce numéro est celui de votre compte
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receiverPhone">Numéro du destinataire <span className="text-destructive">*</span></Label>
                  <Input
                    id="receiverPhone"
                    type="tel"
                    placeholder="+1 234 567 8900 (celui qui va payer)"
                    value={newRequestForm.receiverPhone}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, receiverPhone: e.target.value })}
                    required
                    data-testid="input-request-receiver-phone"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le destinataire recevra un SMS avec le lien pour payer la recharge
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Montant ({detectedCurrency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="10.00"
                    value={newRequestForm.amount}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, amount: e.target.value })}
                    required
                    data-testid="input-request-amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senderName">Votre nom (optionnel)</Label>
                  <Input
                    id="senderName"
                    type="text"
                    placeholder="Jean Dupont"
                    value={newRequestForm.senderName}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, senderName: e.target.value })}
                    data-testid="input-request-sender-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    placeholder="Ajoutez un message..."
                    value={newRequestForm.message}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, message: e.target.value })}
                    rows={3}
                    data-testid="input-request-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createRequestMutation.isPending}
                  data-testid="button-send-request"
                >
                  {createRequestMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet: Demandes Envoyées */}
        <TabsContent value="sent" className="mt-6">
          {loadingSent ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <>
              {pendingSent.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">En cours ({pendingSent.length})</h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {pendingSent.map((request) => renderRequestCard(request, false, true))}
                  </div>
                </div>
              )}

              {otherSent.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Historique</h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {otherSent.map((request) => renderRequestCard(request, false, true))}
                  </div>
                </div>
              )}

              {sentRequests && sentRequests.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <PlusCircle className="mb-4 h-16 w-16 text-muted-foreground/50" />
                    <h3 className="mb-2 text-lg font-semibold">Aucune demande envoyée</h3>
                    <p className="text-center text-sm text-muted-foreground">
                      Vous n'avez pas encore envoyé de demande de recharge
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

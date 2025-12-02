import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, Check, X, Phone, DollarSign, PlusCircle, 
  Copy, Share2, Link, Trash2, AlertCircle, RefreshCw, WifiOff, Loader2 
} from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale'; // Import locales
import { validatePhoneNumber } from '@shared/phoneValidation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// ✅ IMPORT TRANSLATION HOOK
import { useLanguage } from '@/contexts/LanguageContext';

const sanitizeMessage = (message: string): string => {
  return message.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').slice(0, 500);
};

export default function Requests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('received');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // ✅ GET TRANSLATION FUNCTION & LANGUAGE
  const { t, language } = useLanguage();

  // Date locale map
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); queryClient.invalidateQueries(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [queryClient]);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const lastSubmitTime = useRef<number>(0);
  const MIN_SUBMIT_INTERVAL = 3000;
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; actionLabel?: string; variant?: 'default' | 'destructive'; onConfirm: () => void; } | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [newRequestForm, setNewRequestForm] = useState({ phoneNumber: user?.phone || '', amount: '', message: '', senderName: '', receiverPhone: '' });
  const [detectedCurrency, setDetectedCurrency] = useState('USD');

  useEffect(() => { if (user?.phone && !newRequestForm.phoneNumber) setNewRequestForm(prev => ({ ...prev, phoneNumber: user.phone || '' })); }, [user]);

  useEffect(() => {
    if (newRequestForm.phoneNumber) {
      const validation = validatePhoneNumber(newRequestForm.phoneNumber);
      if (validation.isValid && validation.currency) setDetectedCurrency(validation.currency);
    }
  }, [newRequestForm.phoneNumber]);

  const { data: receivedRequests, isLoading: loadingReceived, error: receivedError } = useQuery<RechargeRequest[]>({
    queryKey: ['/api/recharge-requests'], refetchInterval: 10000, retry: 3, staleTime: 5000,
  });
  const { data: sentRequests, isLoading: loadingSent } = useQuery<RechargeRequest[]>({
    queryKey: ['/api/recharge-requests/sent'], refetchInterval: 10000,
  });

  const clearActionLoading = (id: number) => {
    setActionLoading(prev => { const newState = { ...prev }; delete newState[id]; return newState; });
  };

  const acceptMutation = useMutation({
    mutationFn: async (id: number) => {
      setActionLoading(prev => ({ ...prev, [id]: 'accepting' }));
      return apiRequest('POST', `/api/recharge-requests/${id}/accept`, undefined);
    },
    onSuccess: () => {
      toast({ title: t('toast.request_accepted') });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: Error) => toast({ variant: 'destructive', title: t('toast.error'), description: error.message }),
    onSettled: (data, error, id) => clearActionLoading(id)
  });

  const declineMutation = useMutation({
    mutationFn: async (id: number) => {
      setActionLoading(prev => ({ ...prev, [id]: 'declining' }));
      return apiRequest('POST', `/api/recharge-requests/${id}/decline`, undefined);
    },
    onSuccess: () => {
      toast({ title: t('toast.request_declined') });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests'] });
    },
    onError: (error: Error) => toast({ variant: 'destructive', title: t('toast.error'), description: error.message }),
    onSettled: (data, error, id) => clearActionLoading(id)
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      setActionLoading(prev => ({ ...prev, [id]: 'cancelling' }));
      return apiRequest('POST', `/api/recharge-requests/${id}/cancel`, undefined);
    },
    onSuccess: () => {
      toast({ title: t('toast.request_cancelled') });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
    },
    onError: (error: Error) => toast({ variant: 'destructive', title: t('toast.error'), description: error.message }),
    onSettled: (data, error, id) => clearActionLoading(id)
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: number) => {
      setActionLoading(prev => ({ ...prev, [id]: 'deleting' }));
      return apiRequest('DELETE', `/api/recharge-requests/${id}`, undefined);
    },
    onSuccess: () => {
      toast({ title: t('toast.request_deleted') });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
    },
    onError: (error: Error) => toast({ variant: 'destructive', title: t('toast.error'), description: error.message }),
    onSettled: (data, error, id) => clearActionLoading(id)
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof newRequestForm) => {
      let formattedReceiver = data.receiverPhone.trim();
      if (!formattedReceiver.startsWith('+')) formattedReceiver = `+${formattedReceiver}`;
      return await apiRequest('POST', '/api/recharge-requests', {
        ...data,
        receiverPhone: formattedReceiver,
        message: sanitizeMessage(data.message),
        amount: data.amount,
        currency: detectedCurrency
      });
    },
    onSuccess: () => {
      toast({ title: t('toast.request_sent') });
      setNewRequestForm({ phoneNumber: user?.phone || '', amount: '', message: '', senderName: '', receiverPhone: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
      setActiveTab('sent');
    },
    onError: (error: Error) => toast({ variant: 'destructive', title: t('toast.error'), description: error.message }),
  });

  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };
    switch (field) {
      case 'phoneNumber':
      case 'receiverPhone':
        if (value) {
          const validation = validatePhoneNumber(value);
          if (!validation.isValid) errors[field] = t('validation.phone_invalid');
          else delete errors[field];
        } else delete errors[field];
        break;
      case 'amount':
        const amount = parseFloat(value);
        if (value && (isNaN(amount) || amount <= 0)) errors[field] = t('validation.amount_positive');
        else delete errors[field];
        break;
    }
    setValidationErrors(errors);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() - lastSubmitTime.current < MIN_SUBMIT_INTERVAL) {
      toast({ variant: 'destructive', title: t('toast.too_fast') });
      return;
    }
    lastSubmitTime.current = Date.now();
    
    if (Object.keys(validationErrors).length > 0 || !newRequestForm.amount || !newRequestForm.receiverPhone) {
        // Simple check
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
    if (!status) return 'Unknown';
    // ✅ Use translation keys
    return t(`status.${status}`) || status;
  };

  // Handlers
  const handleDecline = (request: RechargeRequest) => {
    setConfirmDialog({
      open: true, title: t('requests.reject') + '?', description: '',
      variant: 'destructive', actionLabel: t('requests.reject'),
      onConfirm: () => { declineMutation.mutate(request.id); setConfirmDialog(null); }
    });
  };
  const handleCancel = (request: RechargeRequest) => {
    setConfirmDialog({
      open: true, title: t('requests.cancel') + '?', description: '',
      variant: 'destructive', actionLabel: t('requests.cancel'),
      onConfirm: () => { cancelRequestMutation.mutate(request.id); setConfirmDialog(null); }
    });
  };
  const handleDelete = (request: RechargeRequest) => {
    setConfirmDialog({
      open: true, title: t('requests.delete') + '?', description: '',
      variant: 'destructive', actionLabel: t('requests.delete'),
      onConfirm: () => { deleteRequestMutation.mutate(request.id); setConfirmDialog(null); }
    });
  };
  const handleFulfillRequest = (request: RechargeRequest) => setLocation(`/request/${request.requestCode}`);
  const copyRequestCode = async (code: string) => { await navigator.clipboard.writeText(code); toast({ title: t('toast.copied') }); };
  const copyRequestLink = async (r: RechargeRequest) => {
    const url = `${window.location.origin}/request/${r.requestCode}`;
    await navigator.clipboard.writeText(url);
    toast({ title: t('toast.copied') });
  };
  const shareRequest = async (r: RechargeRequest) => {
    const url = `${window.location.origin}/request/${r.requestCode}`;
    if (navigator.share) try { await navigator.share({ title: 'Recharge', text: url }); } catch (e) {}
    else window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  };

  const renderRequestCard = (request: RechargeRequest, showActions = false, showShareButtons = false) => {
    const isLoadingAction = !!actionLoading[request.id];
    const loadingType = actionLoading[request.id];
    const displayPhone = showShareButtons ? request.receiverPhone : request.phoneNumber;
    const displayLabel = showShareButtons ? t('requests.to') : t('requests.from');

    return (
      <Card key={request.id} className={request.status === 'pending' && showActions ? 'border-primary' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-md ${request.status === 'pending' ? 'bg-gradient-to-br from-primary to-purple-600' : 'bg-muted'}`}>
                <Send className={`h-6 w-6 ${request.status === 'pending' ? 'text-white' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <CardTitle className="text-base">{showShareButtons ? t('requests.sent_label') : (request.senderName || t('requests.default_title'))}</CardTitle>
                <CardDescription>
                  {request.createdAt ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: dateLocale }) : ''}
                </CardDescription>
              </div>
            </div>
            <Badge variant={getStatusColor(request.status)}>{getStatusLabel(request.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{displayLabel}</span>
              <span className="text-sm font-mono font-bold">{displayPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-bold">${request.amount}</span>
            </div>
            {request.message && <div className="rounded-md bg-muted p-3"><p className="text-sm whitespace-pre-wrap break-words">{request.message}</p></div>}
          </div>

          {showActions && request.status === 'pending' && (
            <div className="flex gap-2">
              <Button onClick={() => handleFulfillRequest(request)} disabled={isLoadingAction} className="flex-1 bg-green-600 hover:bg-green-700">
                <Check className="mr-2 h-4 w-4" /> {t('requests.pay_now')}
              </Button>
              <Button variant="destructive" onClick={() => handleDecline(request)} disabled={isLoadingAction} className="flex-1">
                {loadingType === 'declining' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><X className="mr-2 h-4 w-4" /> {t('requests.reject')}</>}
              </Button>
            </div>
          )}

          {showShareButtons && request.status === 'pending' && (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t">
              <Button size="sm" variant="outline" onClick={() => copyRequestCode(request.requestCode || '')}>
                <Copy className="mr-2 h-4 w-4" /> {t('requests.copy_code')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => copyRequestLink(request)}>
                <Link className="mr-2 h-4 w-4" /> {t('requests.copy_link')}
              </Button>
              <Button size="sm" variant="outline" onClick={() => shareRequest(request)} className="col-span-2">
                <Share2 className="mr-2 h-4 w-4" /> {t('requests.share')}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleCancel(request)} disabled={isLoadingAction} className="col-span-2">
                {loadingType === 'cancelling' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><X className="mr-2 h-4 w-4" /> {t('requests.cancel')}</>}
              </Button>
            </div>
          )}

          {!showActions && !showShareButtons && (['completed', 'declined', 'cancelled', 'expired'].includes(request.status || '')) && (
            <div className="pt-4 border-t">
              <Button size="sm" variant="outline" onClick={() => handleDelete(request)} disabled={isLoadingAction} className="w-full">
                {loadingType === 'deleting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Trash2 className="mr-2 h-4 w-4" /> {t('requests.delete')}</>}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {!isOnline && <Card className="border-yellow-500 bg-yellow-50 mb-4"><CardContent className="pt-6 flex items-center justify-center gap-2"><WifiOff className="text-yellow-600 h-5 w-5" /><p className="text-center text-yellow-800 font-medium">Offline</p></CardContent></Card>}

      <div>
        <h1 className="text-2xl font-bold lg:text-3xl" data-testid="title-requests">{t('requests.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('requests.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received">{t('requests.received')} {receivedRequests?.filter(r => r.status === 'pending').length ? <Badge className="ml-2" variant="destructive">{receivedRequests?.filter(r => r.status === 'pending').length}</Badge> : null}</TabsTrigger>
          <TabsTrigger value="send"><PlusCircle className="mr-2 h-4 w-4" /> {t('requests.new_request')}</TabsTrigger>
          <TabsTrigger value="sent">{t('requests.sent')} {sentRequests?.filter(r => r.status === 'pending').length ? <Badge className="ml-2">{sentRequests?.filter(r => r.status === 'pending').length}</Badge> : null}</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {loadingReceived ? <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div> : 
           receivedRequests && receivedRequests.length > 0 ? 
           <div className="grid gap-4 lg:grid-cols-2">{receivedRequests.map(r => renderRequestCard(r, true))}</div> : 
           <div className="text-center py-12 text-muted-foreground">Aucune demande</div>
          }
        </TabsContent>

        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader><CardTitle>{t('requests.new_request')}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label>Votre numéro</Label>
                  <Input value={newRequestForm.phoneNumber} disabled={!!user?.phone} onChange={e => setNewRequestForm({...newRequestForm, phoneNumber: e.target.value.replace(/[^0-9+]/g, '')})} onBlur={e => validateField('phoneNumber', e.target.value)} className={validationErrors.phoneNumber ? "border-red-500" : ""} />
                </div>
                <div className="space-y-2">
                  <Label>Destinataire</Label>
                  <Input value={newRequestForm.receiverPhone} onChange={e => setNewRequestForm({...newRequestForm, receiverPhone: e.target.value.replace(/[^0-9+]/g, '')})} onBlur={e => validateField('receiverPhone', e.target.value)} className={validationErrors.receiverPhone ? "border-red-500" : ""} placeholder="+509..." />
                </div>
                <div className="space-y-2">
                  <Label>Montant</Label>
                  <Input type="text" inputMode="decimal" value={newRequestForm.amount} onChange={e => { const val = e.target.value.replace(/[^0-9.]/g, ''); if ((val.match(/\./g) || []).length <= 1) setNewRequestForm({...newRequestForm, amount: val}); }} onBlur={e => validateField('amount', e.target.value)} className={validationErrors.amount ? "border-red-500" : ""} placeholder="10.00" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={newRequestForm.message} onChange={e => setNewRequestForm({...newRequestForm, message: e.target.value})} placeholder="..." />
                </div>
                <Button type="submit" className="w-full" disabled={createRequestMutation.isPending || Object.keys(validationErrors).length > 0}>{createRequestMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Envoyer'}</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {loadingSent ? <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-48" /></div> : 
           sentRequests && sentRequests.length > 0 ?
           <div className="grid gap-4 lg:grid-cols-2">{sentRequests.map(r => renderRequestCard(r, false, true))}</div> :
           <div className="text-center py-12 text-muted-foreground">Aucune demande envoyée</div>
          }
        </TabsContent>
      </Tabs>

      {confirmDialog && (
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle><AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={confirmDialog.onConfirm} className={confirmDialog.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}>{confirmDialog.actionLabel}</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

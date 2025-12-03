import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Plus, Smartphone, ArrowDownLeft, ArrowUpRight, User, Copy, Link, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RechargeRequest } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext"; 
// ✅ Haptic Feedback Hook
import { useTelegramHaptic } from "@/hooks/useTelegramHaptic";

export default function TelegramDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const { t } = useLanguage(); 
  
  // ✅ Initialize Haptics
  const { trigger, notify, selection } = useTelegramHaptic();

  const dateLocale = enUS;

  // --- Requests Logic ---
  const { data: receivedRequests, isLoading: loadingReceived } = useQuery<RechargeRequest[]>({
    queryKey: ['/api/recharge-requests'],
    refetchInterval: 10000,
  });
  
  const { data: sentRequests, isLoading: loadingSent } = useQuery<RechargeRequest[]>({
    queryKey: ['/api/recharge-requests/sent'],
    refetchInterval: 10000,
  });

  const [newRequest, setNewRequest] = useState({
    phoneNumber: user?.phone || '',
    amount: '',
    message: '',
    receiverPhone: '',
  });

  // ✅ Ref to keep track of latest state for the Telegram Button callback
  const requestStateRef = useRef(newRequest);
  
  useEffect(() => {
    requestStateRef.current = newRequest;
  }, [newRequest]);

  const createRequestMutation = useMutation({
    mutationFn: async (data: typeof newRequest) => {
      let formattedReceiver = data.receiverPhone.trim();
      if (!formattedReceiver.startsWith('+')) {
        formattedReceiver = `+${formattedReceiver}`;
      }
      return apiRequest('POST', '/api/recharge-requests', {
        ...data,
        receiverPhone: formattedReceiver,
        senderName: user?.firstName || 'Friend',
        currency: 'USD'
      });
    },
    onSuccess: () => {
      // ✅ Haptic Success
      notify('success');
      toast({ title: t('toast.request_sent') });
      setIsAskModalOpen(false);
      setNewRequest({ phoneNumber: user?.phone || '', amount: '', message: '', receiverPhone: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
      
      // Hide button on success
      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.MainButton.hide();
    },
    onError: (error: Error) => {
      // ✅ Haptic Error
      notify('error');
      toast({ variant: 'destructive', title: t('toast.error'), description: error.message });
      // Re-enable button on error
      const tg = (window as any).Telegram?.WebApp;
      if (tg) tg.MainButton.showProgress(false);
    },
  });

  // ✅ FIXED: Wrapped in useCallback to ensure stable reference and correct closure
  const handleCreateRequest = useCallback(() => {
    const currentData = requestStateRef.current;

    if (createRequestMutation.isPending) return;

    if (!currentData.amount || !currentData.receiverPhone) {
      notify('error'); // Haptic feedback on validation error
      toast({ variant: 'destructive', title: t('toast.error'), description: t('payment.form_validation_error') });
      return;
    }
    
    // Trigger impact when starting the request
    trigger('medium');

    const tg = (window as any).Telegram?.WebApp;
    if (tg) tg.MainButton.showProgress(true);
    
    createRequestMutation.mutate(currentData);
  }, [createRequestMutation, toast, t, notify, trigger]);

  // ✅ TELEGRAM MAIN BUTTON INTEGRATION
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    const mainButton = tg.MainButton;

    if (isAskModalOpen) {
      mainButton.setText(t('requests.send_request').toUpperCase());
      mainButton.show();
      mainButton.onClick(handleCreateRequest);
    } else {
      mainButton.hide();
      mainButton.offClick(handleCreateRequest);
    }

    return () => {
      mainButton.offClick(handleCreateRequest);
      mainButton.hide();
    };
  }, [isAskModalOpen, t, handleCreateRequest]); 

  const copyLink = async (code: string) => {
    trigger('light'); // Haptic on copy
    const url = `${window.location.origin}/request/${code}`;
    await navigator.clipboard.writeText(url);
    toast({ title: t('toast.copied') });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`status.${status}`) || status;
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* 1. Header & Balance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('nav.hello')},</p>
            <h1 className="text-xl font-bold">{user?.firstName || 'User'} 👋</h1>
          </div>
          <div 
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer"
            onClick={() => {
              trigger('light');
              setLocation("/dashboard/profile");
            }}
          >
            {user?.firstName?.charAt(0) || "U"}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#24A1DE] to-[#208bbf] p-5 text-white shadow-lg">
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-medium mb-1">{t('overview.total_amount')}</p>
            <h2 className="text-3xl font-bold mb-4">$0.00 <span className="text-sm opacity-80">USD</span></h2>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm h-8 text-xs px-3"
                onClick={() => {
                  trigger('light');
                  setLocation("/dashboard/recharge");
                }}
              >
                <Plus className="mr-1 h-3 w-3" /> {t('favorites.add')}
              </Button>
              <Button 
                size="sm" 
                className="bg-white text-[#24A1DE] hover:bg-gray-50 border-0 h-8 text-xs px-3"
                onClick={() => {
                  trigger('light');
                  setLocation("/dashboard/recharge");
                }}
              >
                <Zap className="mr-1 h-3 w-3 fill-current" /> {t('dashboard.recharge')}
              </Button>
            </div>
          </div>
          <div className="absolute right-[-10px] top-[-10px] h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        </div>
      </div>

      {/* 2. Services (Quick Actions) */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t('footer.services')}</h3>
        <div className="grid grid-cols-3 gap-3">
          
          {/* Recharge Mobile */}
          <Card 
            className="border-0 shadow-sm active:scale-95 transition-transform cursor-pointer bg-card"
            onClick={() => {
              trigger('light');
              setLocation("/dashboard/recharge");
            }}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Smartphone className="h-4 w-4" />
              </div>
              <span className="font-medium text-[10px] leading-tight">{t('dashboard.mobile_recharge')}</span>
            </CardContent>
          </Card>

          {/* Ask a Friend Modal Trigger */}
          <Dialog 
            open={isAskModalOpen} 
            onOpenChange={(open) => {
              if (open) trigger('light');
              setIsAskModalOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Card className="border-0 shadow-sm active:scale-95 transition-transform cursor-pointer bg-card">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 h-full">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-[10px] leading-tight">{t('requests.new_request')}</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md top-[20%] translate-y-0">
               <DialogHeader>
                <DialogTitle>{t('requests.new_request')}</DialogTitle>
                <DialogDescription>{t('requests.new_request_desc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1">
                  <Label>{t('recharge.phone_number_label')} (Vous)</Label>
                  <Input 
                    value={newRequest.phoneNumber} 
                    onChange={e => setNewRequest({...newRequest, phoneNumber: e.target.value})}
                    placeholder="+509..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('requests.to')}</Label>
                  <Input 
                    value={newRequest.receiverPhone} 
                    onChange={e => setNewRequest({...newRequest, receiverPhone: e.target.value})}
                    placeholder="+1..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('recharge.amount_label')}</Label>
                  <Input 
                    type="number" 
                    value={newRequest.amount} 
                    onChange={e => setNewRequest({...newRequest, amount: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-1">
                  <Label>{t('requests.message_label')}</Label>
                  <Input 
                    value={newRequest.message} 
                    onChange={e => setNewRequest({...newRequest, message: e.target.value})}
                    placeholder="..."
                  />
                </div>
              </div>
              {/* ✅ BUTTON HIDDEN: Use Telegram Main Button instead */}
            </DialogContent>
          </Dialog>

          {/* Gift (Send Recharge) */}
          <Card 
            className="border-0 shadow-sm active:scale-95 transition-transform cursor-pointer bg-card"
            onClick={() => {
              trigger('light');
              setLocation("/send-recharge");
            }}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <Gift className="h-4 w-4" />
              </div>
              <span className="font-medium text-[10px] leading-tight">{t('hero.gift_recharge')}</span>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 3. Requests Tabs */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t('dashboard.requests')}</h3>
        
        {/* ✅ Tab Selection Haptic */}
        <Tabs defaultValue="received" className="w-full" onValueChange={() => selection()}>
          <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
            <TabsTrigger value="received" className="text-xs">{t('requests.received')} {receivedRequests?.filter(r => r.status === 'pending').length ? `(${receivedRequests.filter(r => r.status === 'pending').length})` : ''}</TabsTrigger>
            <TabsTrigger value="sent" className="text-xs">{t('requests.sent')}</TabsTrigger>
          </TabsList>

          {/* RECEIVED */}
          <TabsContent value="received" className="space-y-3 mt-0">
            {loadingReceived ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : receivedRequests?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs bg-muted/30 rounded-xl">
                {t('requests.no_received')}
              </div>
            ) : (
              receivedRequests?.map((req) => (
                <Card key={req.id} className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <ArrowDownLeft className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{req.senderName || 'Ami'}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {req.createdAt ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: dateLocale }) : ''}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(req.status)} shadow-none`}>
                        {getStatusLabel(req.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg mb-3">
                      <span className="text-xs font-medium">{req.phoneNumber}</span>
                      <span className="text-sm font-bold text-primary">${req.amount}</span>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 h-8 text-xs"
                          onClick={() => {
                            trigger('light');
                            setLocation(`/request/${req.requestCode}`);
                          }}
                        >
                          {t('requests.pay_now')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 shrink-0"
                          onClick={() => copyLink(req.requestCode || '')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* SENT */}
          <TabsContent value="sent" className="space-y-3 mt-0">
            {loadingSent ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : sentRequests?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs bg-muted/30 rounded-xl">
                {t('requests.no_sent')} <br/>
                <span 
                  className="text-primary cursor-pointer" 
                  onClick={() => {
                    trigger('light');
                    setIsAskModalOpen(true);
                  }}
                >
                  {t('requests.new_request')} ?
                </span>
              </div>
            ) : (
              sentRequests?.map((req) => (
                <Card key={req.id} className="border-0 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t('requests.sent_label')}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {req.createdAt ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: dateLocale }) : ''}
                          </p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(req.status)} shadow-none`}>
                        {getStatusLabel(req.status)}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded-lg mb-3">
                      <span className="text-xs font-medium">{req.receiverPhone}</span>
                      <span className="text-sm font-bold">${req.amount}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs"
                        onClick={() => copyLink(req.requestCode || '')}
                      >
                        <Link className="mr-1 h-3 w-3" /> {t('requests.copy_link')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs"
                        onClick={() => copyLink(req.requestCode || '')}
                      >
                        <Copy className="mr-1 h-3 w-3" /> {t('requests.copy_code')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Plus, Smartphone, ArrowDownLeft, ArrowUpRight, User, Copy, Check, Link, Gift } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RechargeRequest } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext"; 

export default function TelegramDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const { t } = useLanguage(); // Defaults to English via Context if set

  // Force English locale for dates in this view if preferred
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
      toast({ title: 'Request sent!' });
      setIsAskModalOpen(false);
      setNewRequest({ phoneNumber: user?.phone || '', amount: '', message: '', receiverPhone: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/recharge-requests/sent'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleCreateRequest = () => {
    if (!newRequest.amount || !newRequest.receiverPhone) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in required fields' });
      return;
    }
    createRequestMutation.mutate(newRequest);
  };

  const copyLink = async (code: string) => {
    const url = `${window.location.origin}/request/${code}`;
    await navigator.clipboard.writeText(url);
    toast({ title: 'Link copied' });
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
    // Manual English map if translation fails
    const map: Record<string, string> = {
        pending: 'Pending',
        completed: 'Completed',
        declined: 'Declined',
        cancelled: 'Cancelled'
    };
    return map[status] || status;
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* 1. Header & Balance */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Hello,</p>
            <h1 className="text-xl font-bold">{user?.firstName || 'User'} 👋</h1>
          </div>
          <div 
            className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer"
            onClick={() => setLocation("/dashboard/profile")}
          >
            {user?.firstName?.charAt(0) || "U"}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#24A1DE] to-[#208bbf] p-5 text-white shadow-lg">
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-medium mb-1">Available Balance</p>
            <h2 className="text-3xl font-bold mb-4">$0.00 <span className="text-sm opacity-80">USD</span></h2>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm h-8 text-xs px-3"
                onClick={() => setLocation("/dashboard/recharge")}
              >
                <Plus className="mr-1 h-3 w-3" /> Add Funds
              </Button>
              <Button 
                size="sm" 
                className="bg-white text-[#24A1DE] hover:bg-gray-50 border-0 h-8 text-xs px-3"
                onClick={() => setLocation("/dashboard/recharge")}
              >
                <Zap className="mr-1 h-3 w-3 fill-current" /> Top-up
              </Button>
            </div>
          </div>
          <div className="absolute right-[-10px] top-[-10px] h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        </div>
      </div>

      {/* 2. Services (Quick Actions) */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Services</h3>
        <div className="grid grid-cols-3 gap-3">
          
          {/* Recharge Mobile */}
          <Card 
            className="border-0 shadow-sm active:scale-95 transition-transform cursor-pointer bg-card"
            onClick={() => setLocation("/dashboard/recharge")}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Smartphone className="h-4 w-4" />
              </div>
              <span className="font-medium text-[10px] leading-tight">Mobile Top-up</span>
            </CardContent>
          </Card>

          {/* Ask a Friend */}
          <Dialog open={isAskModalOpen} onOpenChange={setIsAskModalOpen}>
            <DialogTrigger asChild>
              <Card className="border-0 shadow-sm active:scale-95 transition-transform cursor-pointer bg-card">
                <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 h-full">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-[10px] leading-tight">Ask a Friend</span>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md top-[20%] translate-y-0">
               <DialogHeader>
                <DialogTitle>New Request</DialogTitle>
                <DialogDescription>Ask a friend to top up your number.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1">
                  <Label>Your Number</Label>
                  <Input 
                    value={newRequest.phoneNumber} 
                    onChange={e => setNewRequest({...newRequest, phoneNumber: e.target.value})}
                    placeholder="+509..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Friend's Number</Label>
                  <Input 
                    value={newRequest.receiverPhone} 
                    onChange={e => setNewRequest({...newRequest, receiverPhone: e.target.value})}
                    placeholder="+1..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Amount (USD)</Label>
                  <Input 
                    type="number" 
                    value={newRequest.amount} 
                    onChange={e => setNewRequest({...newRequest, amount: e.target.value})}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Message (Optional)</Label>
                  <Input 
                    value={newRequest.message} 
                    onChange={e => setNewRequest({...newRequest, message: e.target.value})}
                    placeholder="..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateRequest} disabled={createRequestMutation.isPending} className="w-full">
                  {createRequestMutation.isPending ? 'Sending...' : 'Send Request'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Gift (Send Recharge) */}
          <Card 
            className="border-0 shadow-sm active:scale-95 transition-transform cursor-pointer bg-card"
            onClick={() => setLocation("/send-recharge")}
          >
            <CardContent className="p-3 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <Gift className="h-4 w-4" />
              </div>
              <span className="font-medium text-[10px] leading-tight">Send Gift</span>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 3. Requests Tabs */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Requests</h3>
        
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
            <TabsTrigger value="received" className="text-xs">Received {receivedRequests?.filter(r => r.status === 'pending').length ? `(${receivedRequests.filter(r => r.status === 'pending').length})` : ''}</TabsTrigger>
            <TabsTrigger value="sent" className="text-xs">Sent</TabsTrigger>
          </TabsList>

          {/* RECEIVED */}
          <TabsContent value="received" className="space-y-3 mt-0">
            {loadingReceived ? (
              <Skeleton className="h-20 w-full rounded-xl" />
            ) : receivedRequests?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs bg-muted/30 rounded-xl">
                No requests received
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
                          <p className="text-sm font-medium">{req.senderName || 'Friend'}</p>
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
                          onClick={() => setLocation(`/request/${req.requestCode}`)}
                        >
                          Pay Now
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
                No requests sent. <br/>
                <span className="text-primary cursor-pointer" onClick={() => setIsAskModalOpen(true)}>Ask a friend?</span>
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
                          <p className="text-sm font-medium">Request Sent</p>
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
                        <Link className="mr-1 h-3 w-3" /> Copy Link
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs"
                        onClick={() => copyLink(req.requestCode || '')}
                      >
                        <Copy className="mr-1 h-3 w-3" /> Copy Code
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

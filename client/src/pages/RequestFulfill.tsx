import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, DollarSign, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { RechargeRequest } from '@shared/schema';

export default function RequestFulfill() {
  const [, params] = useRoute('/request/:code');
  const [, setLocation] = useLocation();
  const code = params?.code;
  const [sessionToken, setSessionToken] = useState<string>('');

  useEffect(() => {
    // Generate a unique session token for this fulfillment
    const token = `fulfill_${code}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionToken(token);
    
    // Store in localStorage to track this fulfillment session
    localStorage.setItem('fulfillment_session', token);
    localStorage.setItem('fulfillment_code', code || '');
  }, [code]);

  const { data, isLoading, error } = useQuery<{ request: RechargeRequest }>({
    queryKey: ['/api/recharge-requests/search', code],
    enabled: !!code && code.length === 6,
    retry: false,
  });
  
  const request = data?.request;

  const handleFulfillRecharge = () => {
    if (!request) return;
    
    // Pre-fill the recharge form and navigate to public recharge page
    localStorage.setItem('recharge_prefill_phone', request.phoneNumber);
    localStorage.setItem('recharge_prefill_amount', request.amount);
    localStorage.setItem('recharge_from_request', request.id.toString());
    localStorage.setItem('recharge_request_code', request.requestCode || '');
    
    // Navigate to public recharge page (no dashboard layout)
    setLocation('/fulfill');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-600/10 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-600/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Demande introuvable</CardTitle>
                <CardDescription>Code: {code}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Cette demande de recharge n'existe pas, a expiré ou a déjà été traitée.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => setLocation('/')} 
              className="w-full"
              data-testid="button-go-home"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(request.expiresAt);
  const isCompleted = request.status !== 'pending';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-600/10 p-4">
      <Card className="w-full max-w-md" data-testid="card-request-fulfillment">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-md ${
              isCompleted 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : isExpired 
                ? 'bg-destructive/10' 
                : 'bg-gradient-to-br from-primary to-purple-600'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : isExpired ? (
                <AlertCircle className="h-6 w-6 text-destructive" />
              ) : (
                <Phone className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <CardTitle>Demande de recharge</CardTitle>
              <CardDescription>Code: {request.requestCode || code}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isCompleted && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Cette demande a déjà été traitée.
              </AlertDescription>
            </Alert>
          )}

          {isExpired && !isCompleted && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Cette demande a expiré le {format(new Date(request.expiresAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}.
              </AlertDescription>
            </Alert>
          )}

          {!isExpired && !isCompleted && (
            <Alert>
              <AlertDescription>
                {request.senderName || 'Quelqu\'un'} vous demande d'effectuer une recharge mobile.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 rounded-md bg-muted p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Numéro à recharger:</span>
              <span className="text-sm font-mono font-bold">{request.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Montant:</span>
              <span className="text-sm font-bold text-primary">${request.amount}</span>
            </div>
            {request.senderName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">De:</span>
                <span className="text-sm">{request.senderName}</span>
              </div>
            )}
            {request.expiresAt && !isCompleted && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Expire le:</span>
                <span className="text-sm">
                  {format(new Date(request.expiresAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </span>
              </div>
            )}
          </div>

          {request.message && (
            <div className="rounded-md border bg-card p-4">
              <p className="text-sm font-medium mb-1">Message:</p>
              <p className="text-sm text-muted-foreground">{request.message}</p>
            </div>
          )}

          <div className="space-y-2">
            {!isExpired && !isCompleted && (
              <Button 
                onClick={handleFulfillRecharge} 
                className="w-full"
                data-testid="button-fulfill-recharge"
              >
                Effectuer la recharge
              </Button>
            )}
            <Button 
              onClick={() => setLocation('/')} 
              variant="outline" 
              className="w-full"
              data-testid="button-go-home"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

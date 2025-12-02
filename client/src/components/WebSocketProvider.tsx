import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import { ReceiptConfirmationDialog } from '@/components/ReceiptConfirmationDialog';
import type { Transaction } from '@shared/schema';

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmationTransaction, setConfirmationTransaction] = useState<Transaction | null>(null);

  // Initialize WebSocket connection
  const { isConnected, sendMessage } = useWebSocket({
    onConnect: () => {
      console.log('[App] WebSocket connected');
    },
    onDisconnect: () => {
      console.log('[App] WebSocket disconnected');
    },
    onMessage: (message) => {
      // Show toast notifications for important events
      switch (message.type) {
        case 'recharge_request_created':
          toast({
            title: 'Nouvelle demande de recharge',
            description: `Montant: $${message.data?.amount || '0'}`,
          });
          break;
        case 'recharge_request_accepted':
          toast({
            title: 'Demande acceptée',
            description: 'Votre demande de recharge a été acceptée',
          });
          break;
        case 'transaction_created':
          toast({
            title: 'Transaction créée',
            description: `Montant: $${message.data?.amount || '0'}`,
          });
          break;
        case 'confirm_receipt_required':
          // 🆕 Show confirmation dialog when DTone delivers credit
          console.log('[App] Showing receipt confirmation dialog:', message.data);
          // Fetch full transaction data from API
          if (message.data?.transactionId) {
            fetch(`/api/transactions/${message.data.transactionId}`)
              .then(res => res.json())
              .then(transaction => {
                if (transaction) {
                  setConfirmationTransaction(transaction);
                }
              })
              .catch(err => {
                console.error('[App] Failed to load transaction:', err);
                toast({
                  title: 'Erreur',
                  description: 'Impossible de charger la transaction',
                  variant: 'destructive',
                });
              });
          }
          break;
        case 'transaction_confirmed':
          toast({
            title: '✅ Paiement effectué',
            description: message.data?.message || 'Merci ! Votre carte a été débitée.',
          });
          break;
        case 'transaction_disputed':
          toast({
            title: '📝 Réclamation enregistrée',
            description: message.data?.message || 'Notre équipe va enquêter.',
          });
          break;
        case 'transaction_auto_confirmed':
          toast({
            title: '⏰ Paiement automatique',
            description: message.data?.message || 'Délai expiré, paiement effectué.',
          });
          break;
      }
    },
    autoReconnect: true,
  });

  // Authenticate WebSocket when user logs in
  useEffect(() => {
    if (user && isConnected) {
      console.log('[App] Authenticating WebSocket for user', user.id);
      sessionStorage.setItem('userId', user.id.toString());
      sendMessage('authenticate', { userId: user.id });
    }
  }, [user, isConnected, sendMessage]);

  // Clear userId when user logs out
  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem('userId');
    }
  }, [user]);

  return (
    <>
      {children}
      {confirmationTransaction && (
        <ReceiptConfirmationDialog
          isOpen={true}
          onClose={() => setConfirmationTransaction(null)}
          transaction={confirmationTransaction}
        />
      )}
    </>
  );
}

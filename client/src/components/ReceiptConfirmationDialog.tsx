import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { generateReceipt } from '@/utils/receiptGenerator';
import type { Transaction } from '@shared/schema';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReceiptConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export function ReceiptConfirmationDialog({
  isOpen,
  onClose,
  transaction,
}: ReceiptConfirmationDialogProps) {
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Extract data from transaction
  const transactionId = transaction.id;
  const phoneNumber = transaction.phoneNumber;
  const amount = transaction.amount;
  const currency = transaction.currency || 'USD';
  const confirmationDeadline = transaction.confirmationDeadline || undefined;

  // Update timer every second
  useEffect(() => {
    if (!confirmationDeadline || isConfirmed) return;

    const updateTimer = () => {
      const now = Date.now();
      const deadline = new Date(confirmationDeadline).getTime();
      const diffMs = deadline - now;
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      console.log('⏱️ [Timer]', {
        deadline: new Date(deadline).toISOString(),
        now: new Date(now).toISOString(),
        diffMs,
        totalSeconds,
        minutes,
        seconds,
        formatted
      });
      
      setTimeRemaining(formatted);
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000); // Update every second

    return () => clearInterval(interval);
  }, [confirmationDeadline, isConfirmed]);

  // Mutation for confirming receipt
  const confirmMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/transactions/${transactionId}/confirm-receipt`);
      const data = await response.json();
      return data as Transaction;
    },
    onSuccess: (updatedTransaction: Transaction) => {
      setIsConfirmed(true);
      
      // Update the transaction status in cache immediately
      queryClient.setQueryData(['/api/transactions'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((t: any) => 
          t.id === transactionId ? updatedTransaction : t
        );
      });
      
      // Invalidate queries to refresh data and update status
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      // Close dialog immediately
      onClose();
      
      // Show success toast with download receipt button
      toast({
        title: `✅ ${t('receipt.payment_completed_toast')}`,
        description: t('receipt.payment_success_message'),
        action: (
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ [Download Button] Clicked!', {
                transactionId: updatedTransaction.id,
                language,
                transaction: updatedTransaction
              });
              try {
                generateReceipt(updatedTransaction, language);
                console.log('✅ [Download Button] Receipt generated successfully');
                toast({
                  title: `📄 ${t('receipt.receipt_downloaded')}`,
                  description: t('receipt.receipt_saved'),
                });
              } catch (error) {
                console.error('❌ [Download Button] Error:', error);
                toast({
                  title: `❌ Erreur`,
                  description: 'Impossible de générer le reçu',
                  variant: 'destructive',
                });
              }
            }}
            data-testid="button-download-receipt-toast"
          >
            📥 {t('receipt.download_receipt')}
          </Button>
        ),
        duration: 10000, // Toast stays for 10 seconds
      });
    },
    onError: (error: any) => {
      toast({
        title: `❌ ${t('receipt.error')}`,
        description: error.message || t('receipt.confirm_error'),
        variant: 'destructive',
      });
    },
  });

  // Mutation for disputing (reporting non-receipt)
  const disputeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/transactions/${transactionId}/dispute`, {
        reason: disputeReason || t('receipt.no_not_received'),
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: `📝 ${t('receipt.dispute_registered_toast')}`,
        description: t('receipt.dispute_message'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: `❌ ${t('receipt.error')}`,
        description: error.message || t('receipt.dispute_error'),
        variant: 'destructive',
      });
    },
  });

  const handleConfirm = () => {
    confirmMutation.mutate();
  };

  const handleDispute = () => {
    if (!showDispute) {
      setShowDispute(true);
      return;
    }

    if (!disputeReason.trim()) {
      toast({
        title: `⚠️ ${t('receipt.reason_required_toast')}`,
        description: t('receipt.reason_required_message'),
        variant: 'destructive',
      });
      return;
    }

    disputeMutation.mutate();
  };

  const handleDownloadReceipt = () => {
    generateReceipt(transaction, language);
    toast({
      title: `📄 ${t('receipt.downloaded_toast')}`,
      description: t('receipt.downloaded_message'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-receipt-confirmation">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            {isConfirmed ? t('receipt.payment_confirmed') : t('receipt.credit_sent')}
          </DialogTitle>
          <DialogDescription>
            {isConfirmed 
              ? t('receipt.payment_success_desc').replace('{amount}', amount).replace('{currency}', currency)
              : <>{t('receipt.did_you_receive')} <strong>{amount} {currency}</strong> {t('receipt.on_phone')} <strong>{phoneNumber}</strong> ?</>
            }
          </DialogDescription>
        </DialogHeader>

        {isConfirmed ? (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {t('receipt.transaction_completed')}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {t('receipt.card_charged').replace('{amount}', amount).replace('{currency}', currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : !showDispute ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {t('receipt.time_remaining')} <strong className="text-foreground">{timeRemaining || '3:00'}</strong>
              </span>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {t('receipt.important')}
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t('receipt.auto_charge_warning')}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('receipt.confirm_instruction')} <strong>"{t('receipt.yes_received')}"</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    {t('receipt.report_problem')}
                  </p>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {t('receipt.explain_reason')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dispute-reason">{t('receipt.dispute_reason_label')}</Label>
              <Textarea
                id="dispute-reason"
                placeholder={t('receipt.dispute_placeholder')}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="min-h-[100px]"
                data-testid="input-dispute-reason"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row flex-wrap gap-2">
          {isConfirmed ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
                data-testid="button-close"
              >
                {t('receipt.close')}
              </Button>
              <Button
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto"
                data-testid="button-download-receipt"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('receipt.download_receipt')}
              </Button>
            </>
          ) : !showDispute ? (
            <>
              <Button
                variant="outline"
                onClick={handleDispute}
                disabled={confirmMutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-dispute"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('receipt.no_not_received')}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={confirmMutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-confirm"
              >
                {confirmMutation.isPending ? (
                  `⏳ ${t('receipt.processing')}`
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('receipt.yes_received')}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowDispute(false)}
                disabled={disputeMutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-cancel-dispute"
              >
                {t('receipt.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDispute}
                disabled={disputeMutation.isPending || !disputeReason.trim()}
                className="w-full sm:w-auto"
                data-testid="button-submit-dispute"
              >
                {disputeMutation.isPending ? (
                  `⏳ ${t('receipt.sending')}`
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t('receipt.submit_dispute')}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

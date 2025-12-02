import { storage } from '../storage';
import Stripe from 'stripe';
import { convertToUSD } from '@shared/currencyRates';
import { wsManager } from '../websocket';

// Support both production and testing keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover',
});

const calculateCommission = (amount: number): number => {
  return parseFloat(((amount * 1.09) / 0.97 - amount).toFixed(2));
};

/**
 * Process confirmation timeouts
 * Auto-charge if user hasn't confirmed after 3 minutes
 * This protects against users closing the page without confirming
 */
export async function processConfirmationTimeouts() {
  try {
    console.log('[Confirmation Timeouts] 🕐 Starting timeout check...');
    
    // Find all transactions pending confirmation with expired deadlines
    const now = new Date();
    const expiredTransactions = await storage.getExpiredPendingConfirmations(now.toISOString());
    
    console.log(`[Confirmation Timeouts] Found ${expiredTransactions.length} expired confirmations`);

    for (const transaction of expiredTransactions) {
      try {
        console.log(`[Confirmation Timeouts] ⏰ Processing expired transaction ${transaction.id}`, {
          transactionId: transaction.transactionId,
          phoneNumber: transaction.phoneNumber,
          amount: transaction.amount,
          deadline: transaction.confirmationDeadline,
          minutesExpired: Math.floor((now.getTime() - new Date(transaction.confirmationDeadline!).getTime()) / 60000)
        });

        // Auto-confirm and charge (presume user received credit)
        // Check if transaction has a PaymentIntent
        if (!transaction.stripePaymentIntentId) {
          console.error(`[Confirmation Timeouts] No PaymentIntent found for transaction ${transaction.id}, skipping`);
          continue;
        }

        // 💳 Capture the authorized PaymentIntent (user entered card earlier)
        const paymentIntent = await stripe.paymentIntents.capture(transaction.stripePaymentIntentId, {
          metadata: {
            autoConfirmed: 'true', // 🆕 Flag indicating auto-confirmation
            reason: 'timeout_3min',
            capturedAt: new Date().toISOString(),
          },
        });

        // Update transaction to completed
        await storage.updateTransaction(transaction.id, {
          status: 'completed',
          confirmationMethod: 'auto_timeout', // 🆕 Auto-confirmed due to timeout
          confirmedAt: new Date().toISOString(),
        });

        console.log('[Confirmation Timeouts] ✅ Auto-captured successfully:', {
          transactionId: transaction.id,
          paymentIntentId: paymentIntent.id,
          amount: transaction.amount,
          currency: transaction.currency,
          method: 'auto_timeout'
        });

        // Award loyalty points for authenticated users
        if (transaction.userId) {
          try {
            const amountInUSD = convertToUSD(parseFloat(transaction.amount), transaction.currency || 'USD');
            const points = Math.floor(amountInUSD * 0.0001 * 100) / 100;
            if (points > 0) {
              await storage.addLoyaltyPoints(
                transaction.userId,
                points,
                'earned',
                `Recharge de ${transaction.amount} ${transaction.currency}`,
                transaction.id
              );
              console.log('[Loyalty] Awarded', points, 'points (auto-timeout)');
            }
          } catch (loyaltyError) {
            console.error('[Loyalty] Error awarding points:', loyaltyError);
          }
        }

        // Notify user
        if (transaction.userId) {
          wsManager.sendToUser(transaction.userId, 'transaction_auto_confirmed', {
            transactionId: transaction.id,
            status: 'completed',
            message: 'Paiement automatique effectué (délai de confirmation expiré).',
          });
        }

      } catch (error) {
        console.error(`[Confirmation Timeouts] ❌ Error processing transaction ${transaction.id}:`, error);
        
        // Mark as failed to prevent retry loops
        await storage.updateTransaction(transaction.id, {
          status: 'failed',
          failureReason: `Auto-charge failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          confirmationMethod: 'auto_timeout_failed',
        });
      }
    }

    console.log('[Confirmation Timeouts] ✅ Timeout check completed');
  } catch (error) {
    console.error('[Confirmation Timeouts] Error:', error);
  }
}

// Run every 1 minute to check for timeouts
export function startConfirmationTimeoutsJob() {
  console.log('[Confirmation Timeouts] 🚀 Job scheduler started (every 1 minute)');
  
  // Run immediately on startup
  processConfirmationTimeouts();
  
  // Then run every 1 minute
  setInterval(processConfirmationTimeouts, 60 * 1000);
}

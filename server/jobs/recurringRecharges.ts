import { storage } from '../storage';
import Stripe from 'stripe';
import { convertToUSD } from '@shared/currencyUtils';

// Support both production and testing Stripe keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover',
});

export async function processRecurringRecharges() {
  try {
    console.log('[Recurring Recharges] Starting job...');
    
    const pendingRecharges = await storage.getPendingRecurringRecharges();
    console.log(`[Recurring Recharges] Found ${pendingRecharges.length} pending recharges`);

    for (const recharge of pendingRecharges) {
      try {
        console.log(`[Recurring Recharges] Processing recharge ${recharge.id}`);

        // Get user
        const user = await storage.getUser(recharge.userId);
        if (!user) {
          console.error(`[Recurring Recharges] User ${recharge.userId} not found, skipping`);
          continue;
        }

        // Calculate commission (couvre DingConnect 9% + Stripe 3%)
        const amount = parseFloat(recharge.amount);
        const DINGCONNECT_COMMISSION_RATE = 0.09;
        const STRIPE_FEE_RATE = 0.03;
        const totalWithFees = (amount * (1 + DINGCONNECT_COMMISSION_RATE)) / (1 - STRIPE_FEE_RATE);
        const commission = parseFloat((totalWithFees - amount).toFixed(2));
        const totalAmount = amount + commission;

        // Get or create Stripe customer
        let stripeCustomer = await storage.getStripeCustomerByUserId(user.id);
        
        if (!stripeCustomer) {
          const customer = await stripe.customers.create({
            email: user.email || `user${user.id}@taptopload.com`,
            metadata: {
              userId: user.id.toString(),
            },
          });

          stripeCustomer = await storage.createStripeCustomer({
            userId: user.id,
            stripeCustomerId: customer.id,
            email: user.email || null,
          });
        }

        // Create Payment Intent
        const currency = (recharge.currency || 'USD').toLowerCase();
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100),
          currency,
          customer: stripeCustomer.stripeCustomerId,
          metadata: {
            userId: user.id.toString(),
            phoneNumber: recharge.phoneNumber,
            operatorCode: recharge.operatorCode || '',
            baseAmount: amount.toString(),
            commission: commission.toString(),
            recurringRechargeId: recharge.id.toString(),
          },
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: 'never',
          },
          off_session: true,
          confirm: true,
        });

        if (paymentIntent.status === 'succeeded') {
          // Create transaction
          const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
          const transaction = await storage.createTransaction({
            userId: user.id,
            transactionId,
            phoneNumber: recharge.phoneNumber,
            amount: amount.toString(),
            commission: commission.toString(),
            totalReceived: totalAmount.toString(),
            operatorCode: recharge.operatorCode,
            paymentMethod: 'stripe_card',
            status: 'completed',
            currency: recharge.currency || 'USD',
            stripePaymentIntentId: paymentIntent.id,
          });

          // Award loyalty points (1 point per USD spent)
          const amountInUSD = convertToUSD(amount, recharge.currency || 'USD');
          const points = Math.floor(amountInUSD);
          if (points > 0) {
            await storage.addLoyaltyPoints(
              user.id,
              points,
              'earned',
              `Recharge récurrente de ${amount} ${recharge.currency}`,
              transaction.id
            );
          }

          // Calculate next execution date
          const now = new Date();
          let nextExecutionDate: Date;

          switch (recharge.frequency) {
            case 'daily':
              nextExecutionDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
              break;
            case 'weekly':
              nextExecutionDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              break;
            case 'monthly':
              nextExecutionDate = new Date(now);
              nextExecutionDate.setMonth(nextExecutionDate.getMonth() + 1);
              if (recharge.dayOfMonth) {
                nextExecutionDate.setDate(recharge.dayOfMonth);
              }
              break;
            case 'yearly':
              nextExecutionDate = new Date(now);
              nextExecutionDate.setFullYear(nextExecutionDate.getFullYear() + 1);
              break;
            default:
              nextExecutionDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          // Update recurring recharge
          await storage.updateRecurringRecharge(recharge.id, {
            lastExecutionDate: now.toISOString(),
            nextExecutionDate: nextExecutionDate.toISOString(),
            failureCount: 0,
          });

          console.log(`[Recurring Recharges] Successfully processed recharge ${recharge.id}, transaction ${transaction.id}`);
        } else {
          throw new Error(`Payment intent status: ${paymentIntent.status}`);
        }

      } catch (error) {
        console.error(`[Recurring Recharges] Error processing recharge ${recharge.id}:`, error);
        
        // Increment failure count
        const newFailureCount = (recharge.failureCount || 0) + 1;
        
        // Deactivate after 3 consecutive failures
        const updates: any = {
          failureCount: newFailureCount,
        };

        if (newFailureCount >= 3) {
          updates.isActive = false;
          console.log(`[Recurring Recharges] Deactivating recharge ${recharge.id} after 3 failures`);
        } else {
          // Retry in 1 day
          const retryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          updates.nextExecutionDate = retryDate.toISOString();
        }

        await storage.updateRecurringRecharge(recharge.id, updates);
      }
    }

    console.log('[Recurring Recharges] Job completed');
  } catch (error) {
    console.error('[Recurring Recharges] Job error:', error);
  }
}

// Run every hour
export function startRecurringRechargesJob() {
  const INTERVAL = 60 * 60 * 1000; // 1 hour
  
  console.log('[Recurring Recharges] Job scheduler started');
  
  // Run immediately on start
  processRecurringRecharges();
  
  // Then run every hour
  setInterval(() => {
    processRecurringRecharges();
  }, INTERVAL);
}

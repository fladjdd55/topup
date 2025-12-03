import { db } from "../db";
import { transactions } from "@shared/schema";
import { eq, and, sql, lt } from "drizzle-orm";
import { storage } from "../storage";
import { sendRecharge } from "../dingconnect";
import { sendTelegramNotification } from "../telegramBot";
import { wsManager } from "../websocket";

// Configuration
const RETRY_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes
const MAX_RETRIES = 3; // Give up after 3 attempts

export function startRetryJob() {
  console.log('🔄 [RetryJob] Starting background retry service...');

  setInterval(async () => {
    try {
      await processRetries();
    } catch (error) {
      console.error('❌ [RetryJob] Critical error in retry loop:', error);
    }
  }, RETRY_INTERVAL_MS);
}

async function processRetries() {
  // 1. Find transactions that need manual action/retry
  // Criteria: Status is 'failed' AND metadata indicates 'needs_manual_action' AND retry count < MAX
  const failedTransactions = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.status, 'failed'),
        sql`(${transactions.metadata}->>'needs_manual_action')::boolean = true`,
        sql`COALESCE((${transactions.metadata}->>'retry_count')::int, 0) < ${MAX_RETRIES}`
      )
    );

  if (failedTransactions.length === 0) return;

  console.log(`🔄 [RetryJob] Found ${failedTransactions.length} transactions to retry.`);

  for (const tx of failedTransactions) {
    const currentRetries = (tx.metadata as any)?.retry_count || 0;
    const newRetryCount = currentRetries + 1;
    
    console.log(`👉 [RetryJob] Retrying TX: ${tx.transactionId} (Attempt ${newRetryCount}/${MAX_RETRIES})`);

    try {
      // 2. Attempt the recharge again
      // Note: Ensure sendRecharge handles idempotency if possible, or reliance on transactionId helps
      const dingResult = await sendRecharge(
        tx.phoneNumber, 
        parseFloat(tx.amountUsd || '0'), 
        tx.transactionId, // Re-use ID to prevent double billing if supported by provider
        'HT' // Default country or derive from operator
      );

      if (dingResult.ResultCode === 1) {
        // ✅ SUCCESS!
        console.log(`✅ [RetryJob] Success for ${tx.transactionId}`);
        
        // Update DB
        await storage.updateTransaction(tx.id, {
          status: 'completed',
          dtoneExternalId: dingResult.TransferRecord?.TransferId?.TransferRef || null,
          dtoneStatus: 'Complete',
          metadata: {
            ...(tx.metadata as object),
            needs_manual_action: false, // Clear flag
            retry_count: newRetryCount,
            recovered_at: new Date().toISOString()
          }
        });

        // Notify User
        if (tx.userId) {
          await storage.createNotification({
            userId: tx.userId,
            title: '✅ Recharge validée',
            message: `Bonne nouvelle ! Votre recharge de ${tx.amount} a finalement été validée après une nouvelle tentative.`,
            type: 'success'
          });
          
          wsManager.sendToUser(tx.userId, 'transaction_completed', { transactionId: tx.id });

          const user = await storage.getUser(tx.userId);
          if (user?.telegramId) {
            sendTelegramNotification(user.telegramId, `✅ Recharge récupérée avec succès ! Ref: ${tx.transactionId}`);
          }
        }

        // Notify Admin
        if (process.env.ADMIN_TELEGRAM_ID) {
          sendTelegramNotification(process.env.ADMIN_TELEGRAM_ID, `✅ AUTO-RECOVERY: Transaction ${tx.transactionId} succeeded on attempt ${newRetryCount}.`);
        }

      } else {
        // ❌ STILL FAILING
        throw new Error(`Provider Error: ${dingResult.ErrorCodes?.[0]?.Code || 'Unknown'}`);
      }

    } catch (error: any) {
      console.error(`⚠️ [RetryJob] Failed attempt ${newRetryCount} for ${tx.transactionId}:`, error.message);

      // Update retry count
      const isFinalAttempt = newRetryCount >= MAX_RETRIES;
      
      await storage.updateTransaction(tx.id, {
        metadata: {
          ...(tx.metadata as object),
          retry_count: newRetryCount,
          last_retry_error: error.message,
          retry_at: new Date().toISOString()
        }
      });

      // If we've exhausted retries, alert admin to refund manually
      if (isFinalAttempt && process.env.ADMIN_TELEGRAM_ID) {
        sendTelegramNotification(
          process.env.ADMIN_TELEGRAM_ID, 
          `🚨 RETRY FAILED (${newRetryCount}/${MAX_RETRIES}):\nTx: ${tx.transactionId}\nAmt: $${tx.amountUsd}\nUser: ${tx.userId}\nAction: REFUND NEEDED`
        );
      }
    }
  }
}

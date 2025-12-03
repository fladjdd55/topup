import { Telegraf, Markup, Context } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { storage } from './storage';
import { wsManager } from './websocket';
import { sendRecharge } from './dingconnect';

// ✅ Import modular files
import { botConfig } from './config/bot.config';
import { BotContext } from './types/telegram.types';
import { validatePhoneNumber, sanitizeInput, validateAmount } from './utils/validators';
import { middleware, getHealthStatus } from './middleware/telegramMiddleware';

// ✅ EXPORT BOT INSTANCE (Required for Webhook in routes.ts)
export const bot = new Telegraf<BotContext>(botConfig.token);

// ✅ APPLY MIDDLEWARE
bot.use(middleware.session);
bot.use(middleware.floodProtection);
bot.use(middleware.analytics);

// ============================================================================
// HELPER: NOTIFICATION
// ============================================================================
export async function sendTelegramNotification(telegramId: string, message: string) {
  try {
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(`[Telegram] Notification failed to ${telegramId}:`, error);
  }
}

// ============================================================================
// HELPER: INVOICE LINK
// ============================================================================
export async function createTelegramInvoiceLink(transaction: any) {
  if (!botConfig.paymentProviderToken) {
    throw new Error("Missing TELEGRAM_PAYMENT_PROVIDER_TOKEN");
  }

  const amountInCents = Math.floor(parseFloat(transaction.totalReceivedUsd) * 100);

  return await bot.telegram.createInvoiceLink({
    title: `Top-up ${transaction.phoneNumber}`,
    description: `Mobile recharge: ${transaction.amount} ${transaction.currency}`,
    payload: transaction.transactionId,
    provider_token: botConfig.paymentProviderToken,
    currency: 'USD',
    prices: [{ label: 'Mobile Credit', amount: amountInCents }],
    photo_url: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
    need_name: false,
    need_phone_number: false,
    need_email: false,
    is_flexible: false,
  });
}

// ============================================================================
// PUBLIC COMMANDS
// ============================================================================

bot.command('start', async (ctx) => {
  const name = sanitizeInput(ctx.from.first_name || 'Friend');
  await ctx.reply(
    `👋 Hello ${name}!\n\nWelcome to *TapTopLoad*.\nRecharge globally in seconds.`,
    {
      parse_mode: 'Markdown',
      ...Markup.keyboard([
        Markup.button.webApp('📱 Open App', botConfig.appUrl)
      ]).resize()
    }
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply(
    `📱 *Help Center*\n\n` +
    `/start - Main Menu\n` +
    `/history - Recent Transactions\n` +
    `/status <ref> - Check Transaction\n\n` +
    `*Support:* Contact @taptopload`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('history', async (ctx) => {
  try {
    const telegramId = ctx.from.id.toString();
    const user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) return ctx.reply('⚠️ Please open the App first to create an account.');

    const transactions = await storage.getTransactionsByUserId(user.id);
    const last3 = transactions.slice(0, 3);

    if (last3.length === 0) return ctx.reply('📜 No recent transactions.');

    const msg = last3.map(t => 
      `${t.status === 'completed' ? '✅' : '⏳'} *${t.amount} ${t.currency}* -> \`${t.phoneNumber}\``
    ).join('\n');

    ctx.reply(`📜 *Recent Activity:*\n${msg}`, { parse_mode: 'Markdown' });
  } catch (e) {
    console.error('History error:', e);
  }
});

// ============================================================================
// 🔒 ADMIN COMMANDS (Protected)
// ============================================================================

// Middleware to check admin status
const adminOnly = async (ctx: BotContext, next: () => Promise<void>) => {
  const userId = ctx.from?.id || 0;
  
  if (!botConfig.adminIds.includes(userId)) {
    await ctx.reply('⚠️ Unauthorized. This command is restricted.');
    return;
  }
  return next();
};

bot.command('admin', adminOnly, async (ctx) => {
  await ctx.reply(
    `🛡️ *Admin Control Panel*\n\n` +
    `/admin_stats - View Revenue & Health\n` +
    `/admin_broadcast <msg> - Message all users\n` +
    `/admin_refund <tx_id> - Refund & Notify User\n` +
    `/admin_lookup <phone> - Find User`,
    { parse_mode: 'Markdown' }
  );
});

bot.command('admin_stats', adminOnly, async (ctx) => {
  try {
    const dbStats = await storage.getAdminStats();
    const health = getHealthStatus(); // From middleware

    const msg = `
📊 *Live Statistics*

👥 *Users:* ${dbStats.totalUsers}
💰 *Revenue:* ${dbStats.totalRevenue}
✅ *Success Rate:* ${dbStats.successRate}%
transactions: ${dbStats.totalTransactions}

🖥️ *System Health*
Status: ${health.status === 'healthy' ? '🟢 OK' : '🔴 Issues'}
Uptime: ${Math.floor(health.uptime / 60)} mins
Active Sessions: ${health.activeSessions}
Errors (5m): ${health.recentErrors}
    `;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (e: any) {
    ctx.reply(`Error: ${e.message}`);
  }
});

bot.command('admin_broadcast', adminOnly, async (ctx) => {
  const message = ctx.message.text.split(' ').slice(1).join(' ');
  if (!message) return ctx.reply('Usage: /admin_broadcast <message>');

  ctx.reply('📢 Starting broadcast...');
  
  const users = await storage.getAllUsers();
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    if (user.telegramId) {
      try {
        await bot.telegram.sendMessage(user.telegramId, `📢 *Announcement*\n\n${message}`, { parse_mode: 'Markdown' });
        sent++;
        // Small delay to avoid hitting Telegram limits
        await new Promise(r => setTimeout(r, 50)); 
      } catch (e) {
        failed++;
      }
    }
  }

  ctx.reply(`✅ Broadcast complete.\nSent: ${sent}\nFailed/Blocked: ${failed}`);
});

bot.command('admin_refund', adminOnly, async (ctx) => {
  const txId = ctx.message.text.split(' ')[1];
  if (!txId) return ctx.reply('Usage: /admin_refund <transaction_id>');

  try {
    const tx = await storage.getTransactionByTransactionId(txId);
    if (!tx) return ctx.reply('❌ Transaction not found.');

    await storage.updateTransaction(tx.id, { status: 'refunded' });

    // Notify User
    if (tx.telegramId) {
      await bot.telegram.sendMessage(
        tx.telegramId, 
        `↩️ *Refund Processed*\n\nYour transaction \`${txId}\` has been refunded.`,
        { parse_mode: 'Markdown' }
      );
    }

    ctx.reply(`✅ Transaction ${txId} marked as refunded.`);
  } catch (e: any) {
    ctx.reply(`Error: ${e.message}`);
  }
});

// ============================================================================
// INLINE QUERY HANDLER
// ============================================================================

bot.on('inline_query', async (ctx) => {
  const query = sanitizeInput(ctx.inlineQuery.query);
  const results = [];
  const appUrl = botConfig.appUrl;

  // 1. App Link
  results.push({
    type: 'article',
    id: 'app_link',
    title: '📱 Open Recharge App',
    description: 'Click here to send a top-up',
    thumb_url: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
    input_message_content: { message_text: `🚀 I'm using TapTopLoad!` },
    reply_markup: { inline_keyboard: [[{ text: "📱 Open App", web_app: { url: appUrl } }]] }
  });

  // 2. Share Link
  results.push({
    type: 'article',
    id: 'share_link',
    title: '🔗 Share with Friends',
    description: 'Send TapTopLoad to a friend',
    thumb_url: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
    input_message_content: { message_text: `Hey! Check out TapTopLoad! ⚡` },
    reply_markup: { inline_keyboard: [[{ text: "⚡ Try It Now", url: `https://t.me/${ctx.botInfo.username}` }]] }
  });

  // 3. Dynamic Payment
  const phoneCheck = validatePhoneNumber(query);
  if (phoneCheck.valid && phoneCheck.sanitized) {
    results.unshift({
      type: 'article',
      id: 'quick_pay',
      title: `⚡ Top up ${phoneCheck.sanitized}`,
      description: 'Click to pay instantly',
      thumb_url: 'https://cdn-icons-png.flaticon.com/512/2983/2983797.png',
      input_message_content: { message_text: `Recharging ${phoneCheck.sanitized} 📱` },
      reply_markup: { inline_keyboard: [[
        { text: `💰 Pay Now`, web_app: { url: `${appUrl}/dashboard/recharge?phone=${encodeURIComponent(phoneCheck.sanitized)}` } }
      ]] }
    });
  }

  await ctx.answerInlineQuery(results as any, { cache_time: 10, is_personal: true });
});

// ============================================================================
// PAYMENT HANDLERS
// ============================================================================

bot.on('pre_checkout_query', async (ctx) => {
  const txId = ctx.preCheckoutQuery.invoice_payload;
  const tx = await storage.getTransactionByTransactionId(txId);
  
  if (!tx) return ctx.answerPreCheckoutQuery(false, 'Transaction expired');
  if (tx.status === 'completed') return ctx.answerPreCheckoutQuery(false, 'Already paid');
  
  await ctx.answerPreCheckoutQuery(true);
});

bot.on('successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment;
  const txId = payment.invoice_payload;
  
  console.log(`[Telegram Pay] Success: ${txId}`);
  
  try {
    const tx = await storage.getTransactionByTransactionId(txId);
    if (!tx || tx.status === 'completed') return;

    await storage.updateTransaction(tx.id, {
      status: 'processing',
      stripeChargeId: payment.provider_payment_charge_id
    });

    const amountUSD = parseFloat(tx.amountUsd || '0');
    if (!validateAmount(amountUSD).valid) throw new Error("Invalid Amount");

    const dingResult = await sendRecharge(tx.phoneNumber, amountUSD, tx.transactionId, 'HT');

    if (dingResult.ResultCode === 1) {
      await storage.updateTransaction(tx.id, {
        status: 'completed',
        dtoneExternalId: dingResult.TransferRecord?.TransferId?.TransferRef,
        dtoneStatus: 'Complete',
        paymentMethod: 'telegram_native',
        completedAt: new Date().toISOString()
      });

      await ctx.reply(`✅ *Success!* Top-up sent to \`${tx.phoneNumber}\`.`, { parse_mode: 'Markdown' });
      
      if (tx.userId) {
        wsManager.sendToUser(tx.userId, 'transaction_completed', { transactionId: tx.id });
      }
    } else {
      throw new Error(`Provider Error: ${dingResult.ErrorCodes?.[0]?.Code}`);
    }
  } catch (error: any) {
    console.error('[Telegram Pay] Error:', error);
    await ctx.reply(`⚠️ Payment received but top-up failed. Ref: ${txId}`);
    const tx = await storage.getTransactionByTransactionId(txId);
    if(tx) await storage.updateTransaction(tx.id, { status: 'failed', dtoneStatus: error.message });
  }
});

// ============================================================================
// STARTUP LOGIC (Webhooks vs Polling)
// ============================================================================
export async function startTelegramBot() {
  if (!botConfig.token) return console.error('❌ BOT_TOKEN missing');

  // ✅ PROD: Set Webhook (Secure)
  // We use Webhook if we are in production AND a domain is configured
  if (process.env.NODE_ENV === 'production' && botConfig.webhookDomain) {
    try {
      const webhookUrl = `${botConfig.webhookDomain}/api/webhooks/telegram`;
      
      // 🔒 SECRET TOKEN VALIDATION:
      // This ensures that only Telegram can call your webhook endpoint.
      await bot.telegram.setWebhook(webhookUrl, {
        secret_token: botConfig.webhookSecret 
      });
      
      console.log(`🚀 [Telegram] Webhook set to: ${webhookUrl}`);
      console.log(`🔒 [Telegram] Secure Token Validation Enabled`);
    } catch (err) {
      console.error('❌ [Telegram] Failed to set Webhook:', err);
    }
  } 
  // ✅ DEV: Long Polling (Easy)
  else {
    console.log('🔄 [Telegram] Starting Long Polling (Dev Mode)...');
    // We launch the bot without webhook options, which defaults to polling
    bot.launch().catch(err => console.error('❌ [Telegram] Launch failed:', err));
  }
  
  // Graceful Shutdown
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

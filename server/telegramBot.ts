import { Telegraf, Markup } from 'telegraf';
import { storage } from './storage';
import { wsManager } from './websocket';
import { sendRecharge } from './dingconnect';

// ✅ Correct Imports from your new folders
import { botConfig } from './config/bot.config';
import { BotContext } from './types/telegram.types';
import { validatePhoneNumber, sanitizeInput, validateAmount } from './utils/validators';
import { middleware } from './middleware/telegramMiddleware'; // Ensure this file exists in server/middleware/

// Initialize
const bot = new Telegraf<BotContext>(botConfig.token);

// ✅ Apply Middleware
bot.use(middleware.session);
bot.use(middleware.floodProtection);

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

  // Amount must be in cents/smallest unit
  const amountInCents = Math.floor(parseFloat(transaction.totalReceivedUsd) * 100);

  return await bot.telegram.createInvoiceLink({
    title: `Top-up ${transaction.phoneNumber}`,
    description: `Mobile recharge: ${transaction.amount} ${transaction.currency}`,
    payload: transaction.transactionId,
    provider_token: botConfig.paymentProviderToken,
    currency: 'USD',
    prices: [{ label: 'Mobile Credit', amount: amountInCents }],
    // Use a reliable static image or remove photo_url if causing issues
    photo_url: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
    need_name: false,
    need_phone_number: false,
    need_email: false,
    is_flexible: false,
  });
}

// ============================================================================
// COMMANDS
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
// ✅ INLINE QUERY HANDLER (FIXED)
// ============================================================================

bot.on('inline_query', async (ctx) => {
  const query = sanitizeInput(ctx.inlineQuery.query);
  const results = [];
  const appUrl = botConfig.appUrl;

  // 1. "Open App" Button (Always visible)
  results.push({
    type: 'article',
    id: 'app_link',
    title: '📱 Open Recharge App',
    description: 'Click here to send a top-up',
    thumb_url: 'https://cdn-icons-png.flaticon.com/512/3062/3062634.png',
    input_message_content: {
      message_text: `🚀 I'm sending a mobile top-up with TapTopLoad!`
    },
    reply_markup: {
      inline_keyboard: [[{ text: "📱 Open App", web_app: { url: appUrl } }]]
    }
  });

  // 2. "Share" Button
  results.push({
    type: 'article',
    id: 'share_link',
    title: '🔗 Share with Friends',
    description: 'Send TapTopLoad to a friend',
    thumb_url: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
    input_message_content: {
      message_text: `Hey! Check out TapTopLoad for instant mobile recharges! ⚡`
    },
    reply_markup: {
      inline_keyboard: [[{ text: "⚡ Try It Now", url: `https://t.me/${ctx.botInfo.username}` }]]
    }
  });

  // 3. Dynamic Number Logic (If user types a phone number)
  const phoneCheck = validatePhoneNumber(query);
  if (phoneCheck.valid && phoneCheck.sanitized) {
    results.unshift({
      type: 'article',
      id: 'quick_pay',
      title: `⚡ Top up ${phoneCheck.sanitized}`,
      description: 'Click to pay instantly',
      thumb_url: 'https://cdn-icons-png.flaticon.com/512/2983/2983797.png',
      input_message_content: {
        message_text: `I am recharging ${phoneCheck.sanitized} 📱`
      },
      reply_markup: {
        inline_keyboard: [[
          { text: `💰 Pay Now`, web_app: { url: `${appUrl}/dashboard/recharge?phone=${encodeURIComponent(phoneCheck.sanitized)}` } }
        ]]
      }
    });
  }

  // Answer the query (cache for 10 seconds)
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
    
    // Duplicate Check
    if (!tx || tx.status === 'completed') return;

    await storage.updateTransaction(tx.id, {
      status: 'processing',
      stripeChargeId: payment.provider_payment_charge_id
    });

    const amountUSD = parseFloat(tx.amountUsd || '0');
    // Validate amount again before sending
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
// STARTUP
// ============================================================================
export function startTelegramBot() {
  if (!botConfig.token) return console.error('BOT_TOKEN missing');
  
  bot.launch().then(() => console.log('🤖 Bot started (Production Mode)'));
  
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

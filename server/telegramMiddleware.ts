import { Context, Middleware } from 'telegraf';

// ============================================================================
// TYPES
// ============================================================================

interface SessionData {
  lastCommand?: string;
  lastActivity?: number;
  messageCount?: number;
}

// Extend Telegraf Context
export interface BotContext extends Context {
  session?: SessionData;
}

// ============================================================================
// 1. SESSION MIDDLEWARE
// Keeps track of user activity in memory
// ============================================================================

const sessions = new Map<number, SessionData>();

export const sessionMiddleware: Middleware<BotContext> = async (ctx, next) => {
  if (!ctx.from) return next();

  const userId = ctx.from.id;
  
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      messageCount: 0,
      lastActivity: Date.now()
    });
  }

  const session = sessions.get(userId)!;
  session.lastActivity = Date.now();
  session.messageCount = (session.messageCount || 0) + 1;
  
  // Attach to context so other functions can use it
  ctx.session = session;
  
  return next();
};

// Cleanup old sessions every 10 mins to save memory
setInterval(() => {
  const now = Date.now();
  const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 minutes

  for (const [userId, session] of sessions.entries()) {
    if (now - (session.lastActivity || 0) > MAX_IDLE_TIME) {
      sessions.delete(userId);
    }
  }
}, 10 * 60 * 1000);

// ============================================================================
// 2. FLOOD PROTECTION (Rate Limiting)
// Prevents users from spamming the bot
// ============================================================================

interface FloodEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

const floodMap = new Map<number, FloodEntry>();
const FLOOD_LIMIT = 20; // Max messages
const FLOOD_WINDOW = 60000; // Per 1 minute
const BLOCK_DURATION = 300000; // Block for 5 minutes

export const floodProtectionMiddleware: Middleware<BotContext> = async (ctx, next) => {
  if (!ctx.from) return next();

  const userId = ctx.from.id;
  const now = Date.now();
  const entry = floodMap.get(userId);

  // New user or window expired
  if (!entry || now > entry.resetTime) {
    floodMap.set(userId, { count: 1, resetTime: now + FLOOD_WINDOW, blocked: false });
    return next();
  }

  // Check if blocked
  if (entry.blocked) {
    if (now < entry.resetTime) {
      return; // Ignore message (User is blocked)
    } else {
      // Unblock
      entry.blocked = false;
      entry.count = 1;
      entry.resetTime = now + FLOOD_WINDOW;
      return next();
    }
  }

  entry.count++;

  // Block if limit exceeded
  if (entry.count > FLOOD_LIMIT) {
    entry.blocked = true;
    entry.resetTime = now + BLOCK_DURATION;
    
    await ctx.reply(
      '⚠️ *Anti-Spam Protection*\n\nYou are sending messages too fast. Please wait 5 minutes.',
      { parse_mode: 'Markdown' }
    ).catch(() => {});
    
    return;
  }

  return next();
};

// ============================================================================
// 3. MAINTENANCE MODE
// Allows you to shut down the bot for updates
// ============================================================================

let maintenanceMode = false;
// Add your Telegram ID here if you want to bypass maintenance
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => parseInt(id.trim()));

export function setMaintenanceMode(enabled: boolean) {
  maintenanceMode = enabled;
}

export const maintenanceMiddleware: Middleware<BotContext> = async (ctx, next) => {
  if (!maintenanceMode) {
    return next();
  }

  // Allow admins
  if (ctx.from && ADMIN_IDS.includes(ctx.from.id)) {
    return next();
  }

  await ctx.reply(
    '🔧 *Maintenance Mode*\n\n' +
    'TapTopLoad is currently undergoing maintenance.\n' +
    'We\'ll be back shortly. Thank you for your patience!',
    { parse_mode: 'Markdown' }
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export const middleware = {
  session: sessionMiddleware,
  floodProtection: floodProtectionMiddleware,
  maintenance: maintenanceMiddleware
};

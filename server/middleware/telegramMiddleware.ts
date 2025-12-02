import { Middleware } from 'telegraf';
import { BotContext, SessionData } from '../types/telegram.types';

// ============================================================================
// 1. SESSION MIDDLEWARE
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
  
  ctx.session = session;
  
  return next();
};

// Cleanup old sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  const MAX_IDLE_TIME = 30 * 60 * 1000; 
  for (const [userId, session] of sessions.entries()) {
    if (now - (session.lastActivity || 0) > MAX_IDLE_TIME) {
      sessions.delete(userId);
    }
  }
}, 600000);

// ============================================================================
// 2. FLOOD PROTECTION (Anti-Spam)
// ============================================================================

interface FloodEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

const floodMap = new Map<number, FloodEntry>();
const FLOOD_LIMIT = 20; 
const FLOOD_WINDOW = 60000; 
const BLOCK_DURATION = 300000;

export const floodProtectionMiddleware: Middleware<BotContext> = async (ctx, next) => {
  if (!ctx.from) return next();

  const userId = ctx.from.id;
  const now = Date.now();
  let entry = floodMap.get(userId);

  if (!entry || now > entry.resetTime) {
    entry = { count: 0, resetTime: now + FLOOD_WINDOW, blocked: false };
    floodMap.set(userId, entry);
  }

  if (entry.blocked) {
    if (now < entry.resetTime) return; // Still blocked
    entry.blocked = false;
    entry.count = 0;
    entry.resetTime = now + FLOOD_WINDOW;
  }

  entry.count++;

  if (entry.count > FLOOD_LIMIT) {
    entry.blocked = true;
    entry.resetTime = now + BLOCK_DURATION;
    // Silent block to prevent further spam
    return;
  }

  return next();
};

// ============================================================================
// 3. MAINTENANCE MODE
// ============================================================================

let maintenanceMode = false;
const ADMIN_IDS = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(id => parseInt(id.trim()));

export function setMaintenanceMode(enabled: boolean) {
  maintenanceMode = enabled;
}

export const maintenanceMiddleware: Middleware<BotContext> = async (ctx, next) => {
  if (!maintenanceMode) {
    return next();
  }

  // Allow admins to bypass maintenance
  if (ctx.from && ADMIN_IDS.includes(ctx.from.id)) {
    return next();
  }

  await ctx.reply(
    '🔧 *Maintenance Mode*\n\nWe are currently updating the bot. Please check back in a few minutes.',
    { parse_mode: 'Markdown' }
  );
};

// ============================================================================
// 4. HEALTH CHECK & ANALYTICS (Fixes your error)
// ============================================================================

const errorLog: { time: number; error: string }[] = [];

// Call this function from catch blocks to track health
export function trackError(error: Error) {
  errorLog.push({ time: Date.now(), error: error.message });
  if (errorLog.length > 100) errorLog.shift(); // Keep last 100
}

export function getHealthStatus() {
  const now = Date.now();
  // Count errors in the last 5 minutes
  const recentErrors = errorLog.filter(e => now - e.time < 300000).length;
  
  return {
    status: recentErrors > 10 ? 'degraded' : 'healthy',
    uptime: process.uptime(),
    activeSessions: sessions.size,
    recentErrors: recentErrors,
    memory: process.memoryUsage().heapUsed / 1024 / 1024 // MB
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const middleware = {
  session: sessionMiddleware,
  floodProtection: floodProtectionMiddleware,
  maintenance: maintenanceMiddleware
};

import { Middleware } from 'telegraf';
import { BotContext, SessionData } from '../types/telegram.types';

// In-memory session store
const sessions = new Map<number, SessionData>();

// 1. Session Middleware
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
  const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 mins
  for (const [userId, session] of sessions.entries()) {
    if (now - (session.lastActivity || 0) > MAX_IDLE_TIME) {
      sessions.delete(userId);
    }
  }
}, 600000);

// 2. Flood Protection (Anti-Spam)
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
    await ctx.reply('⚠️ Anti-Spam: You are sending messages too fast. Please wait 5 minutes.').catch(() => {});
    return;
  }

  return next();
};

export const middleware = {
  session: sessionMiddleware,
  floodProtection: floodProtectionMiddleware
};

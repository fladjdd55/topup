import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { storage } from "./storage";
import { wsManager } from "./websocket";
import { 
  insertUserSchema, 
  loginSchema, 
  updateProfileSchema,   
  insertRechargeRequestSchema
} from "@shared/schema";
import { validatePhoneNumber } from "@shared/phoneValidation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { initEmailService } from "./email";
import { convertToUSD } from "@shared/currencyRates";
import bodyParser from "body-parser";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// ✅ IMPORT TELEGRAM HELPERS
import { sendTelegramNotification, createTelegramInvoiceLink } from "./telegramBot";

// ==================== CONFIGURATION ====================

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover',
});

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Fee calculation constants
const DINGCONNECT_COMMISSION_RATE = 0.09; // 9%
const STRIPE_FEE_RATE = 0.03; // 3%
const PROFIT_MARGIN = 0.03; // 3%

function calculateCommission(amount: number | string): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const totalWithFees = (numAmount * (1 + DINGCONNECT_COMMISSION_RATE)) / (1 - STRIPE_FEE_RATE - PROFIT_MARGIN);
  // ✅ FIXED: Missing variable definition
  const commission = totalWithFees - numAmount;
  return parseFloat(commission.toFixed(2));
}

function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;
  return cleaned;
}

function getBaseUrl(req: Request): string {
  const protocol = req.headers['x-forwarded-proto'] as string || req.protocol;
  const host = process.env.REPLIT_DEV_DOMAIN || req.get('host');
  return `${protocol}://${host}`;
}

// ==================== MIDDLEWARE ====================

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: 'Non authentifié' });
  next();
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: 'Trop de requêtes. Veuillez patienter.',
});

// ==================== MAIN FUNCTION ====================

export async function registerRoutes(app: Express): Promise<Server> {
  app.set('trust proxy', 1);
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true,
  }));
  app.use('/api/', generalLimiter);

  initEmailService();

  // 3. Special Route Parsing (MUST BE FIRST)
  app.post('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;
    try {
      if (!sig || !webhookSecret) throw new Error('Missing Stripe signature or secret');
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } catch (err: any) {
      console.error(`[Stripe Webhook] Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      handleStripeFulfillment(session).catch(err => console.error('[Fulfillment Crash]', err));
    }
    res.json({ received: true });
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  const PgSession = connectPg(session);
  app.use(
    session({
      store: new PgSession({
        conString: process.env.DATABASE_URL,
        tableName: 'sessions', 
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'taptopload-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // ==================== STRIPE FULFILLMENT ====================
  async function handleStripeFulfillment(session: Stripe.Checkout.Session) {
    const { metadata, payment_intent } = session;
    if (!metadata || !metadata.phoneNumber || !metadata.baseAmountUSD) return;

    const intentId = typeof payment_intent === 'string' ? payment_intent : payment_intent?.id;
    if (intentId && storage.getTransactionByStripeIntentId) {
      const existingTx = await storage.getTransactionByStripeIntentId(intentId);
      if (existingTx) return;
    }

    const phoneNumber = metadata.phoneNumber; 
    const amountUSD = parseFloat(metadata.baseAmountUSD || '0');
    const userId = metadata.userId === 'guest' ? null : parseInt(metadata.userId);
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    try {
      const transaction = await storage.createTransaction({
        userId: userId,
        transactionId,
        phoneNumber,
        amount: metadata.baseAmount,
        amountUsd: amountUSD.toString(),
        commission: metadata.commission,
        totalReceived: metadata.totalWithCommission,
        totalReceivedUsd: metadata.totalWithCommission,
        operatorCode: metadata.operatorCode || 'UNKNOWN',
        paymentMethod: 'stripe_checkout',
        status: 'processing', 
        currency: metadata.baseCurrency,
        stripePaymentIntentId: intentId || null,
      });

      const { sendRecharge } = await import('./dingconnect');
      const dingResult = await sendRecharge(phoneNumber, amountUSD, transactionId, 'HT');

      if (dingResult.ResultCode === 1) {
        await storage.updateTransaction(transaction.id, {
          status: 'completed',
          dtoneExternalId: dingResult.TransferRecord?.TransferId?.TransferRef || null,
          dtoneStatus: 'Complete'
        });

        if (metadata.requestCode) {
          const req = await storage.getRechargeRequestByCode(metadata.requestCode);
          if (req) await storage.updateRechargeRequest(req.id, { status: 'completed' });
        }

        if (metadata.recurringRechargeId) {
           await storage.updateRecurringRecharge(parseInt(metadata.recurringRechargeId), { 
             status: 'active',
             lastRechargeDate: new Date().toISOString()
           });
        }

        if (userId) {
          wsManager.sendToUser(userId, 'transaction_completed', { transactionId: transaction.id });
          
          // ✅ TELEGRAM NOTIFICATION
          const user = await storage.getUser(userId);
          if (user && user.telegramId) {
            sendTelegramNotification(user.telegramId, `✅ Top-up Successful!!! Ref: ${transactionId}`);
          }
        }
        
      } else {
        throw new Error(`DingConnect Error: ${dingResult.ErrorCodes?.[0]?.Code || 'Unknown'}`);
      }

    } catch (error: any) {
      if (intentId) {
        const failedTx = await storage.getTransactionByStripeIntentId(intentId);
        if (failedTx) await storage.updateTransaction(failedTx.id, { status: 'failed', dtoneStatus: error.message });
      }
    }
  }

  // ==================== AUTH / PASSPORT ====================
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => done(null, user.id));
  
  // ✅ FIXED: Robust deserialization to prevent "Failed to deserialize" crashes
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User not found in DB, invalidate session nicely
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      console.error('[Passport] Deserialization Error:', err);
      // On error, invalidate session instead of crashing request with 500
      done(null, false); 
    }
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://localhost:5000"}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value;
      const firstName = profile.name?.givenName || profile.displayName;
      const lastName = profile.name?.familyName || "";
      const photo = profile.photos?.[0]?.value;

      let user = await storage.getUserByGoogleId(googleId);
      if (!user) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        user = await storage.createUser({ firstName, lastName, email, password: hashedPassword, role: 'user', googleId: googleId, authProvider: 'google', profilePicture: photo, isVerified: true });
      }
      if (user.phone) storage.linkPendingRequestsToUser(user.id, user.phone).catch(console.error);
      return done(null, user);
    } catch (err) { return done(err as any, undefined); }
  }));

  // ==================== API ROUTES ====================

  // ✅ TELEGRAM CREATE INVOICE
  app.post('/api/telegram/create-invoice', requireAuth, async (req, res) => {
    try {
      const { amount, phoneNumber, currency = 'USD' } = req.body;
      if (!amount || !phoneNumber) return res.status(400).json({ message: 'Données manquantes' });

      const validation = validatePhoneNumber(phoneNumber);
      if (!validation.isValid) return res.status(400).json({ message: 'Numéro invalide' });
      
      const cleanPhoneNumber = validation.fullNumber || normalizePhoneNumber(phoneNumber);
      const numAmount = parseFloat(amount);
      const amountInUSD = convertToUSD(numAmount, currency);
      const commission = calculateCommission(amountInUSD);
      const totalAmount = parseFloat((amountInUSD + commission).toFixed(2));
      
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      const transaction = await storage.createTransaction({
        userId: req.session.userId!,
        transactionId,
        phoneNumber: cleanPhoneNumber,
        amount: amount.toString(),
        amountUsd: amountInUSD.toString(),
        commission: commission.toString(),
        totalReceived: totalAmount.toString(), 
        totalReceivedUsd: totalAmount.toString(),
        operatorCode: validation.operator || 'UNKNOWN',
        paymentMethod: 'telegram_native',
        status: 'pending', 
        currency: currency,
      });

      const invoiceUrl = await createTelegramInvoiceLink(transaction);
      res.json({ url: invoiceUrl });

    } catch (error: any) {
      console.error('[Telegram API] Invoice Error:', error);
      res.status(500).json({ message: error.message || "Erreur création facture" });
    }
  });

  // Stripe & Auth Routes
  app.get('/api/config/stripe-key', (req, res) => res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' }));
  
  app.post('/api/stripe/create-checkout-session', async (req, res) => {
    try {
      const { amount, phoneNumber, currency = 'USD', requestCode, recurringRechargeId } = req.body;
      if (!amount || !phoneNumber) return res.status(400).json({ message: 'Données manquantes' });
      const validation = validatePhoneNumber(phoneNumber);
      if (!validation.isValid) return res.status(400).json({ message: 'Numéro invalide' });
      const cleanPhoneNumber = validation.fullNumber || normalizePhoneNumber(phoneNumber);
      const numAmount = parseFloat(amount);
      const amountInUSD = convertToUSD(numAmount, currency);
      const commission = calculateCommission(amountInUSD);
      const totalAmount = parseFloat((amountInUSD + commission).toFixed(2));
      const baseUrl = getBaseUrl(req);
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: req.session.userId ? (await storage.getUser(req.session.userId))?.email || undefined : undefined,
        line_items: [{ price_data: { currency: 'usd', product_data: { name: `Recharge Mobile (${validation.country})`, description: `${amount} ${currency} pour ${cleanPhoneNumber}` }, unit_amount: Math.round(totalAmount * 100) }, quantity: 1 }],
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard/recharge?canceled=true`,
        metadata: { userId: req.session.userId?.toString() || 'guest', phoneNumber: cleanPhoneNumber, operatorCode: validation.operator || 'UNKNOWN', baseAmount: amount.toString(), baseCurrency: currency, baseAmountUSD: amountInUSD.toString(), commission: commission.toString(), totalWithCommission: totalAmount.toString(), requestCode: requestCode || '', recurringRechargeId: recurringRechargeId?.toString() || '' },
      });
      res.json({ url: session.url });
    } catch (error: any) { res.status(500).json({ message: error.message }); }
  });

  app.get('/api/stripe/checkout-success', async (req, res) => {
    try {
      const { session_id } = req.query;
      if (typeof session_id !== 'string') return res.status(400).json({ message: 'session_id manquant' });
      const session = await stripe.checkout.sessions.retrieve(session_id);
      res.json({ success: true, metadata: session.metadata, payment_status: session.payment_status });
    } catch (error: any) { res.status(500).json({ message: 'Erreur récupération session' }); }
  });

  // Auth Routes
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    if (req.user) (req.session as any).userId = (req.user as any).id;
    res.redirect('/dashboard');
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      if (data.email && await storage.getUserByEmail(data.email)) return res.status(400).json({ message: 'Email déjà utilisé' });
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      req.session.userId = user.id;
      if (data.phone) storage.linkPendingRequestsToUser(user.id, data.phone).catch(console.error);
      const { password, ...u } = user;
      res.json({ user: u });
    } catch (error) { if (error instanceof z.ZodError) return res.status(400).json({ message: error.errors[0].message }); res.status(500).json({ message: 'Erreur inscription' }); }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { identifier, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByIdentifier(identifier);
      if (!user || !user.password || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Identifiants incorrects' });
      req.session.userId = user.id;
      if (user.phone) storage.linkPendingRequestsToUser(user.id, user.phone).catch(console.error);
      req.session.save(() => { const { password: _, ...u } = user; res.json({ user: u }); });
    } catch (error) { res.status(500).json({ message: 'Erreur connexion' }); }
  });

  app.post('/api/auth/telegram', async (req, res) => {
    try {
      const { initData, widgetData } = req.body;
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      if (!BOT_TOKEN) return res.status(500).json({ message: "Bot token not configured" });
      let userData: any = null; let telegramId: string = "";
      // Validate initData...
      if (initData) {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash'); urlParams.delete('hash');
        const dataCheckString = Array.from(urlParams.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([key, val]) => `${key}=${val}`).join('\n');
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
        if (crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex') !== hash) return res.status(403).json({ message: "Invalid Mini App signature" });
        userData = JSON.parse(urlParams.get('user')!); telegramId = userData.id.toString();
      } else if (widgetData) {
        // ... (widget validation) ...
        const { hash, ...data } = widgetData;
        const dataCheckString = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('\n');
        const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
        if (crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex') !== hash) return res.status(403).json({ message: "Invalid Widget signature" });
        userData = widgetData; telegramId = userData.id.toString();
      } else { return res.status(400).json({ message: "No valid Telegram data found" }); }

      let user = await storage.getUserByTelegramId(telegramId);
      if (!user) {
        const randomEmail = `tg_${telegramId}@taptopload.internal`;
        const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
        user = await storage.createUser({ telegramId, firstName: userData.first_name, lastName: userData.last_name || '', username: userData.username || `user_${telegramId}`, email: randomEmail, password: hashedPassword, phone: null as any, profilePicture: userData.photo_url || null, role: 'user' });
      }
      req.session.userId = user.id;
      if (user.phone) storage.linkPendingRequestsToUser(user.id, user.phone).catch(console.error);
      req.session.save(() => { const { password, ...u } = user!; res.json({ user: u }); });
    } catch (error) { res.status(500).json({ message: "Login failed" }); }
  });

  app.post('/api/auth/logout', (req, res) => { req.session.destroy(() => res.json({ message: 'Déconnexion réussie' })); });
  app.get('/api/auth/me', requireAuth, async (req, res) => { const user = await storage.getUser(req.session.userId!); if (!user) return res.status(404).json({ message: 'Not found' }); const { password, ...u } = user; res.json({ user: u }); });
  
  app.put('/api/profile', requireAuth, async (req, res) => {
    try {
      const data = updateProfileSchema.parse(req.body);
      await storage.updateUser(req.session.userId!, data);
      if (data.phone) await storage.linkPendingRequestsToUser(req.session.userId!, data.phone);
      res.json({ success: true });
    } catch (error) { res.status(500).json({ message: 'Mise à jour échouée' }); }
  });

  // Request Routes
  app.get('/api/recharge-requests', requireAuth, async (req, res) => { const requests = await storage.getRechargeRequestsByRecipientUserId(req.session.userId!); res.json(requests); });
  app.get('/api/recharge-requests/sent', requireAuth, async (req, res) => { const requests = await storage.getRechargeRequestsBySenderId(req.session.userId!); res.json(requests); });
  app.post('/api/recharge-requests', requireAuth, async (req, res) => {
    try {
      const data = insertRechargeRequestSchema.parse(req.body);
      const requestCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 7);
      const request = await storage.createRechargeRequest({ ...data, userId: req.session.userId!, requestCode, expiresAt: expiresAt.toISOString(), status: 'pending' });
      if (data.receiverPhone) { 
        const recipient = await storage.getUserByPhone(data.receiverPhone); 
        if (recipient) await storage.updateRechargeRequest(request.id, { recipientUserId: recipient.id });
      }
      res.json(request);
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
  });
  
  app.post('/api/recharge-requests/:id/accept', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getRechargeRequest(id);
      if (!request) return res.status(404).json({ message: "Demande introuvable" });
      const updated = await storage.updateRechargeRequest(id, { status: 'accepted' });
      if (request.userId) wsManager.sendToUser(request.userId, 'recharge_request_accepted', { amount: request.amount, senderName: 'Un ami' });
      res.json(updated);
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
  });

  app.post('/api/recharge-requests/:id/decline', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getRechargeRequest(id);
      if (!request) return res.status(404).json({ message: "Demande introuvable" });
      const updated = await storage.updateRechargeRequest(id, { status: 'declined' });
      if (request.userId) wsManager.sendToUser(request.userId, 'recharge_request_declined', { amount: request.amount });
      res.json(updated);
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
  });

  app.post('/api/recharge-requests/:id/cancel', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getRechargeRequest(id);
      if (!request) return res.status(404).json({ message: "Demande introuvable" });
      if (request.userId !== req.session.userId) return res.status(403).json({ message: "Non autorisé" });
      const updated = await storage.updateRechargeRequest(id, { status: 'cancelled' });
      res.json(updated);
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
  });

  app.delete('/api/recharge-requests/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getRechargeRequest(id);
      if (!request) return res.status(404).json({ message: "Demande introuvable" });
      await storage.deleteRechargeRequest(id);
      res.json({ success: true });
    } catch (error) { res.status(500).json({ message: "Erreur" }); }
  });

  app.get('/api/recharge-requests/search/:code', async (req, res) => {
    try {
      const { code } = req.params;
      const request = await storage.getRechargeRequestByCode(code);
      if (!request) return res.status(404).json({ message: "Demande introuvable" });
      res.json({ request });
    } catch (error) { res.status(500).json({ message: "Erreur recherche" }); }
  });

  app.get('/api/recharge-requests/count', requireAuth, async (req, res) => {
    try {
      const count = await storage.getPendingRequestsCount(req.session.userId!);
      res.json({ count });
    } catch (error) { res.status(500).json({ message: 'Erreur' }); }
  });

  app.get('/api/transactions', requireAuth, async (req, res) => {
      const transactions = await storage.getTransactionsByUserId(req.session.userId!);
      res.json(transactions);
  });

  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
    const stats = await storage.getDashboardStats(req.session.userId!);
    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}

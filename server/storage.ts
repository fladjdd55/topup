import { db } from "./db";
import { eq, desc, and, sql, or, count, isNull, lt, lte } from "drizzle-orm"; // ✅ Added lt, lte
import { 
  users, transactions, favorites, operators, rechargeRequests, notifications,
  stripeCustomers, passwordResetTokens, currencies, recurringRecharges,
  loyaltyTiers, loyaltyPoints, loyaltyTransactions,
  type User, type InsertUser, type Transaction, type InsertTransaction,
  type Favorite, type InsertFavorite, type Operator, type InsertOperator,
  type RechargeRequest, type InsertRechargeRequest, type Notification,
  type InsertNotification, type StripeCustomer, type InsertStripeCustomer,
  type PasswordResetToken, type InsertPasswordResetToken, type Currency,
  type InsertCurrency, type RecurringRecharge, type InsertRecurringRecharge,
  type LoyaltyTier, type InsertLoyaltyTier, type LoyaltyPoints,
  type InsertLoyaltyPoints, type LoyaltyTransaction, type InsertLoyaltyTransaction,
} from "@shared/schema";
import { encrypt, decrypt, encryptUserData, decryptUserData } from "./encryption";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserByIdentifier(identifier: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;

  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  getTransactionByStripeIntentId(stripeIntentId: string): Promise<Transaction | undefined>; 
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getAllTransactions(limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined>;
  getExpiredPendingConfirmations(currentTime: string): Promise<Transaction[]>;
  getDashboardStats(userId: number): Promise<{
    totalRecharged: string;
    transactionCount: number;
    successRate: number;
    pendingRequests: number;
    recentTransactions: Transaction[];
  }>;

  // Favorites
  getFavorite(id: number): Promise<Favorite | undefined>;
  getFavoritesByUserId(userId: number): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<void>;

  // Operators
  getOperator(id: number): Promise<Operator | undefined>;
  getOperatorByCode(code: string): Promise<Operator | undefined>;
  getAllOperators(): Promise<Operator[]>;
  createOperator(operator: InsertOperator): Promise<Operator>;

  // Recharge Requests
  getRechargeRequest(id: number): Promise<RechargeRequest | undefined>;
  getRechargeRequestByCode(code: string): Promise<RechargeRequest | undefined>;
  getRechargeRequestsByRecipientUserId(userId: number): Promise<RechargeRequest[]>;
  getRechargeRequestsByUserId(userId: number): Promise<RechargeRequest[]>;
  getRechargeRequestsBySenderId(userId: number): Promise<RechargeRequest[]>;
  createRechargeRequest(request: InsertRechargeRequest): Promise<RechargeRequest>;
  updateRechargeRequest(id: number, data: Partial<RechargeRequest>): Promise<RechargeRequest | undefined>;
  deleteRechargeRequest(id: number): Promise<void>;
  getPendingRequestsCount(userId: number): Promise<number>;
  
  // Link
  linkPendingRequestsToUser(userId: number, phone: string): Promise<void>;

  // Notifications
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Stripe
  getStripeCustomerByUserId(userId: number): Promise<StripeCustomer | undefined>;
  createStripeCustomer(customer: InsertStripeCustomer): Promise<StripeCustomer>;

  // Password Reset Tokens
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(id: number): Promise<void>;

  // Admin
  getAdminStats(): Promise<any>;

  // Currencies
  getAllCurrencies(): Promise<Currency[]>;
  getActiveCurrencies(): Promise<Currency[]>;
  getCurrencyByCode(code: string): Promise<Currency | undefined>;
  updateCurrency(id: number, data: Partial<Currency>): Promise<Currency | undefined>;
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;

  // Recurring Recharges
  getRecurringRecharge(id: number): Promise<RecurringRecharge | undefined>;
  getRecurringRechargesByUserId(userId: number): Promise<RecurringRecharge[]>;
  getActiveRecurringRecharges(): Promise<RecurringRecharge[]>;
  getPendingRecurringRecharges(): Promise<RecurringRecharge[]>;
  createRecurringRecharge(recharge: InsertRecurringRecharge): Promise<RecurringRecharge>;
  updateRecurringRecharge(id: number, data: Partial<RecurringRecharge>): Promise<RecurringRecharge | undefined>;
  deleteRecurringRecharge(id: number): Promise<void>;

  // Loyalty Program
  getLoyaltyTiers(): Promise<LoyaltyTier[]>;
  getLoyaltyTierById(id: number): Promise<LoyaltyTier | undefined>;
  getLoyaltyTierByPoints(points: number): Promise<LoyaltyTier | undefined>;
  getLoyaltyPoints(userId: number): Promise<LoyaltyPoints | undefined>;
  createLoyaltyPoints(points: InsertLoyaltyPoints): Promise<LoyaltyPoints>;
  updateLoyaltyPoints(userId: number, data: Partial<LoyaltyPoints>): Promise<LoyaltyPoints | undefined>;
  addLoyaltyPoints(userId: number, points: number, type: string, description: string, transactionId?: number): Promise<void>;
  getLoyaltyTransactionsByUserId(userId: number, limit?: number): Promise<LoyaltyTransaction[]>;
  redeemPoints(userId: number, pointsToRedeem: number): Promise<{ success: boolean; creditAmount: number; message: string }>;
  getChartData(userId: number, period: '7d' | '30d' | '12m' | 'year'): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number) { 
    const [u] = await db.select().from(users).where(eq(users.id, id)); 
    return u ? { ...u, ...decryptUserData(u) } : undefined; 
  }

  async getUserByEmail(email: string) { 
    const all = await db.select().from(users); 
    const u = all.find(x => x.email && decrypt(x.email) === email); 
    return u ? { ...u, ...decryptUserData(u) } : undefined; 
  }

  async getUserByPhone(phone: string) { 
    const all = await db.select().from(users); 
    const target = phone.replace(/[^\d+]/g, '');
    const u = all.find(x => x.phone && decrypt(x.phone)?.replace(/[^\d+]/g, '') === target);
    return u ? { ...u, ...decryptUserData(u) } : undefined;
  }

  async getUserByIdentifier(id: string) { 
    const u = await this.getUserByEmail(id); 
    return u || await this.getUserByPhone(id); 
  }

  async getUserByTelegramId(tid: string) { 
    const [u] = await db.select().from(users).where(eq(users.telegramId, tid)); 
    return u ? { ...u, ...decryptUserData(u) } : undefined; 
  }
  
  async createUser(data: InsertUser) {
    const enc = encryptUserData(data);
    const [u] = await db.insert(users).values({ ...data, ...enc }).returning();
    return { ...u, ...decryptUserData(u) };
  }

  async updateUser(id: number, data: Partial<User>) {
    const enc: any = {};
    if (data.email !== undefined) enc.email = encrypt(data.email);
    if (data.phone !== undefined) enc.phone = encrypt(data.phone);
    if (data.firstName !== undefined) enc.firstName = encrypt(data.firstName);
    if (data.lastName !== undefined) enc.lastName = encrypt(data.lastName);
    const [u] = await db.update(users).set({ ...data, ...enc, updatedAt: new Date().toISOString() }).where(eq(users.id, id)).returning();
    return u ? { ...u, ...decryptUserData(u) } : undefined;
  }

  async deleteUser(id: number) { await db.delete(users).where(eq(users.id, id)); }

  async getAllUsers() { 
    const all = await db.select().from(users).orderBy(desc(users.createdAt)); 
    return all.map(u => ({ ...u, ...decryptUserData(u) })); 
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    if (!user) return undefined;
    return {
      ...user,
      ...decryptUserData({
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    };
  }

  // Transactions
  async getTransaction(id: number) { const [t] = await db.select().from(transactions).where(eq(transactions.id, id)); return t; }
  async getTransactionByTransactionId(tid: string) { const [t] = await db.select().from(transactions).where(eq(transactions.transactionId, tid)); return t; }
  async getTransactionByStripeIntentId(sid: string) { const [t] = await db.select().from(transactions).where(eq(transactions.stripePaymentIntentId, sid)); return t; }
  async getTransactionsByUserId(uid: number) { return db.select().from(transactions).where(eq(transactions.userId, uid)).orderBy(desc(transactions.createdAt)); }
  async getAllTransactions(limit = 100) { return db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(limit); }
  async createTransaction(t: InsertTransaction) { const [newT] = await db.insert(transactions).values(t).returning(); return newT; }
  async updateTransaction(id: number, data: Partial<Transaction>) { const [t] = await db.update(transactions).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(transactions.id, id)).returning(); return t; }
  
  // ✅ FIX: Replaced raw SQL with Drizzle Query Builder
  async getExpiredPendingConfirmations(time: string) { 
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.status, 'pending_confirmation'),
          lt(transactions.confirmationDeadline, time)
        )
      ); 
  }
  
  async getDashboardStats(userId: number) {
    const txs = await this.getTransactionsByUserId(userId);
    const completed = txs.filter(t => t.status === 'completed');
    const total = completed.reduce((sum, t) => sum + (t.totalReceivedUsd ? parseFloat(t.totalReceivedUsd) : parseFloat(t.amount)), 0).toFixed(2);
    const rate = txs.length > 0 ? Math.round((completed.length / txs.length) * 100) : 0;
    const pending = await this.getPendingRequestsCount(userId);
    return { totalRecharged: `$${total} USD`, transactionCount: txs.length, successRate: rate, pendingRequests: pending, recentTransactions: txs.slice(0, 5) };
  }

  // Favorites
  async getFavorite(id: number) { const [f] = await db.select().from(favorites).where(eq(favorites.id, id)); return f; }
  async getFavoritesByUserId(uid: number) { return db.select().from(favorites).where(eq(favorites.userId, uid)).orderBy(desc(favorites.createdAt)); }
  async createFavorite(f: InsertFavorite) { const [n] = await db.insert(favorites).values(f).returning(); return n; }
  async deleteFavorite(id: number) { await db.delete(favorites).where(eq(favorites.id, id)); }

  // Operators
  async getOperator(id: number) { const [o] = await db.select().from(operators).where(eq(operators.id, id)); return o; }
  async getOperatorByCode(code: string) { const [o] = await db.select().from(operators).where(eq(operators.code, code)); return o; }
  async getAllOperators() { return db.select().from(operators).where(eq(operators.isActive, true)); }
  async createOperator(o: InsertOperator) { const [n] = await db.insert(operators).values(o).returning(); return n; }

  // Recharge Requests
  async getRechargeRequest(id: number) { const [r] = await db.select().from(rechargeRequests).where(eq(rechargeRequests.id, id)); return r; }
  async getRechargeRequestByCode(code: string) { const [r] = await db.select().from(rechargeRequests).where(eq(rechargeRequests.requestCode, code)); return r; }
  
  async getRechargeRequestsByRecipientUserId(userId: number) {
    const user = await this.getUser(userId);
    // 1. Direct links
    const direct = await db.select().from(rechargeRequests).where(eq(rechargeRequests.recipientUserId, userId)).orderBy(desc(rechargeRequests.createdAt));
    if (!user?.phone) return direct;

    // 2. Phone matches
    const cleanPhone = user.phone.replace(/[^\d+]/g, '').replace(/^([^+])/, '+$1');
    const phoneMatches = await db.select().from(rechargeRequests).where(eq(rechargeRequests.receiverPhone, cleanPhone)).orderBy(desc(rechargeRequests.createdAt));
    
    // 3. Merge & Link
    const all = [...direct];
    const ids = new Set(all.map(r => r.id));
    for (const req of phoneMatches) {
      if (!ids.has(req.id)) {
        all.push(req);
        ids.add(req.id);
        // Auto-link for future
        if (!req.recipientUserId) {
          await db.update(rechargeRequests).set({ recipientUserId: userId }).where(eq(rechargeRequests.id, req.id));
          req.recipientUserId = userId;
        }
      }
    }
    return all.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getRechargeRequestsByUserId(uid: number) { return db.select().from(rechargeRequests).where(eq(rechargeRequests.userId, uid)).orderBy(desc(rechargeRequests.createdAt)); }
  async getRechargeRequestsBySenderId(uid: number) { return this.getRechargeRequestsByUserId(uid); }
  async createRechargeRequest(r: InsertRechargeRequest) { const [n] = await db.insert(rechargeRequests).values(r).returning(); return n; }
  async updateRechargeRequest(id: number, d: Partial<RechargeRequest>) { const [r] = await db.update(rechargeRequests).set({ ...d, updatedAt: new Date().toISOString() }).where(eq(rechargeRequests.id, id)).returning(); return r; }
  async deleteRechargeRequest(id: number) { await db.delete(rechargeRequests).where(eq(rechargeRequests.id, id)); }
  async getPendingRequestsCount(uid: number) { const [c] = await db.select({ count: count() }).from(rechargeRequests).where(and(eq(rechargeRequests.recipientUserId, uid), eq(rechargeRequests.status, 'pending'))); return c?.count || 0; }

  async linkPendingRequestsToUser(userId: number, phone: string) {
    if (!phone) return;
    
    // Normalize phone consistently
    let cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;
    
    const phoneVariations = [
      cleanPhone,
      cleanPhone.replace('+', ''), // without +
      '+' + cleanPhone.replace(/^\+/, '') // ensure single +
    ];
    
    console.log(`[Storage] Linking requests for ${cleanPhone} to user ${userId}`);
    
    try {
      for (const variant of phoneVariations) {
        await db.update(rechargeRequests)
          .set({ recipientUserId: userId })
          .where(
            and(
              eq(rechargeRequests.receiverPhone, variant),
              isNull(rechargeRequests.recipientUserId)
            )
          );
      }
    } catch (e) { 
      console.error('[Storage] Link error:', e); 
    }
  }

  // Notifications
  async getNotificationsByUserId(uid: number) { return db.select().from(notifications).where(eq(notifications.userId, uid)).orderBy(desc(notifications.createdAt)).limit(50); }
  async createNotification(n: InsertNotification) { const [nn] = await db.insert(notifications).values(n).returning(); return nn; }
  async markNotificationAsRead(id: number) { await db.update(notifications).set({ isRead: true, updatedAt: new Date().toISOString() }).where(eq(notifications.id, id)); }
  
  // Stripe
  async getStripeCustomerByUserId(uid: number) { const [c] = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, uid)); return c; }
  async createStripeCustomer(c: InsertStripeCustomer) { const [nc] = await db.insert(stripeCustomers).values(c).returning(); return nc; }
  
  // Password Reset
  async createPasswordResetToken(t: InsertPasswordResetToken) { const [nt] = await db.insert(passwordResetTokens).values(t).returning(); return nt; }
  async getPasswordResetToken(t: string) { const [rt] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, t)); return rt; }
  async markPasswordResetTokenAsUsed(id: number) { await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, id)); }
  
  // Admin
  async getAdminStats() { 
    const [uc] = await db.select({ count: count() }).from(users);
    const txs = await db.select().from(transactions);
    const comp = txs.filter(t => t.status === 'completed');
    const rev = comp.reduce((s, t) => s + (t.totalReceivedUsd ? parseFloat(t.totalReceivedUsd) : 0), 0).toFixed(2);
    const rate = txs.length > 0 ? Math.round((comp.length / txs.length) * 100) : 0;
    return { totalUsers: uc?.count || 0, totalRevenue: `$${rev} USD`, totalTransactions: txs.length, successRate: rate };
  }

  // Currencies
  async getAllCurrencies() { return db.select().from(currencies); }
  async getActiveCurrencies() { return db.select().from(currencies).where(eq(currencies.isActive, true)); }
  async getCurrencyByCode(c: string) { const [curr] = await db.select().from(currencies).where(eq(currencies.code, c)); return curr; }
  async updateCurrency(id: number, d: Partial<Currency>) { const [c] = await db.update(currencies).set({ ...d, updatedAt: new Date().toISOString() }).where(eq(currencies.id, id)).returning(); return c; }
  async convertCurrency(amt: number, from: string, to: string) { 
    const f = await this.getCurrencyByCode(from); const t = await this.getCurrencyByCode(to); 
    if (!f || !t) throw new Error('Currency not found');
    return Math.round((amt / parseFloat(f.exchangeRate)) * parseFloat(t.exchangeRate) * 100) / 100;
  }
  
  // Recurring
  async getRecurringRecharge(id: number) { const [r] = await db.select().from(recurringRecharges).where(eq(recurringRecharges.id, id)); return r; }
  async getRecurringRechargesByUserId(uid: number) { return db.select().from(recurringRecharges).where(eq(recurringRecharges.userId, uid)).orderBy(desc(recurringRecharges.createdAt)); }
  async getActiveRecurringRecharges() { return db.select().from(recurringRecharges).where(eq(recurringRecharges.isActive, true)); }
  
  // ✅ FIX: Also secured recurring recharges query
  async getPendingRecurringRecharges() { 
    return db
      .select()
      .from(recurringRecharges)
      .where(
        and(
          eq(recurringRecharges.isActive, true),
          lte(recurringRecharges.nextExecutionDate, new Date().toISOString())
        )
      ); 
  }

  async createRecurringRecharge(r: InsertRecurringRecharge) { const [nr] = await db.insert(recurringRecharges).values(r).returning(); return nr; }
  async updateRecurringRecharge(id: number, d: Partial<RecurringRecharge>) { const [r] = await db.update(recurringRecharges).set({ ...d, updatedAt: new Date().toISOString() }).where(eq(recurringRecharges.id, id)).returning(); return r; }
  async deleteRecurringRecharge(id: number) { await db.delete(recurringRecharges).where(eq(recurringRecharges.id, id)); }

  // Loyalty
  async getLoyaltyTiers() { return db.select().from(loyaltyTiers).orderBy(loyaltyTiers.minPoints); }
  async getLoyaltyTierById(id: number) { const [t] = await db.select().from(loyaltyTiers).where(eq(loyaltyTiers.id, id)); return t; }
  async getLoyaltyTierByPoints(pts: number) { 
    const tiers = await this.getLoyaltyTiers(); 
    return tiers.find(t => pts >= t.minPoints && (!t.maxPoints || pts <= t.maxPoints)); 
  }
  async getLoyaltyPoints(uid: number) { const [p] = await db.select().from(loyaltyPoints).where(eq(loyaltyPoints.userId, uid)); return p; }
  async createLoyaltyPoints(p: InsertLoyaltyPoints) { const [np] = await db.insert(loyaltyPoints).values(p).returning(); return np; }
  async updateLoyaltyPoints(uid: number, d: Partial<LoyaltyPoints>) { const [p] = await db.update(loyaltyPoints).set({ ...d, updatedAt: new Date().toISOString() }).where(eq(loyaltyPoints.userId, uid)).returning(); return p; }
  async addLoyaltyPoints(uid: number, pts: number, type: string, desc: string, tid?: number) {
    let up = await this.getLoyaltyPoints(uid);
    if (!up) up = await this.createLoyaltyPoints({ userId: uid, points: 0, totalEarned: 0, totalRedeemed: 0 });
    const newPts = (type === 'earned' || type === 'bonus') ? (up.points || 0) + pts : (up.points || 0) - pts;
    const newEarned = (type === 'earned' || type === 'bonus') ? (up.totalEarned || 0) + pts : (up.totalEarned || 0);
    const newRedeemed = (type === 'redeemed') ? (up.totalRedeemed || 0) + pts : (up.totalRedeemed || 0);
    const tier = await this.getLoyaltyTierByPoints(newEarned);
    await this.updateLoyaltyPoints(uid, { points: newPts, totalEarned: newEarned, totalRedeemed: newRedeemed, currentTierId: tier?.id });
    await db.insert(loyaltyTransactions).values({ userId: uid, points: pts, type, description: desc, transactionId: tid });
  }
  async getLoyaltyTransactionsByUserId(uid: number, limit = 50) { return db.select().from(loyaltyTransactions).where(eq(loyaltyTransactions.userId, uid)).orderBy(desc(loyaltyTransactions.createdAt)).limit(limit); }
  async redeemPoints(uid: number, pts: number) {
    const up = await this.getLoyaltyPoints(uid);
    if (!up || (up.points || 0) < pts) return { success: false, creditAmount: 0, message: 'Points insuffisants' };
    const credit = pts / 100;
    await this.addLoyaltyPoints(uid, pts, 'redeemed', `Échange ${pts} pts`);
    const u = await this.getUser(uid);
    if (u) await this.updateUser(uid, { balance: (parseFloat(u.balance || '0') + credit).toString() });
    return { success: true, creditAmount: credit, message: 'Succès' };
  }
  async getChartData(uid: number, period: string) { return { timeline: [], operators: [] }; } 
}

export const storage = new DatabaseStorage();

import { pgTable, foreignKey, serial, integer, varchar, timestamp, index, json, unique, boolean, numeric, text, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS TABLE ====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email"), // Changed to text for encrypted data
  phone: text("phone"), // Changed to text for encrypted data  
  firstName: text("first_name"), // Changed to text for encrypted data
  lastName: text("last_name"), // Changed to text for encrypted data
  password: varchar("password", { length: 255 }),
  isVerified: boolean("is_verified").default(false),
  balance: numeric("balance", { precision: 10, scale: 2 }).default('0.00'),
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default('USD'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  role: varchar("role", { length: 20 }).default('user'),
  lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
  facebookId: varchar("facebook_id", { length: 255 }),
  googleId: varchar("google_id", { length: 255 }).unique(),
  telegramId: text("telegram_id").unique(),
  profilePicture: text("profile_picture"),
  authProvider: varchar("auth_provider", { length: 50 }).default('local'),
  disputeCount: integer("dispute_count").default(0),
  isBlocked: boolean("is_blocked").default(false),
  blockedReason: text("blocked_reason"),
}, (table) => [
  index("idx_users_auth_provider").on(table.authProvider),
  index("idx_users_facebook_id").on(table.facebookId),
  unique("users_google_id_key").on(table.googleId),
  unique("users_email_key").on(table.email),
  unique("users_phone_key").on(table.phone),
  unique("users_facebook_id_key").on(table.facebookId),
]);

// ==================== OPERATORS TABLE ====================
export const operators = pgTable("operators", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  country: varchar("country", { length: 10 }).default('HT'),
  prefixes: json("prefixes"),
  isActive: boolean("is_active").default(true),
  minAmount: numeric("min_amount", { precision: 10, scale: 2 }),
  maxAmount: numeric("max_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  color: varchar("color", { length: 50 }),
}, (table) => [
  unique("operators_code_key").on(table.code),
  index("idx_operators_code").on(table.code),
  index("idx_operators_country").on(table.country),
]);

// ==================== TRANSACTIONS TABLE ====================
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  transactionId: varchar("transaction_id", { length: 100 }).notNull(),
  phoneNumber: text("phone_number").notNull(), // Changed to text for encrypted data
  operatorCode: varchar("operator_code", { length: 50 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }),
  commission: numeric("commission", { precision: 10, scale: 2 }).default('0.00'),
  totalReceived: numeric("total_received", { precision: 10, scale: 2 }),
  totalReceivedUsd: numeric("total_received_usd", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default('USD'),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  rechargeType: varchar("recharge_type", { length: 20 }).default('credit'),
  status: varchar("status", { length: 20 }).default('pending'),
  externalId: varchar("external_id", { length: 100 }),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).unique(),
  stripeChargeId: varchar("stripe_charge_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }),
  stripeStatus: varchar("stripe_status", { length: 50 }),
  processingFee: numeric("processing_fee", { precision: 10, scale: 2 }),
  dtoneTransactionId: integer("dtone_transaction_id"),
  dtoneExternalId: varchar("dtone_external_id", { length: 255 }),
  dtoneOperatorId: integer("dtone_operator_id"),
  dtoneOperatorCode: varchar("dtone_operator_code", { length: 100 }),
  dtoneStatus: varchar("dtone_status", { length: 50 }),
  confirmationDeadline: timestamp("confirmation_deadline", { mode: 'string' }),
  confirmationMethod: varchar("confirmation_method", { length: 50 }),
  confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
  disputeReason: text("dispute_reason"),
  recurringRechargeId: integer("recurring_recharge_id"), // 🆕 Link to recurring recharge if this is the initial transaction
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "transactions_user_id_fkey"
  }).onDelete("set null"),
  foreignKey({
    columns: [table.operatorCode],
    foreignColumns: [operators.code],
    name: "transactions_operator_code_fkey"
  }).onDelete("set null"),
  unique("transactions_transaction_id_key").on(table.transactionId),
  index("idx_transactions_stripe_payment_intent").on(table.stripePaymentIntentId),
  index("idx_transactions_stripe_customer").on(table.stripeCustomerId),
  index("idx_transactions_user_id").on(table.userId),
  index("idx_transactions_status").on(table.status),
  index("idx_transactions_phone").on(table.phoneNumber),
]);

// ==================== STRIPE CUSTOMERS TABLE ====================
export const stripeCustomers = pgTable("stripe_customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  defaultPaymentMethodId: varchar("default_payment_method_id", { length: 255 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "stripe_customers_user_id_fkey"
  }).onDelete("cascade"),
  unique("stripe_customers_user_id_key").on(table.userId),
  unique("stripe_customers_stripe_customer_id_key").on(table.stripeCustomerId),
  index("idx_stripe_customers_stripe_id").on(table.stripeCustomerId),
]);

// ==================== STRIPE PAYMENT METHODS TABLE ====================
export const stripePaymentMethods = pgTable("stripe_payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  stripePaymentMethodId: varchar("stripe_payment_method_id", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(),
  brand: varchar("brand", { length: 50 }),
  last4: varchar("last4", { length: 4 }),
  expiryMonth: integer("expiry_month"),
  expiryYear: integer("expiry_year"),
  isDefault: boolean("is_default").default(false),
  nickname: varchar("nickname", { length: 100 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "stripe_payment_methods_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.stripeCustomerId],
    foreignColumns: [stripeCustomers.stripeCustomerId],
    name: "stripe_payment_methods_customer_id_fkey"
  }).onDelete("cascade"),
  unique("stripe_payment_methods_stripe_id_key").on(table.stripePaymentMethodId),
  index("idx_stripe_payment_methods_user").on(table.userId),
  index("idx_stripe_payment_methods_customer").on(table.stripeCustomerId),
]);

// ==================== STRIPE WEBHOOKS TABLE ====================
export const stripeWebhooks = pgTable("stripe_webhooks", {
  id: serial("id").primaryKey(),
  stripeEventId: varchar("stripe_event_id", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  processed: boolean("processed").default(false),
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt", { mode: 'string' }),
  data: jsonb("data").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("stripe_webhooks_event_id_key").on(table.stripeEventId),
  index("idx_stripe_webhooks_type").on(table.eventType),
  index("idx_stripe_webhooks_processed").on(table.processed),
]);

// ==================== FAVORITES TABLE ====================
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  nickname: varchar("nickname", { length: 100 }),
  operatorCode: varchar("operator_code", { length: 50 }),
  country: varchar("country", { length: 10 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "favorites_user_id_fkey"
  }).onDelete("cascade"),
  index("idx_favorites_user_id").on(table.userId),
  index("idx_favorites_operator_code").on(table.operatorCode),
  unique("favorites_user_phone_unique").on(table.userId, table.phoneNumber),
]);

// ==================== RECHARGE REQUESTS TABLE ====================
export const rechargeRequests = pgTable("recharge_requests", {
  id: serial("id").primaryKey(),
  requestCode: varchar("request_code", { length: 50 }).notNull(),
  userId: integer("user_id"),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  operatorCode: varchar("operator_code", { length: 50 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default('USD'),
  status: varchar("status", { length: 20 }).default('pending'),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
  message: text("message"),
  senderName: varchar("sender_name", { length: 100 }),
  senderPhone: varchar("sender_phone", { length: 20 }),
  receiverPhone: varchar("receiver_phone", { length: 20 }),
  recipientUserId: integer("recipient_user_id"),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "recharge_requests_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.operatorCode],
    foreignColumns: [operators.code],
    name: "recharge_requests_operator_code_fkey"
  }).onDelete("set null"),
  foreignKey({
    columns: [table.recipientUserId],
    foreignColumns: [users.id],
    name: "fk_recharge_requests_recipient_user_id"
  }).onDelete("set null"),
  unique("recharge_requests_request_code_key").on(table.requestCode),
  index("idx_recharge_requests_status").on(table.status),
  index("idx_recharge_requests_phone").on(table.phoneNumber),
  index("idx_recharge_requests_recipient_user_id").on(table.recipientUserId),
]);

// ==================== NOTIFICATIONS TABLE ====================
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default('info'),
  isRead: boolean("is_read").default(false),
  data: jsonb("data"),
  createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "notifications_user_id_fkey"
  }).onDelete("cascade"),
  index("idx_notifications_user_id").on(table.userId),
  index("idx_notifications_read").on(table.isRead),
]);

// ==================== SESSIONS TABLE ====================
export const sessions = pgTable("sessions", {
  sid: varchar("sid", { length: 100 }).primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { mode: 'string' }).notNull(),
}, (table) => [
  index("idx_session_expire").on(table.expire),
]);

// ==================== PASSWORD RESET TOKENS TABLE ====================
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "password_reset_tokens_user_id_fkey"
  }).onDelete("cascade"),
  index("idx_password_reset_tokens_token").on(table.token),
  index("idx_password_reset_tokens_user_id").on(table.userId),
]);

// ==================== CURRENCIES TABLE ====================
export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 3 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }).notNull(),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("currencies_code_key").on(table.code),
  index("idx_currencies_code").on(table.code),
]);

// ==================== RECURRING RECHARGES TABLE ====================
export const recurringRecharges = pgTable("recurring_recharges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  operatorCode: varchar("operator_code", { length: 50 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default('USD'),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  dayOfMonth: integer("day_of_month"),
  dayOfWeek: integer("day_of_week"),
  nextExecutionDate: timestamp("next_execution_date", { mode: 'string' }).notNull(),
  lastExecutionDate: timestamp("last_execution_date", { mode: 'string' }),
  isActive: boolean("is_active").default(true),
  needsInitialRecharge: boolean("needs_initial_recharge").default(true), // 🆕 Indique si une première recharge est requise
  failureCount: integer("failure_count").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "recurring_recharges_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.operatorCode],
    foreignColumns: [operators.code],
    name: "recurring_recharges_operator_code_fkey"
  }).onDelete("set null"),
  index("idx_recurring_recharges_user_id").on(table.userId),
  index("idx_recurring_recharges_next_execution").on(table.nextExecutionDate),
  index("idx_recurring_recharges_active").on(table.isActive),
]);

// ==================== LOYALTY TIERS TABLE ====================
export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  minPoints: integer("min_points").notNull(),
  maxPoints: integer("max_points"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 4 }).notNull(),
  benefits: jsonb("benefits"),
  color: varchar("color", { length: 50 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  unique("loyalty_tiers_name_key").on(table.name),
]);

// ==================== LOYALTY POINTS TABLE ====================
export const loyaltyPoints = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  points: integer("points").default(0),
  totalEarned: integer("total_earned").default(0),
  totalRedeemed: integer("total_redeemed").default(0),
  currentTierId: integer("current_tier_id"),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "loyalty_points_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.currentTierId],
    foreignColumns: [loyaltyTiers.id],
    name: "loyalty_points_tier_id_fkey"
  }).onDelete("set null"),
  unique("loyalty_points_user_id_key").on(table.userId),
  index("idx_loyalty_points_user_id").on(table.userId),
]);

// ==================== LOYALTY TRANSACTIONS TABLE ====================
export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  points: integer("points").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  transactionId: integer("transaction_id"),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
  foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "loyalty_transactions_user_id_fkey"
  }).onDelete("cascade"),
  foreignKey({
    columns: [table.transactionId],
    foreignColumns: [transactions.id],
    name: "loyalty_transactions_transaction_id_fkey"
  }).onDelete("set null"),
  index("idx_loyalty_transactions_user_id").on(table.userId),
  index("idx_loyalty_transactions_type").on(table.type),
]);

// ==================== TYPESCRIPT TYPES ====================
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Operator = typeof operators.$inferSelect;
export type InsertOperator = typeof operators.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
export type RechargeRequest = typeof rechargeRequests.$inferSelect;
export type InsertRechargeRequest = typeof rechargeRequests.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type StripeCustomer = typeof stripeCustomers.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomers.$inferInsert;
export type StripePaymentMethod = typeof stripePaymentMethods.$inferSelect;
export type InsertStripePaymentMethod = typeof stripePaymentMethods.$inferInsert;
export type StripeWebhook = typeof stripeWebhooks.$inferSelect;
export type InsertStripeWebhook = typeof stripeWebhooks.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = typeof currencies.$inferInsert;
export type RecurringRecharge = typeof recurringRecharges.$inferSelect;
export type InsertRecurringRecharge = typeof recurringRecharges.$inferInsert;
export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type InsertLoyaltyTier = typeof loyaltyTiers.$inferInsert;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoints = typeof loyaltyPoints.$inferInsert;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;

// ==================== ZOD SCHEMAS ====================
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email("Email invalide").max(255).optional().or(z.literal('')),
  phone: z.string().min(8, "Numéro de téléphone invalide").max(20).optional().or(z.literal('')),
  firstName: z.string().min(1, "Prénom requis").max(100).optional().or(z.literal('')),
  lastName: z.string().min(1, "Nom requis").max(100).optional().or(z.literal('')),
  password: z.string().min(8, "Mot de passe doit contenir au moins 8 caractères").max(255),
  role: z.enum(['user', 'admin', 'super_admin']).optional(),
  authProvider: z.enum(['local', 'facebook', 'google']).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true, lastLoginAt: true, isVerified: true, balance: true, facebookId: true, profilePicture: true });

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email ou téléphone requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const rechargeSchema = z.object({
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide").max(20),
  operatorCode: z.string().min(1, "Code opérateur requis").max(50).optional(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Montant doit être un nombre positif"
  }),
  paymentMethodId: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({ 
  id: true, 
  createdAt: true 
});

export const insertRechargeRequestSchema = createInsertSchema(rechargeRequests).omit({ 
  id: true, 
  requestCode: true,
  expiresAt: true,
  createdAt: true, 
  updatedAt: true 
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100).optional(),
  lastName: z.string().min(1, "Nom requis").max(100).optional(),
  email: z.string().email("Email invalide").max(255).optional(),
  phone: z.string().min(8, "Numéro invalide").max(20).optional(),
  profilePicture: z.string().optional(), // Can be URL or base64 data
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// ==================== ENUMS ====================
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

export const AuthProvider = {
  LOCAL: 'local',
  FACEBOOK: 'facebook',
  GOOGLE: 'google'
} as const;

export const TransactionStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export const RechargeRequestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
} as const;

export const NotificationType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  TRANSACTION: 'transaction',
  REQUEST: 'request'
} as const;

export const RecurringFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const;

export const LoyaltyTransactionType = {
  EARNED: 'earned',
  REDEEMED: 'redeemed',
  EXPIRED: 'expired',
  BONUS: 'bonus'
} as const;

// ==================== ZOD SCHEMAS FOR NEW TABLES ====================
export const insertCurrencySchema = createInsertSchema(currencies).omit({ 
  id: true, 
  updatedAt: true 
});

export const insertRecurringRechargeSchema = createInsertSchema(recurringRecharges).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastExecutionDate: true,
  failureCount: true
});

export const insertLoyaltyTierSchema = createInsertSchema(loyaltyTiers).omit({ 
  id: true, 
  createdAt: true 
});

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPoints).omit({ 
  id: true, 
  updatedAt: true 
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({ 
  id: true, 
  createdAt: true 
});

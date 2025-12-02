import { Context } from 'telegraf';

export interface Transaction {
  id: number;
  transactionId: string;
  userId?: number;
  phoneNumber: string;
  amount: string;
  currency: string;
  amountUsd: string;
  totalReceivedUsd?: string;
  countryCode?: string;
  status: string;
  paymentMethod?: string;
  stripeChargeId?: string;
  dtoneExternalId?: string;
  dtoneStatus?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface BotConfig {
  token: string;
  paymentProviderToken?: string;
  appUrl: string;
  adminIds: number[];
  environment: string;
}

export interface SessionData {
  messageCount: number;
  lastActivity: number;
}

// Custom Context that includes our SessionData
export interface BotContext extends Context {
  session?: SessionData;
}

import { BotConfig } from '../types/telegram.types';

function loadEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`⚠️ Missing environment variable: ${key}`);
    return '';
  }
  return value;
}

export const botConfig: BotConfig = {
  token: loadEnvVariable('TELEGRAM_BOT_TOKEN'),
  paymentProviderToken: process.env.TELEGRAM_PAYMENT_PROVIDER_TOKEN,
  appUrl: process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : process.env.APP_URL || 'https://taptopload.com',
  adminIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id)),
  environment: process.env.NODE_ENV || 'development',
};

export const limits = {
  minRechargeAmount: 1,
  maxRechargeAmount: 500,
  maxTransactionsPerDay: 20,
};

export const patterns = {
  phoneNumber: /^\+?\d{10,15}$/,
  transactionId: /^[A-Z0-9_-]+$/i,
};

export const countryConfigs: Record<string, any> = {
  HT: { name: 'Haiti', currency: 'HTG', minAmount: 1, maxAmount: 100 },
  US: { name: 'United States', currency: 'USD', minAmount: 5, maxAmount: 500 },
  DO: { name: 'Dominican Republic', currency: 'DOP', minAmount: 50, maxAmount: 5000 },
};

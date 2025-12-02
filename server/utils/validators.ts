import { patterns, limits, countryConfigs } from '../config/bot.config';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: any;
}

export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  
  // Remove spaces, dashes, parentheses
  const trimmed = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!patterns.phoneNumber.test(trimmed)) {
    return { valid: false, error: 'Invalid format. Use: +509...' };
  }
  return { valid: true, sanitized: trimmed };
}

export function validateAmount(amount: string | number, countryCode?: string): ValidationResult {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (num < limits.minRechargeAmount) {
    return { valid: false, error: `Minimum amount is $${limits.minRechargeAmount}` };
  }
  
  if (num > limits.maxRechargeAmount) {
    return { valid: false, error: `Maximum amount is $${limits.maxRechargeAmount}` };
  }

  return { valid: true, sanitized: Math.round(num * 100) / 100 };
}

export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '').slice(0, 500);
}

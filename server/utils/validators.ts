import { validatePhoneNumber as sharedValidatePhone } from '@shared/phoneValidation';
import { limits } from '../config/bot.config';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: any;
}

/**
 * Validates phone number using the shared library
 * Adapts the output for the Telegram Bot logic
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  // Use the robust shared validator we created earlier
  // We default to 'HT' (Haiti) for user convenience if they omit the country code
  const result = sharedValidatePhone(phone, 'HT'); 
  
  if (!result.isValid) {
    return { 
      valid: false, 
      error: result.error || 'Invalid format. Example: +509 3700 1234' 
    };
  }
  
  return { 
    valid: true, 
    sanitized: result.fullNumber // Returns E.164 format (e.g. +50937001234)
  };
}

/**
 * Validates recharge amount against global limits
 */
export function validateAmount(amount: string | number): ValidationResult {
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

  // Round to 2 decimal places to avoid floating point weirdness
  return { valid: true, sanitized: Math.round(num * 100) / 100 };
}

/**
 * Basic input sanitization to prevent injection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  // Remove potential HTML tags and limit length
  return input.trim().replace(/[<>]/g, '').slice(0, 500);
}

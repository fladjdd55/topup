import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

// === INTERFACES ===
export interface OperatorInfo {
  name: string;
  prefixes: string[];
  color: string;
}

export interface CountryConfig {
  name: string;
  flag: string;
  countryCode: string;
  phoneLength: number; // Kept for legacy compatibility
  format: string;      // Kept for legacy compatibility
  currency: string;
  operators: Record<string, OperatorInfo>;
}

export interface PhoneValidationResult {
  isValid: boolean;
  country: string | null;
  countryName?: string;
  flag?: string;
  countryCode?: string;
  phoneNumber?: string;
  fullNumber?: string;
  operator?: string | null;
  operatorName?: string;
  operatorColor?: string;
  format?: string;
  currency?: string;
  error?: string | null;
}

// === CONSTANTS ===
// Mapping Country Code -> Currency
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // Americas
  HT: 'HTG', US: 'USD', CA: 'CAD', DO: 'DOP', JM: 'JMD', MX: 'MXN', BR: 'BRL',
  CO: 'COP', PE: 'PEN', CL: 'CLP', AR: 'ARS', VE: 'VES', EC: 'USD', BO: 'BOB',
  GT: 'GTQ', HN: 'HNL', SV: 'USD', NI: 'NIO', CR: 'CRC', PA: 'PAB',
  // Europe
  FR: 'EUR', GB: 'GBP', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', NL: 'EUR',
  BE: 'EUR', CH: 'CHF', AT: 'EUR', GR: 'EUR', PL: 'PLN', RO: 'RON', CZ: 'CZK',
  HU: 'HUF', SE: 'SEK', NO: 'NOK', DK: 'DKK', FI: 'EUR', IE: 'EUR', UA: 'UAH',
  // Africa
  NG: 'NGN', GH: 'GHS', KE: 'KES', SN: 'XOF', CI: 'XOF', CM: 'XAF', TZ: 'TZS',
  UG: 'UGX', ZA: 'ZAR', EG: 'EGP', MA: 'MAD', TN: 'TND', DZ: 'DZD', ET: 'ETB',
  RW: 'RWF', ZM: 'ZMW', BJ: 'XOF', TG: 'XOF', ML: 'XOF', BF: 'XOF',
  // Asia
  PH: 'PHP', IN: 'INR', PK: 'PKR', BD: 'BDT', VN: 'VND', ID: 'IDR', TH: 'THB',
  MY: 'MYR', SG: 'SGD', LK: 'LKR', NP: 'NPR', MM: 'MMK', KH: 'KHR', CN: 'CNY',
  JP: 'JPY', KR: 'KRW',
  // Middle East
  LB: 'LBP', JO: 'JOD', SA: 'SAR', AE: 'AED', KW: 'KWD', QA: 'QAR', OM: 'OMR',
  BH: 'BHD', IQ: 'IQD', YE: 'YER', TR: 'TRY', IL: 'ILS',
  // Oceania
  AU: 'AUD', NZ: 'NZD',
};

// Configuration for Flag/Name lookup
export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  // === AMERICAS ===
  HT: {
    name: 'Haiti', flag: '🇭🇹', countryCode: '509', phoneLength: 8, format: '+509 XX XX XX XX', currency: 'HTG',
    operators: {
      NATCOM: { name: 'Natcom', prefixes: ['22', '28', '29', '32', '33', '35', '40', '41', '42', '43', '44', '45', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'], color: '#0066cc' },
      DIGICEL: { name: 'Digicel Haiti', prefixes: ['30', '31', '34', '36', '37', '38', '39', '46', '47', '48', '49'], color: '#E60000' }
    }
  },
  US: { name: 'United States', flag: '🇺🇸', countryCode: '1', phoneLength: 10, format: '+1 (XXX) XXX-XXXX', currency: 'USD', operators: {} },
  CA: { name: 'Canada', flag: '🇨🇦', countryCode: '1', phoneLength: 10, format: '+1 (XXX) XXX-XXXX', currency: 'CAD', operators: {} },
  DO: { name: 'Dominican Republic', flag: '🇩🇴', countryCode: '1', phoneLength: 10, format: '+1 (XXX) XXX-XXXX', currency: 'DOP', operators: {} },
  JM: { name: 'Jamaica', flag: '🇯🇲', countryCode: '1', phoneLength: 10, format: '+1 (XXX) XXX-XXXX', currency: 'JMD', operators: {} },
  FR: { name: 'France', flag: '🇫🇷', countryCode: '33', phoneLength: 9, format: '+33 X XX XX XX XX', currency: 'EUR', operators: {} },
  // Add other countries here if needed for specific flags/names
  // The library handles validation for all countries, even if not listed here
};

// === HELPER FUNCTIONS ===

/**
 * Parses phone number to get standardized format.
 * Uses libphonenumber-js to clean user input.
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Try to parse using library to get E.164 format (+509...)
  const parsed = parsePhoneNumberFromString(phone);
  if (parsed) {
    return parsed.number; 
  }
  // Fallback: strip non-digits and add + if missing
  const stripped = phone.replace(/[^\d+]/g, '');
  return stripped;
}

/**
 * Detects country code (ISO) from phone number.
 * Robustly handles "1809" (DR) vs "37" (Haiti).
 */
export function detectCountryFromPhone(phone: string): string | null {
  if (!phone) return null;

  // 1. CLEAN IT: Remove spaces, parens, dashes
  const cleaned = phone.replace(/\D/g, ''); 

  // 2. NANP OVERRIDE (USA, Canada, DR, Jamaica, etc.)
  // If it starts with '1' and is 11 digits long (e.g. 18091234567), 
  // it is definitely NOT a local Haiti number (which would be 8 digits).
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Force parse as International (+1...) to let library detect area code
    const nanpParsed = parsePhoneNumberFromString('+' + cleaned);
    if (nanpParsed && nanpParsed.country) {
      return nanpParsed.country;
    }
  }

  // 3. DEFAULT LOGIC (Haiti Priority)
  // Try parsing with 'HT' default for your local users typing 8 digits (e.g. 37123456)
  const parsed = parsePhoneNumberFromString(phone, 'HT');
  if (parsed && parsed.country) {
    return parsed.country;
  }
  
  // 4. FALLBACK for International without + (e.g. 0033...)
  if (phone.startsWith('00')) {
     const formatted = '+' + phone.substring(2);
     const parsedIntl = parsePhoneNumberFromString(formatted);
     if (parsedIntl && parsedIntl.country) return parsedIntl.country;
  }
  
  return null;
}

/**
 * Detects Operator based on prefixes (Specifically for Haiti).
 * libphonenumber-js doesn't give carrier data, so we keep manual logic for HT.
 */
export function detectOperator(phone: string, country: string | null = null): string | null {
  if (!phone) return null;
  if (!country) country = detectCountryFromPhone(phone);
  
  // If country isn't in our config (e.g. Germany), we can't detect specific operator
  // but validation will still work!
  if (!country || !COUNTRY_CONFIGS[country]) return null;
  
  const config = COUNTRY_CONFIGS[country];
  if (!config.operators) return null;

  // We need the national number (without country code) for prefix checking
  const parsed = parsePhoneNumberFromString(phone, country as CountryCode);
  const nationalNumber = parsed ? parsed.nationalNumber : phone.replace(/\D/g, ''); 

  for (const [operatorCode, operatorInfo] of Object.entries(config.operators)) {
    if (!operatorInfo.prefixes || operatorInfo.prefixes.length === 0) continue;
    
    for (const prefix of operatorInfo.prefixes) {
      if (nationalNumber.startsWith(prefix)) {
        return operatorCode;
      }
    }
  }
  
  return null;
}

/**
 * Main Validation Function
 * - Validates length and format using Google's libphonenumber logic
 * - Returns UI data (Flag, Operator Name, Currency)
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone) return { isValid: false, country: null };

  // 1. Detect Country (Smart)
  const countryCode = detectCountryFromPhone(phone);
  
  if (!countryCode) {
    return {
      isValid: false,
      country: null,
      error: 'Pays non détecté'
    };
  }

  // 2. Parse using Library with detected country context
  const parsed = parsePhoneNumberFromString(phone, countryCode as CountryCode);
  
  // 3. Validation Logic
  const isValid = parsed ? parsed.isValid() : false;
  
  // 4. Retrieve UI Data from your Config
  const config = COUNTRY_CONFIGS[countryCode]; 
  
  // Default values if country not in your manual config list
  // We try to find currency in the big map, fallback to USD
  const currency = config?.currency || COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
  const countryName = config?.name || countryCode;
  const flag = config?.flag || '🌐'; // Generic flag if missing
  
  // 5. Operator Logic
  const operator = detectOperator(phone, countryCode);
  const operatorInfo = (operator && config?.operators) ? config.operators[operator] : null;

  // 6. Formatting
  const fullNumber = parsed ? parsed.format('E.164') : phone; // +50937...
  const prettyFormat = parsed ? parsed.formatInternational() : phone; // +509 37...

  // 7. Error Message
  let errorMsg: string | null = null;
  if (!isValid) {
    if (countryCode === 'HT') {
      errorMsg = "Numéro Haïti invalide (vérifiez la longueur)";
    } else {
      errorMsg = `Numéro ${countryName} invalide`;
    }
  }

  return {
    isValid: isValid,
    country: countryCode,
    countryName: countryName,
    flag: flag,
    countryCode: parsed?.countryCallingCode || config?.countryCode,
    phoneNumber: parsed?.nationalNumber as string || phone,
    fullNumber: fullNumber,
    operator: operator,
    operatorName: operatorInfo?.name || (countryCode !== 'HT' ? `Recharge ${countryName}` : 'Opérateur inconnu'),
    operatorColor: operatorInfo?.color,
    format: prettyFormat,
    currency: currency,
    error: errorMsg
  };
}

export function shouldUseDTone(phone: string): boolean {
  const country = detectCountryFromPhone(phone);
  return country !== 'HT';
}

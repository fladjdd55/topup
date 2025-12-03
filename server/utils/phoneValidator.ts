import { 
  parsePhoneNumber, 
  isValidPhoneNumber,
  getCountryCallingCode,
  CountryCode,
  PhoneNumber as LibPhoneNumber
} from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  fullNumber?: string;        // E.164 format: +50937001234
  nationalNumber?: string;    // National format: (509) 3700-1234
  countryCode?: string;       // ISO code: HT
  country?: string;           // Full name: Haiti
  carrier?: string;           // Operator name
  type?: 'mobile' | 'fixed' | 'unknown';
  error?: string;
}

export interface OperatorInfo {
  code: string;
  name: string;
  prefixes: string[];
}

// Haiti operator detection
const HAITI_OPERATORS: OperatorInfo[] = [
  {
    code: 'NATCOM',
    name: 'Natcom',
    prefixes: ['22', '28', '29', '32', '33', '35', '40', '41', '42', '43', '44', '45', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']
  },
  {
    code: 'DIGICEL',
    name: 'Digicel Haiti',
    prefixes: ['30', '31', '34', '36', '37', '38', '39', '46', '47', '48', '49']
  }
];

/**
 * Detect carrier/operator from phone number
 */
function detectOperator(phoneNumber: LibPhoneNumber): string | undefined {
  const nationalNumber = phoneNumber.nationalNumber;
  
  if (phoneNumber.country === 'HT' && nationalNumber) {
    const prefix = nationalNumber.toString().substring(0, 2);
    
    for (const operator of HAITI_OPERATORS) {
      if (operator.prefixes.includes(prefix)) {
        return operator.code;
      }
    }
  }
  
  // For other countries, return generic operator code
  return phoneNumber.country ? `DTONE_${phoneNumber.country}` : undefined;
}

/**
 * Main phone validation function
 * Supports multiple input formats and auto-detects country
 */
export function validatePhoneNumber(
  input: string,
  defaultCountry?: CountryCode
): PhoneValidationResult {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  // Clean input (remove extra whitespace, but keep +)
  const cleaned = input.trim();

  try {
    // Try parsing with country hint
    let phoneNumber: LibPhoneNumber;
    
    if (defaultCountry) {
      phoneNumber = parsePhoneNumber(cleaned, defaultCountry);
    } else {
      // Try parsing without country (will detect from + prefix)
      phoneNumber = parsePhoneNumber(cleaned);
    }

    // Validate the parsed number
    if (!phoneNumber.isValid()) {
      return {
        isValid: false,
        error: 'Invalid phone number format'
      };
    }

    // Determine phone type
    const numberType = phoneNumber.getType();
    let type: 'mobile' | 'fixed' | 'unknown' = 'unknown';
    
    if (numberType === 'MOBILE' || numberType === 'FIXED_LINE_OR_MOBILE') {
      type = 'mobile';
    } else if (numberType === 'FIXED_LINE') {
      type = 'fixed';
    }

    // Get country name
    const countryName = getCountryName(phoneNumber.country);

    return {
      isValid: true,
      fullNumber: phoneNumber.number,           // +50937001234
      nationalNumber: phoneNumber.formatNational(), // (509) 3700-1234
      countryCode: phoneNumber.country,         // HT
      country: countryName,                     // Haiti
      carrier: detectOperator(phoneNumber),     // NATCOM or DIGICEL
      type
    };

  } catch (error: any) {
    // Specific error messages for common issues
    if (error.message.includes('NOT_A_NUMBER')) {
      return {
        isValid: false,
        error: 'Please enter a valid phone number'
      };
    }
    
    if (error.message.includes('TOO_SHORT')) {
      return {
        isValid: false,
        error: 'Phone number is too short'
      };
    }
    
    if (error.message.includes('TOO_LONG')) {
      return {
        isValid: false,
        error: 'Phone number is too long'
      };
    }

    if (error.message.includes('INVALID_COUNTRY')) {
      return {
        isValid: false,
        error: 'Invalid country code'
      };
    }

    return {
      isValid: false,
      error: 'Invalid phone number format. Use international format (e.g., +50937001234)'
    };
  }
}

/**
 * Quick validation check (boolean only)
 */
export function isValidPhone(input: string, defaultCountry?: CountryCode): boolean {
  try {
    if (defaultCountry) {
      return isValidPhoneNumber(input, defaultCountry);
    }
    return isValidPhoneNumber(input);
  } catch {
    return false;
  }
}

/**
 * Format phone number to E.164 standard
 */
export function formatToE164(input: string, defaultCountry?: CountryCode): string | null {
  try {
    const phoneNumber = defaultCountry 
      ? parsePhoneNumber(input, defaultCountry)
      : parsePhoneNumber(input);
    
    return phoneNumber.number; // Returns +50937001234
  } catch {
    return null;
  }
}

/**
 * Format phone number for display
 */
export function formatForDisplay(input: string, defaultCountry?: CountryCode): string {
  try {
    const phoneNumber = defaultCountry 
      ? parsePhoneNumber(input, defaultCountry)
      : parsePhoneNumber(input);
    
    return phoneNumber.formatInternational(); // Returns +509 37 00 1234
  } catch {
    return input; // Return original if parsing fails
  }
}

/**
 * Get country calling code
 */
export function getCallingCode(countryCode: CountryCode): string {
  try {
    return `+${getCountryCallingCode(countryCode)}`;
  } catch {
    return '';
  }
}

/**
 * Helper: Get country name from code
 */
function getCountryName(code?: CountryCode): string {
  const countryNames: Record<string, string> = {
    'HT': 'Haiti',
    'US': 'United States',
    'CA': 'Canada',
    'DO': 'Dominican Republic',
    'JM': 'Jamaica',
    'MX': 'Mexico',
    'BR': 'Brazil',
    'FR': 'France',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'ES': 'Spain',
    'IT': 'Italy',
    // Add more as needed
  };
  
  return code ? countryNames[code] || code : 'Unknown';
}

/**
 * Batch validation (for CSV imports, etc.)
 */
export function validatePhoneNumbers(
  inputs: string[],
  defaultCountry?: CountryCode
): PhoneValidationResult[] {
  return inputs.map(input => validatePhoneNumber(input, defaultCountry));
}

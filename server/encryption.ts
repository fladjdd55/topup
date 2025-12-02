import crypto from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

// Get encryption key from environment or generate one
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    console.warn('⚠️ [Encryption] ENCRYPTION_KEY not set in environment variables. Using default key (NOT SECURE FOR PRODUCTION)');
    // In production, you MUST set a strong ENCRYPTION_KEY in your Replit Secrets
    return 'default-encryption-key-change-me-in-production-must-be-at-least-32-chars-long';
  }
  
  return key;
}

// Derive a 256-bit key from the encryption key using PBKDF2
function deriveKey(salt: Buffer): Buffer {
  const encryptionKey = getEncryptionKey();
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, 32, 'sha256');
}

/**
 * Encrypts a string value
 * Returns format: salt:iv:authTag:encryptedData (all in hex)
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text || text === '') return null;
  
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from salt
    const key = deriveKey(salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Return format: salt:iv:authTag:encryptedData
    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('❌ [Encryption] Failed to encrypt data:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts an encrypted string value
 * Expects format: salt:iv:authTag:encryptedData (all in hex)
 */
export function decrypt(encryptedText: string | null | undefined): string | null {
  if (!encryptedText || encryptedText === '') return null;
  
  try {
    // Parse the encrypted format
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      console.error('❌ [Encryption] Invalid encrypted format');
      return null;
    }
    
    const [saltHex, ivHex, authTagHex, encryptedData] = parts;
    
    // Convert from hex to buffers
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Derive key from salt
    const key = deriveKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the data
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ [Encryption] Failed to decrypt data:', error);
    return null;
  }
}

/**
 * Checks if a string is already encrypted (has the expected format)
 */
export function isEncrypted(value: string | null | undefined): boolean {
  if (!value) return false;
  
  // Check if it matches the encrypted format: salt:iv:authTag:encryptedData
  const parts = value.split(':');
  if (parts.length !== 4) return false;
  
  // Check if all parts are valid hex strings
  const hexPattern = /^[0-9a-f]+$/i;
  return parts.every(part => hexPattern.test(part));
}

/**
 * Encrypts user personal data fields
 */
export function encryptUserData(user: {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
} {
  return {
    email: user.email ? encrypt(user.email) : user.email,
    phone: user.phone ? encrypt(user.phone) : user.phone,
    firstName: user.firstName ? encrypt(user.firstName) : user.firstName,
    lastName: user.lastName ? encrypt(user.lastName) : user.lastName,
  };
}

/**
 * Decrypts user personal data fields
 */
export function decryptUserData(user: {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
} {
  return {
    email: user.email ? decrypt(user.email) : user.email,
    phone: user.phone ? decrypt(user.phone) : user.phone,
    firstName: user.firstName ? decrypt(user.firstName) : user.firstName,
    lastName: user.lastName ? decrypt(user.lastName) : user.lastName,
  };
}

/**
 * Generates a secure random encryption key
 * Use this to generate a key for ENCRYPTION_KEY environment variable
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64');
}

// Log encryption status on startup
if (process.env.ENCRYPTION_KEY) {
  console.log('✅ [Encryption] Using custom ENCRYPTION_KEY from environment');
} else {
  console.warn('⚠️ [Encryption] Using default encryption key - SET ENCRYPTION_KEY in Secrets for production!');
}

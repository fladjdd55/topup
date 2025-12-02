export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit chars except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

// Use everywhere:
const cleanPhone = normalizePhoneNumber(phoneNumber);

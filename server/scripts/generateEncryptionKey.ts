import { generateEncryptionKey } from '../encryption';

console.log('\n🔐 Generated Encryption Key for ENCRYPTION_KEY secret:\n');
console.log(generateEncryptionKey());
console.log('\n📝 Copy this key and add it to your Replit Secrets as ENCRYPTION_KEY\n');

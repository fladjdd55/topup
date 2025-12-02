import { db } from '../db';
import { users } from '@shared/schema';
import { encrypt, isEncrypted } from '../encryption';
import { eq } from 'drizzle-orm';

/**
 * Migration script to encrypt existing user data in the database
 * Run this once to encrypt all existing unencrypted personal data
 * 
 * Usage: tsx server/migrations/encryptExistingData.ts
 */
async function migrateExistingData() {
  console.log('🔐 Starting data encryption migration...\n');
  
  try {
    // Fetch all users from the database
    const allUsers = await db.select().from(users);
    console.log(`📊 Found ${allUsers.length} users in database\n`);
    
    let encryptedCount = 0;
    let alreadyEncryptedCount = 0;
    let errorCount = 0;
    
    for (const user of allUsers) {
      const updates: any = {};
      let hasUpdates = false;
      
      // Check and encrypt email
      if (user.email && !isEncrypted(user.email)) {
        updates.email = encrypt(user.email);
        hasUpdates = true;
        console.log(`  📧 Encrypting email for user ${user.id}: ${user.email}`);
      } else if (user.email && isEncrypted(user.email)) {
        alreadyEncryptedCount++;
      }
      
      // Check and encrypt phone
      if (user.phone && !isEncrypted(user.phone)) {
        updates.phone = encrypt(user.phone);
        hasUpdates = true;
        console.log(`  📱 Encrypting phone for user ${user.id}: ${user.phone}`);
      } else if (user.phone && isEncrypted(user.phone)) {
        alreadyEncryptedCount++;
      }
      
      // Check and encrypt firstName
      if (user.firstName && !isEncrypted(user.firstName)) {
        updates.firstName = encrypt(user.firstName);
        hasUpdates = true;
        console.log(`  👤 Encrypting firstName for user ${user.id}: ${user.firstName}`);
      } else if (user.firstName && isEncrypted(user.firstName)) {
        alreadyEncryptedCount++;
      }
      
      // Check and encrypt lastName
      if (user.lastName && !isEncrypted(user.lastName)) {
        updates.lastName = encrypt(user.lastName);
        hasUpdates = true;
        console.log(`  👤 Encrypting lastName for user ${user.id}: ${user.lastName}`);
      } else if (user.lastName && isEncrypted(user.lastName)) {
        alreadyEncryptedCount++;
      }
      
      // Update the user if there are changes
      if (hasUpdates) {
        try {
          await db.update(users)
            .set(updates)
            .where(eq(users.id, user.id));
          
          encryptedCount++;
          console.log(`  ✅ Updated user ${user.id}\n`);
        } catch (error) {
          console.error(`  ❌ Error updating user ${user.id}:`, error);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Users encrypted: ${encryptedCount}`);
    console.log(`  ℹ️  Already encrypted fields: ${alreadyEncryptedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log('\n🎉 Migration completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the migration
migrateExistingData();

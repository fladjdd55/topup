import { config } from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import { encrypt } from '../encryption';
import bcrypt from 'bcryptjs';

// Charger les variables d'environnement depuis le fichier .env
config();

async function createAdmin() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in environment variables');
    console.error('💡 Assurez-vous d\'avoir un fichier .env à la racine du projet avec DATABASE_URL');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { schema });

  console.log('\n🔐 Creating Admin User\n');

  // Informations de l'admin
  const adminData = {
    email: 'admin@taptopload.com',
    password: 'taptopload123',
    firstName: 'Admin',
    lastName: 'TapTopLoad',
    phone: '+509 0000 0000',
    role: 'admin' as const,
  };

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.role, 'admin'),
    });

    if (existingAdmin) {
      console.log('⚠️  Un administrateur existe déjà dans la base de données');
      console.log('Email (crypté):', existingAdmin.email?.substring(0, 50) + '...');
      console.log('\nSi vous avez oublié le mot de passe, supprimez cet admin et relancez ce script.');
      return;
    }

    // Crypter les données personnelles
    const encryptedEmail = encrypt(adminData.email);
    const encryptedPhone = encrypt(adminData.phone);
    const encryptedFirstName = encrypt(adminData.firstName);
    const encryptedLastName = encrypt(adminData.lastName);

    if (!encryptedEmail || !encryptedPhone || !encryptedFirstName || !encryptedLastName) {
      console.error('❌ Échec du cryptage des données');
      process.exit(1);
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Insérer l'admin
    const [admin] = await db.insert(schema.users).values({
      email: encryptedEmail,
      phone: encryptedPhone,
      firstName: encryptedFirstName,
      lastName: encryptedLastName,
      password: hashedPassword,
      role: adminData.role,
      balance: '0',
      isVerified: true,
    }).returning();

    console.log('✅ Administrateur créé avec succès!\n');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('👤 Rôle:', adminData.role);
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion!\n');
    console.log('ID utilisateur:', admin.id);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

createAdmin().then(() => process.exit(0));

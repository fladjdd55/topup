#!/usr/bin/env node

/**
 * Script pour exécuter la migration populate-operators.sql
 * Compatible Windows, macOS, Linux (ES Modules)
 * 
 * Usage:
 *   tsx run-migration.js
 *   ou
 *   node run-migration.js
 */

// Charger les variables d'environnement depuis .env
import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Résoudre __dirname pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  console.log('🚀 Démarrage de la migration des opérateurs...\n');
  
  try {
    // Vérifier que le fichier existe
    const migrationFile = path.join(__dirname, 'server', 'migrations', 'populate-operators.sql');
    
    if (!fs.existsSync(migrationFile)) {
      console.error('❌ Erreur: Le fichier populate-operators.sql n\'existe pas !');
      console.error('   Chemin attendu:', migrationFile);
      process.exit(1);
    }
    
    console.log('📄 Lecture du fichier de migration...');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('💾 Connexion à la base de données...');
    const maskedUrl = process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@');
    console.log(`   URL: ${maskedUrl}\n`);
    
    // Tester la connexion
    await pool.query('SELECT NOW();');
    console.log('✅ Connexion réussie !\n');
    
    // Compter les opérateurs avant
    const beforeCount = await pool.query('SELECT COUNT(*) FROM operators;');
    console.log(`📊 Opérateurs avant migration: ${beforeCount.rows[0].count}`);
    
    console.log('⚙️  Exécution de la migration...');
    await pool.query(sql);
    
    // Compter les opérateurs après
    const afterCount = await pool.query('SELECT COUNT(*) FROM operators;');
    console.log(`📊 Opérateurs après migration: ${afterCount.rows[0].count}\n`);
    
    // Afficher quelques exemples
    console.log('🔍 Exemples d\'opérateurs ajoutés:');
    const samples = await pool.query(`
      SELECT code, name, country 
      FROM operators 
      WHERE country IN ('HT', 'US', 'FR', 'NG') 
      ORDER BY country, code;
    `);
    
    console.table(samples.rows);
    
    console.log('\n✅ Migration réussie !');
    console.log(`   Total: ${afterCount.rows[0].count} opérateurs dans la base de données\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:');
    console.error('   Message:', error.message);
    
    if (error.code) {
      console.error('   Code:', error.code);
    }
    
    if (error.detail) {
      console.error('   Détail:', error.detail);
    }
    
    console.error('\n💡 Suggestions:');
    console.error('   1. Vérifiez que DATABASE_URL est correctement défini dans .env');
    console.error('   2. Vérifiez que la base de données est accessible');
    console.error('   3. Vérifiez que la table "operators" existe');
    console.error('      → Exécutez: npm run db:push\n');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ Erreur: DATABASE_URL n\'est pas défini !');
  console.error('   Assurez-vous que le fichier .env contient DATABASE_URL\n');
  process.exit(1);
}

runMigration();

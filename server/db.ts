import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";
import 'dotenv/config';

const { Pool: PgPool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const databaseUrl = process.env.DATABASE_URL;

// Détection automatique : Neon (cloud) ou PostgreSQL standard (local/production)
const isNeonDatabase = databaseUrl.includes('neon.tech') || databaseUrl.includes('pooler');

let pool: NeonPool | InstanceType<typeof PgPool>;
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (isNeonDatabase) {
  // Configuration pour Neon (cloud database)
  console.log('🌐 Using Neon PostgreSQL (serverless)');
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: databaseUrl });
  db = drizzleNeon({ client: pool as NeonPool, schema });
} else {
  // Configuration pour PostgreSQL standard (local ou production personnalisée)
  console.log('🐘 Using PostgreSQL (standard connection)');
  pool = new PgPool({ 
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' && !databaseUrl.includes('localhost')
      ? { rejectUnauthorized: false }
      : false
  });
  db = drizzlePg({ client: pool as InstanceType<typeof PgPool>, schema });
}

export { pool, db };

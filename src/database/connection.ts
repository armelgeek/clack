

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

const postgres = require('postgres');

config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

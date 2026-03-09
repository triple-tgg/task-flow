/**
 * Preload script for Prisma CLI commands.
 * Constructs DATABASE_URL from split environment variables
 * and executes the given Prisma command.
 *
 * Usage: npx ts-node prisma/preload-env.ts migrate deploy
 *        npx ts-node prisma/preload-env.ts db push
 *        npx ts-node prisma/preload-env.ts generate
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Load .env file
config({ path: resolve(__dirname, '../.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '5432';
const dbName = process.env.DB_NAME || 'taskflow';
const dbUser = process.env.DB_USER || 'taskflow_user';
const dbPassword = process.env.DB_PASSWORD || '';
const dbSchema = process.env.DB_SCHEMA || 'public';

const databaseUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=${dbSchema}`;

// Set for child process
process.env.DATABASE_URL = databaseUrl;

const args = process.argv.slice(2).join(' ');
const command = `npx prisma ${args}`;

console.log(`✅ DATABASE_URL constructed: postgresql://${dbUser}:****@${dbHost}:${dbPort}/${dbName}?schema=${dbSchema}`);
console.log(`🚀 Running: ${command}\n`);

try {
    execSync(command, { stdio: 'inherit', env: process.env });
} catch {
    process.exit(1);
}

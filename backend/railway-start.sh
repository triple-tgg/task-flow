#!/bin/sh
# Railway start script — constructs DATABASE_URL from split env vars,
# runs Prisma migrate deploy, then starts the production server.

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"

echo "✅ DATABASE_URL constructed: postgresql://${DB_USER}:****@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"

echo "🔄 Running Prisma migrate deploy..."
npx prisma migrate deploy

echo "🚀 Starting production server..."
node dist/main

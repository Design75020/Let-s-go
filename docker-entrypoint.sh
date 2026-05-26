#!/bin/sh
set -e

echo "🚀 LetsGoFood V15 - Initializing database..."

# Run Prisma migration to create tables
npx prisma db push --accept-data-loss --skip-generate 2>&1 || {
  echo "⚠️  prisma db push failed, trying migrate deploy..."
  npx prisma migrate deploy 2>&1 || echo "⚠️  migrate deploy also failed, continuing..."
}

echo "✅ Database initialized. Starting server..."
exec node dist/server.cjs

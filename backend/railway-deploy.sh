#!/bin/bash

# Railway Deployment Script for BloodContract Backend

echo "🚀 Starting Railway deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "✅ DATABASE_URL is configured"

# Verify deployment files
echo "🔍 Verifying deployment files..."
node verify-deployment.js

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Run database migrations
echo "🗄️ Running database migrations..."
npx sequelize-cli db:migrate --env production

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

# Optional: Seed the database (uncomment if needed)
echo "🌱 Seeding database..."
node src/resetAndSeed.js

echo "🎉 Railway deployment completed successfully!"
echo "🌐 Your application should now be running on Railway" 
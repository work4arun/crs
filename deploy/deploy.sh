#!/bin/bash

# Safe Deployment Script (Zero Data Loss)
# Usage: ./deploy/deploy.sh

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Safe Deployment..."

# 1. Pull latest code
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 2. Install Dependencies
echo "📦 Installing dependencies..."
npm install

<<<<<<< HEAD
# Load environment variables
set -a
source .env
set +a

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate --schema=apps/api/prisma/schema.prisma

# Run Migrations
echo "Running Migrations..."
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Build Web App
echo "Building Web App..."

export NEXT_PUBLIC_API_URL="http://147.79.67.133/api"
npm run build -w apps/web

# Build API App
echo "Building API App..."
=======
# 3. Database Migrations (Safe)
# We go into apps/api so it finds the .env file automatically
echo "🗄️ Running Database Migrations..."
cd apps/api
# Generate Client first to ensure type safety
npx prisma generate
# Deploy migrations (Create/Update tables, NEVER delete data)
npx prisma migrate deploy
cd ../..

# 4. Build Applications
echo "🏗️ Building API..."
>>>>>>> b1823bd (v37)
npm run build -w apps/api

echo "🏗️ Building Web App..."
# Force the production HTTPS URL
export NEXT_PUBLIC_API_URL="https://rathinam.site/api"
npm run build -w apps/web

# 5. Zero-Downtime Reload
echo "🔄 Reloading Services..."
# --update-env ensures any new .env changes (like passwords) are picked up
pm2 reload all --update-env
pm2 save

echo "✅ Deployment Complete! System is live."

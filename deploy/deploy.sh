#!/bin/bash

# Exit on error
set -e

echo "Starting Deployment..."

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate --schema=apps/api/prisma/schema.prisma

# Run Migrations
echo "Running Migrations..."
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma

# Build Web App
echo "Building Web App..."
set -a
source .env
set +a
export NEXT_PUBLIC_API_URL="http://147.79.67.133/api"
npm run build -w apps/web

# Build API App
echo "Building API App..."
npm run build -w apps/api

# Restart PM2 processes
echo "Restarting PM2 processes..."
pm2 reload deploy/ecosystem.config.js --update-env
pm2 save

echo "Deployment Complete!"

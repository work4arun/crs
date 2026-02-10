FROM node:20-alpine AS builder

WORKDIR /app

# Copy root filenames for npm ci
COPY package.json package-lock.json ./

# Copy workspace package.jsons (needed for npm ci validation)
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build API
RUN npm run build

# Production runner
FROM node:20-alpine AS runner

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace package.jsons
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

# Helper script to run migrations and start
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/src/main.js"]

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

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

# Helper script to run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]

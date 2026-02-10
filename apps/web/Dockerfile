FROM node:20-alpine AS builder

WORKDIR /app

# Copy root files
COPY package.json package-lock.json ./
# Copy workspace definitions
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build Web
WORKDIR /app/apps/web
# Accept build argument for API URL
ARG NEXT_PUBLIC_API_URL
# Set as environment variable for build time
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "start"]

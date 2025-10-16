# Build stage
FROM node:20-alpine AS builder

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma:generate

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install dependencies for Prisma and native modules
RUN apk add --no-cache openssl python3 make g++

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install all dependencies (need prisma CLI for generation)
# Allow build scripts for bcrypt and prisma
RUN pnpm install --frozen-lockfile

# Generate Prisma Client in production stage
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Run start script
CMD ["./start.sh"]

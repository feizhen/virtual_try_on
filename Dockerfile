# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package.json server/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy server source code
COPY server/prisma ./prisma
COPY server/src ./src
COPY server/tsconfig*.json ./
COPY server/nest-cli.json ./

# Generate Prisma Client
RUN pnpm prisma:generate

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package.json server/pnpm-lock.yaml ./

# Copy prisma schema for client generation
COPY server/prisma ./prisma

# Install all dependencies first to run prisma generate
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma:generate

# Remove devDependencies
RUN pnpm prune --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start:prod"]

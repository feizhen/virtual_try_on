# Build stage
FROM node:20-alpine AS builder

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Configure Prisma to use China mirror - set before any npm/pnpm operations
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

# Install pnpm and configure npm registry
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package.json server/pnpm-lock.yaml ./

# Install dependencies with Prisma mirror configured
RUN PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    pnpm install --frozen-lockfile

# Copy server source code
COPY server/prisma ./prisma
COPY server/src ./src
COPY server/tsconfig*.json ./
COPY server/nest-cli.json ./

# Generate Prisma Client with mirror configured
RUN PRISMA_ENGINES_MIRROR=https://registry.nppmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    pnpm prisma:generate

# Build application
RUN pnpm build

# Production stage
FROM node:20-alpine

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Configure Prisma to use China mirror
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

# Install pnpm and configure npm registry
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com

# Set working directory
WORKDIR /app

# Copy built application from builder first
COPY --from=builder /app/dist ./dist

# Copy package files
COPY server/package.json server/pnpm-lock.yaml ./

# Copy prisma schema
COPY server/prisma ./prisma

# Install production dependencies only (without Prisma binaries download)
RUN PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.nppmirror.com/-/binary/prisma \
    pnpm install --prod --frozen-lockfile

# Copy generated Prisma Client and engines from builder (this overwrites what was installed)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start:prod"]

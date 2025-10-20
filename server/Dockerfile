# Multi-stage build for production
FROM docker.m.daocloud.io/library/node:20-alpine AS builder

# Use Aliyun mirror for apk packages
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# Install dependencies for native modules and Prisma
RUN apk add --no-cache python3 make g++ openssl openssl-dev libc6-compat

# Configure Prisma to use China mirror
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm with Taobao mirror
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm@9

# Configure pnpm to use Taobao mirror
RUN pnpm config set registry https://registry.npmmirror.com

# Install dependencies
RUN PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    npx prisma generate

# Build application
RUN pnpm run build

# Production stage
FROM docker.m.daocloud.io/library/node:20-alpine

# Use Aliyun mirror for apk packages
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

# Install dependencies for sharp, native modules and Prisma
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    openssl \
    openssl-dev \
    libc6-compat

# Configure Prisma to use China mirror
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema
COPY prisma ./prisma

# Install pnpm with Taobao mirror
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm@9

# Configure pnpm to use Taobao mirror
RUN pnpm config set registry https://registry.npmmirror.com

# Install production dependencies only (now includes prisma)
RUN PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    pnpm install --prod --frozen-lockfile

# Generate Prisma Client
RUN PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma \
    npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main"]

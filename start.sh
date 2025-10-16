#!/bin/sh
set -ex

echo "===== Starting deployment script ====="
echo "Node version: $(node --version)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "===== Running database migrations ====="
npx prisma migrate deploy

echo "===== Migrations complete ====="
echo "===== Starting NestJS application ====="
exec node dist/main

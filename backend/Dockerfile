# Backend Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 kash

COPY --from=deps --chown=kash:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=kash:nodejs /app/dist ./dist
COPY --from=builder --chown=kash:nodejs /app/package.json ./package.json

USER kash

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "start"]
# Backend Dockerfile
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies for TypeScript build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript - This will create dist/src/server.js based on tsconfig
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/profiles

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Use npm start which is configured as "node dist/server.js" in package.json
CMD ["npm", "start"]
FROM node:18-alpine

# Frontend container for development / web preview
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Expose Expo web default port (19006) and run web server
EXPOSE 19006

# Start Expo in web mode. In production you can replace this with a static build step.
CMD ["npm", "run", "web"]
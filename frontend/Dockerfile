FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Expose Expo web default port
EXPOSE 19006
EXPOSE 8081

# Set environment variable to use the correct host
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Start Expo in web mode
CMD ["npx", "expo", "start", "--web", "--port", "19006"]
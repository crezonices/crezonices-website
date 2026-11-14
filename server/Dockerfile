# Production Dockerfile for Crezonices Backend API
FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy server code
COPY server/ ./server/

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server/server.mjs"]

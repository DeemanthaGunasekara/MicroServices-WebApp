# Stage 1: Dependency Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Minimal Production Runtime
FROM node:20-alpine
WORKDIR /app

# Run as non-root user for security
USER node

# Copy production node_modules from builder stage
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node . .

EXPOSE 3001
ENV PORT=3001 NODE_ENV=production

CMD ["node", "src/index.js"]
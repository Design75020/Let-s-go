# --- Multi-Stage Build for Production ---
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Copy only relevant files and dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies, and generate Prisma Client
RUN npm ci --omit=dev && npx prisma generate

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase-applet-config.json* ./

EXPOSE 8080

# Set user for security
USER node

# Run compiled server
CMD ["node", "dist/server.cjs"]

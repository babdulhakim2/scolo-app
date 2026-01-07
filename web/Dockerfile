# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies needed for build
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./
RUN npm ci --only=production
RUN npm ci

# Copy source code
COPY . .

# Copy .env file if it exists (from Cloud Build secret)
ARG ENV_FILE=.env
COPY ${ENV_FILE}* ./

# Load environment variables from .env file for build
RUN if [ -f .env ]; then \
      export $(cat .env | grep -v '^#' | xargs) && \
      echo "Environment variables loaded from .env"; \
    fi

# Build Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy the optimized GIF
COPY --from=builder --chown=nextjs:nodejs /app/public/scolo-demo-optimized.gif ./public/

USER nextjs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
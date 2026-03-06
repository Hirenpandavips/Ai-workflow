# ============================================================
# Stage 1: Builder — install all deps and compile TypeScript
# ============================================================
FROM node:22.14-alpine AS builder

WORKDIR /app

# Copy only package manifests first for layer caching.
# A change in source code will NOT invalidate the npm install layer.
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for tsc).
RUN npm ci

# Copy source code and TypeScript config needed for compilation.
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to dist/.
RUN npm run build

# ============================================================
# Stage 2: Production — minimal image with only runtime deps
# ============================================================
FROM node:22.14-alpine AS production

# Add metadata labels for traceability.
LABEL maintainer="ai-workflow-team"
LABEL description="JWT Auth REST API — Node.js + TypeScript + Express + TypeORM + PostgreSQL"

# Set NODE_ENV so npm ci skips devDependencies and TypeORM
# disables synchronize (see src/config/database.ts).
ENV NODE_ENV=production

WORKDIR /app

# Copy package manifests and install production-only dependencies.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript from the builder stage.
COPY --from=builder /app/dist ./dist

# -----------------------------------------------------------
# Security: run as a non-root user.
# -----------------------------------------------------------
# Create a dedicated group and user with no home directory.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Hand ownership of /app to the non-root user.
RUN chown -R appuser:appgroup /app

USER appuser

# -----------------------------------------------------------
# Runtime configuration
# -----------------------------------------------------------
# Default port — override at runtime with -e PORT=<value>.
EXPOSE 3000

# Health check against the /health endpoint.
# The app must respond within 3 s; check runs every 30 s.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1

# Start the compiled application directly with node (not npm).
CMD ["node", "dist/index.js"]
 
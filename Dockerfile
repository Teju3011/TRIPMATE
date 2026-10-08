# ==============================================================================
# TripMate Secure Containerfile
# Multi-stage hardened build with non-root runtime, minimal attack surface
# ==============================================================================

# Stage 1: Build & Dependencies
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Security: Install dependencies strictly using package-lock
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Minimal Production Distroless/Alpine Runtime
FROM node:22-alpine AS runner

LABEL maintainer="security@tripmate.io"
LABEL version="1.0.0"
LABEL description="TripMate Collaborative Travel Planning Engine"

# Security Control 1: Create unprivileged system user and group (non-root UID 10001)
RUN addgroup -g 10001 -S tripmate && \
    adduser -u 10001 -S tripmate -G tripmate

WORKDIR /usr/src/app

# Security Control 2: Only copy production node_modules from builder
COPY --chown=tripmate:tripmate --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=tripmate:tripmate package*.json ./
COPY --chown=tripmate:tripmate src/ ./src/

# Ensure persistent data directory with proper ownership
RUN mkdir -p /usr/src/app/data && chown -R tripmate:tripmate /usr/src/app/data

# Security Control 3: Drop root privileges permanently
USER tripmate:tripmate

# Security Control 4: Enforce production environment flags
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_FILE_PATH=/usr/src/app/data/tripmate_db.json

# Security Control 5: Restrict exposed ports
EXPOSE 3000

# Security Control 6: Container health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Execute server
CMD ["node", "src/server.js"]

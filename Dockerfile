# ------------------------------------------------------------------------------
# RapidRental - Multi-stage Production & Development Dockerfile
# ------------------------------------------------------------------------------

# 1. Base image with lean Alpine Linux & Node.js 20 LTS
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat curl

# 2. Dependencies caching layer
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 3. Development target (isolated, hot-reload enabled container)
FROM base AS development
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 8081
CMD ["npx", "expo", "start", "--web", "--host", "lan"]

# 4. Production builder (static export)
FROM base AS builder
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npx expo export --platform web

# 5. Production server (Nginx Alpine with SPA routing & compression)
FROM nginx:alpine AS production
LABEL maintainer="RapidRental Team"
LABEL description="RapidRental Production Container"

# Copy exported static files & custom Nginx configuration
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck for container stability & automated recovery
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

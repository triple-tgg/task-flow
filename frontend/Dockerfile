# ── Build ──────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

# Copy source
COPY . .

# Build with API URL passed as build arg
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ── Production ─────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install serve (lightweight static file server)
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

# Railway injects PORT automatically
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]

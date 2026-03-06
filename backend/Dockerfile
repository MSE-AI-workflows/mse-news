# 1) Base image: Node 20 on Alpine (small and secure)
FROM node:20-alpine

# 2) Optional: reduce log noise
ENV NODE_ENV=production

# 3) Create app directory in the container
WORKDIR /app

# 4) Copy dependency manifests first (for better layer caching)
COPY package.json package-lock.json* ./

# 5) Install production dependencies only (no devDependencies)
RUN npm ci --omit=dev || npm install --omit=dev

# 6) Copy the rest of the backend code
COPY . .

# 7) Create uploads dir so the app can write to it; ownership will be set next
RUN mkdir -p uploads

# 8) Create a non-root user and own /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs \
    && chown -R nodejs:nodejs /app

USER nodejs

# 9) Expose the port the app listens on (documentation only; you still -p when running)
EXPOSE 4000

# 10) Default env (override at runtime for DB, secrets, etc.)
ENV PORT=4000

# 11) Start the server (same as "npm start")
CMD ["node", "src/server.js"]
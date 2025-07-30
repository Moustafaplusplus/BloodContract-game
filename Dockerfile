FROM node:18-alpine

# Install pnpm using a more reliable method
RUN apk add --no-cache curl && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@10.12.4

# Set working directory
WORKDIR /app

# Copy package files from backend
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy backend source code
COPY backend/src/ ./src/
COPY backend/config/ ./config/
COPY backend/migrations/ ./migrations/
COPY backend/sequelize.config.cjs ./
COPY backend/.sequelizerc ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
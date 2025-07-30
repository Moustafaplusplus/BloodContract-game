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

# Copy backend source code and configuration files
# Use individual COPY commands to ensure each directory exists
COPY backend/src/ ./src/
COPY backend/config/ ./config/
COPY backend/migrations/ ./migrations/
COPY backend/sequelize.config.cjs ./
COPY backend/.sequelizerc ./

# Copy public assets
COPY backend/public/ ./public/

# Copy verification scripts
COPY backend/verify-deployment.js ./
COPY backend/build-verify.sh ./

# Make verification script executable
RUN chmod +x build-verify.sh

# Run build verification
RUN ./build-verify.sh

# Create necessary directories if they don't exist
RUN mkdir -p public/avatars public/cars public/crimes public/weapons public/armors public/special-items public/missions

# Set proper permissions
RUN chmod -R 755 public/

# Verify critical files exist
RUN ls -la src/ && ls -la config/ && ls -la migrations/

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"] 
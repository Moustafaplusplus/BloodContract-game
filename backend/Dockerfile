FROM node:18-alpine

# Install pnpm using a more reliable method
RUN apk add --no-cache curl && \
    curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm@10.12.4

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code and configuration files
COPY src/ ./src/
COPY config/ ./config/
COPY migrations/ ./migrations/
COPY sequelize.config.cjs ./
COPY .sequelizerc ./

# Copy public assets
COPY public/ ./public/

# Copy verification scripts if they exist
COPY verify-deployment.js ./
COPY build-verify.sh ./

# Make verification script executable if it exists
RUN if [ -f "build-verify.sh" ]; then chmod +x build-verify.sh && ./build-verify.sh; fi

# Create necessary directories if they don't exist
RUN mkdir -p public/avatars public/cars public/crimes public/weapons public/armors public/special-items public/missions

# Set proper permissions
RUN chmod -R 755 public/

# Verify critical files exist
RUN echo "Checking critical files..." && \
    ls -la src/ && \
    ls -la config/ && \
    ls -la migrations/

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"] 
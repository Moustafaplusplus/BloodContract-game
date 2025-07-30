FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from backend
COPY backend/package.json ./

# Install dependencies
RUN npm install --production

# Copy source code and configuration files from backend
COPY backend/src/ ./src/
COPY backend/config/ ./config/
COPY backend/migrations/ ./migrations/
COPY backend/sequelize.config.cjs ./
COPY backend/.sequelizerc ./

# Copy public assets from backend
COPY backend/public/ ./public/

# Copy verification scripts from backend if they exist
COPY backend/verify-deployment.js ./
COPY backend/build-verify.sh ./

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
CMD ["npm", "start"] 
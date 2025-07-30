FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm@10.12.4

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package.json backend/pnpm-lock.yaml ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN pnpm install --no-frozen-lockfile

# Copy backend source code
COPY backend/ .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 
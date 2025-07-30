#!/bin/bash

# Railway build script
echo "🚀 Starting Railway build..."

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: backend/package.json not found"
    exit 1
fi

echo "✅ Backend package.json found"

# Copy necessary files to backend if they don't exist
if [ ! -f "backend/Dockerfile" ]; then
    echo "📋 Copying Dockerfile to backend..."
    cp Dockerfile backend/
fi

echo "✅ Build preparation complete" 
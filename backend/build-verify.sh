#!/bin/bash

# Build verification script for Railway deployment

echo "🔍 Verifying build files..."

# Check if critical directories exist
for dir in src config migrations public; do
    if [ -d "$dir" ]; then
        echo "✅ Directory $dir exists"
    else
        echo "❌ Directory $dir missing"
        exit 1
    fi
done

# Check if critical files exist
for file in src/app.js config/config.cjs sequelize.config.cjs .sequelizerc package.json; do
    if [ -f "$file" ]; then
        echo "✅ File $file exists"
    else
        echo "❌ File $file missing"
        exit 1
    fi
done

# Check package.json
if [ -f "package.json" ]; then
    echo "✅ Package.json found"
    echo "📦 Package name: $(node -p "require('./package.json').name")"
    echo "📦 Package version: $(node -p "require('./package.json').version")"
else
    echo "❌ Package.json missing"
    exit 1
fi

echo "✅ Build verification completed successfully!" 
#!/bin/bash

echo "🚀 Deploying Socket.IO optimized BloodContract to Railway..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Update Railway configuration
echo "📝 Updating Railway configuration..."
echo "✅ Railway configuration updated with Socket.IO optimizations"

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
sleep 30

# Test the deployment
echo "🧪 Testing deployment..."
curl -f https://bloodcontract-game-production.up.railway.app/health-simple

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Your app is live at: https://bloodcontract-game-production.up.railway.app"
    echo "📊 Socket.IO endpoint: https://bloodcontract-game-production.up.railway.app/ws"
else
    echo "❌ Deployment failed or health check failed"
    echo "🔍 Check Railway logs for more details"
    exit 1
fi

echo "🎉 Socket.IO optimization deployment complete!"
echo ""
echo "📋 What was changed:"
echo "  • Migrated HTTP requests to Socket.IO events"
echo "  • Updated Railway configuration for Socket.IO"
echo "  • Added connection status indicator"
echo "  • Optimized resource usage"
echo ""
echo "🔧 Next steps:"
echo "  • Test the frontend connection"
echo "  • Monitor Railway logs for any issues"
echo "  • Check Socket.IO connection status" 
# Socket.IO Migration - Railway Resource Optimization

## Problem Identified

Your BloodContract game was experiencing `net::ERR_INSUFFICIENT_RESOURCES` errors on Railway because:

1. **Too many HTTP requests**: The frontend was making hundreds of HTTP requests to the Railway backend
2. **Resource exhaustion**: Railway's free tier was being overwhelmed by the volume of requests
3. **Inefficient polling**: Components were constantly polling for updates via HTTP

## Solution Implemented

### 1. Socket.IO Migration

**Before**: HTTP requests for every data fetch
```javascript
// Old way - HTTP requests
const { data: character } = useQuery({
  queryKey: ["character"],
  queryFn: () => axios.get("/api/character").then((res) => res.data),
  staleTime: 0,
  retry: false,
});
```

**After**: Socket.IO real-time updates
```javascript
// New way - Socket.IO
const { hudData, isConnected, requestHud } = useSocket();

useEffect(() => {
  if (isConnected) {
    requestHud();
  }
}, [isConnected, requestHud]);
```

### 2. Backend Socket.IO Events

Added comprehensive Socket.IO event handlers in `backend/src/socket.js`:

- `gameNews:request` → `gameNews:update`
- `confinement:request` → `confinement:update`
- `crimes:request` → `crimes:update`
- `friendshipList:request` → `friendshipList:update`
- `messages:request` → `messages:update`
- `globalChatMessages:request` → `globalChatMessages:update`
- `unreadMessagesCount:request` → `unreadMessagesCount:update`
- `unclaimedTasksCount:request` → `unclaimedTasksCount:update`
- `friendRequestsCount:request` → `friendRequestsCount:update`
- `notificationsCount:request` → `notificationsCount:update`
- `introStatus:request` → `introStatus:update`

### 3. Frontend Socket Context

Updated `frontend/src/contexts/SocketContext.jsx` to:

- Manage all Socket.IO connections
- Provide real-time data state
- Handle connection status
- Replace HTTP requests with Socket.IO events

### 4. Railway Configuration Optimization

Updated `railway.json`:

```json
{
  "deploy": {
    "numReplicas": 1,
    "cpu": "0.5",
    "memory": "512MB"
  },
  "environments": {
    "production": {
      "variables": {
        "SOCKET_IO_PING_TIMEOUT": "60000",
        "SOCKET_IO_PING_INTERVAL": "25000",
        "SOCKET_IO_MAX_HTTP_BUFFER_SIZE": "1048576"
      }
    }
  }
}
```

### 5. Connection Status Indicator

Added `frontend/src/components/ConnectionStatus.jsx` to:

- Show real-time connection status
- Display connection attempts
- Help users understand when connection is lost

## Benefits

### 1. **Reduced Resource Usage**
- Single WebSocket connection instead of hundreds of HTTP requests
- Real-time updates without polling
- Lower CPU and memory usage on Railway

### 2. **Better User Experience**
- Real-time updates without page refreshes
- Connection status indicator
- Faster data updates

### 3. **Improved Reliability**
- Automatic reconnection handling
- Better error handling
- Connection state management

### 4. **Cost Optimization**
- Reduced Railway resource usage
- Lower bandwidth consumption
- More efficient server utilization

## Migration Status

### ✅ Completed
- [x] Socket.IO backend event handlers
- [x] Frontend Socket context
- [x] Connection status component
- [x] Railway configuration optimization
- [x] Home component migration
- [x] Socket data hooks

### 🔄 In Progress
- [ ] Migrate remaining components to use Socket.IO
- [ ] Update all HTTP requests to Socket.IO events
- [ ] Test all features with Socket.IO

### 📋 Next Steps

1. **Deploy the changes**:
   ```bash
   ./deploy-socket-optimization.sh
   ```

2. **Test the deployment**:
   - Check connection status indicator
   - Verify real-time updates work
   - Monitor Railway logs

3. **Migrate remaining components**:
   - Update all components to use `useSocketData` hooks
   - Replace remaining HTTP requests with Socket.IO events
   - Test all features thoroughly

4. **Monitor performance**:
   - Check Railway resource usage
   - Monitor Socket.IO connection stability
   - Verify no more `net::ERR_INSUFFICIENT_RESOURCES` errors

## Usage Examples

### Using Socket.IO Data Hooks

```javascript
import { useCharacterData, useGameNews } from '@/hooks/useSocketData';

function MyComponent() {
  const { character, isLoading, error } = useCharacterData();
  const { gameNews } = useGameNews();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Connection error</div>;

  return (
    <div>
      <h1>{character?.name}</h1>
      <p>Level: {character?.level}</p>
    </div>
  );
}
```

### Using Socket Context Directly

```javascript
import { useSocket } from '@/contexts/SocketContext';

function MyComponent() {
  const { 
    hudData, 
    isConnected, 
    requestHud,
    socketRequest 
  } = useSocket();

  const handleAction = async () => {
    try {
      const result = await socketRequest('some:action', { data: 'value' });
      console.log('Action result:', result);
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      <button onClick={handleAction}>Perform Action</button>
    </div>
  );
}
```

## Troubleshooting

### Connection Issues
1. Check Railway deployment status
2. Verify Socket.IO endpoint is accessible
3. Check browser console for connection errors
4. Monitor Railway logs for backend issues

### Data Not Updating
1. Verify Socket.IO connection is established
2. Check if event handlers are properly set up
3. Ensure backend is emitting correct events
4. Verify frontend is listening for correct events

### Performance Issues
1. Monitor Railway resource usage
2. Check Socket.IO connection count
3. Verify no memory leaks in event listeners
4. Optimize data payload sizes

## Files Modified

### Backend
- `backend/src/socket.js` - Added HTTP replacement event handlers
- `railway.json` - Optimized Railway configuration

### Frontend
- `frontend/src/contexts/SocketContext.jsx` - Enhanced Socket context
- `frontend/src/features/dashboard/Home.jsx` - Migrated to Socket.IO
- `frontend/src/components/ConnectionStatus.jsx` - New connection indicator
- `frontend/src/App.jsx` - Added connection status component
- `frontend/src/hooks/useSocketData.js` - New Socket.IO data hooks

### Scripts
- `deploy-socket-optimization.sh` - Deployment script
- `SOCKET_IO_MIGRATION.md` - This documentation

This migration should resolve the Railway resource exhaustion issues and provide a much better real-time experience for your BloodContract game! 
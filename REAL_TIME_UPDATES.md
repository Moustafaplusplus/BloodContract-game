# Real-Time Updates System

## Overview

The game now has a comprehensive real-time update system that eliminates the need for page refreshes and polling. All game state changes are automatically pushed to connected clients via WebSocket connections.

## Architecture

### Backend Socket Events

#### Core Events
- `hud:update` - Player HUD data (every 5 seconds)
- `profile:update` - Profile data updates
- `friendship:update` - Friendship status changes
- `inventory:update` - Inventory changes
- `bank:update` - Bank balance changes
- `tasks:update` - Task progress updates
- `gang:update` - Gang information updates
- `rankings:update` - Leaderboard updates

#### Confinement Events
- `hospital:enter` - Player enters hospital
- `hospital:leave` - Player leaves hospital
- `jail:enter` - Player enters jail
- `jail:leave` - Player leaves jail

#### Combat Events
- `fightResult` - Fight result data

#### Communication Events
- `notification` - New notification
- `global_message` - Global chat message
- `receive_message` - Private message received

### Frontend Hook: `useRealTimeUpdates`

The `useRealTimeUpdates` hook automatically handles all real-time updates:

```javascript
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

const { requestProfileUpdate, requestInventoryUpdate } = useRealTimeUpdates();
```

#### Available Request Functions
- `requestProfileUpdate(targetUserId)` - Request profile data
- `requestInventoryUpdate()` - Request inventory data
- `requestBankUpdate()` - Request bank data
- `requestTaskUpdate()` - Request task data
- `requestGangUpdate(gangId)` - Request gang data
- `requestRankingsUpdate()` - Request rankings data
- `requestHudUpdate()` - Request HUD data

## Implementation Details

### Backend Socket Helpers

The socket system includes helper functions for pushing updates:

```javascript
// Push profile updates
const pushProfileUpdate = async (targetUserId) => {
  const char = await Character.findOne({ where: { userId: targetUserId } });
  io.to(`user:${targetUserId}`).emit('profile:update', profileData);
};

// Push friendship updates
const pushFriendshipUpdate = async (targetUserId) => {
  // Check friendship status and emit to both users
  io.to(`user:${userId}`).emit('friendship:update', friendshipStatus);
  io.to(`user:${targetUserId}`).emit('friendship:update', friendshipStatus);
};
```

### Frontend Integration

Components automatically receive updates through the hook:

```javascript
// Profile component automatically updates when data changes
const { requestProfileUpdate } = useRealTimeUpdates();

useEffect(() => {
  if (character?.userId) {
    requestProfileUpdate(character.userId);
  }
}, [character?.userId]);
```

## Benefits

### ✅ **Eliminated Polling**
- No more 10-second intervals
- No unnecessary API calls
- Reduced server load

### ✅ **Instant Updates**
- Real-time friendship status
- Live inventory changes
- Instant bank balance updates
- Immediate task progress

### ✅ **Better UX**
- No page refreshes needed
- Toast notifications for changes
- Smooth state transitions

### ✅ **Reduced Bandwidth**
- Only send data when it changes
- Efficient WebSocket protocol
- No redundant requests

## Migration Guide

### For Existing Components

1. **Remove Polling**: Replace `setInterval` with socket events
2. **Add Hook**: Import and use `useRealTimeUpdates`
3. **Request Updates**: Use request functions when needed
4. **Remove Manual Refreshes**: Let socket handle updates

### Example Migration

**Before (with polling):**
```javascript
useEffect(() => {
  const interval = setInterval(fetchData, 10000);
  return () => clearInterval(interval);
}, []);
```

**After (with real-time):**
```javascript
const { requestDataUpdate } = useRealTimeUpdates();

useEffect(() => {
  requestDataUpdate();
}, []);
```

## Event Flow

1. **User Action** → Backend Service
2. **Service Update** → Database
3. **Socket Helper** → Emit Event
4. **Frontend Hook** → Handle Event
5. **Query Invalidation** → Update UI
6. **Toast Notification** → User Feedback

## Performance Considerations

- **Connection Management**: Automatic reconnection
- **Event Debouncing**: Prevent spam updates
- **Selective Updates**: Only update changed data
- **Memory Management**: Proper cleanup on unmount

## Debugging

### Backend Logs
```javascript
console.log(`[Socket] Emitting ${event} to user ${userId}`);
```

### Frontend Logs
```javascript
socket.on('event', (data) => {
  console.log('Received event:', data);
});
```

## Future Enhancements

- **Optimistic Updates**: Update UI before server confirmation
- **Batch Updates**: Combine multiple events
- **Offline Support**: Queue updates when disconnected
- **Compression**: Compress large data payloads

## Testing

### Manual Testing
1. Open multiple browser tabs
2. Perform actions in one tab
3. Verify updates appear in other tabs
4. Test disconnection/reconnection

### Automated Testing
```javascript
// Test socket events
socket.emit('test_event', data);
socket.on('test_response', (response) => {
  expect(response).toBeDefined();
});
```

## Troubleshooting

### Common Issues

1. **Updates Not Appearing**
   - Check socket connection status
   - Verify event listeners are registered
   - Check browser console for errors

2. **Duplicate Updates**
   - Ensure proper cleanup in useEffect
   - Check for multiple event listeners

3. **Performance Issues**
   - Monitor socket event frequency
   - Implement debouncing if needed
   - Check for memory leaks

### Debug Commands

```javascript
// Check socket connection
console.log('Socket connected:', socket.connected);

// List all event listeners
console.log('Socket events:', socket.eventNames());

// Test socket communication
socket.emit('test', { message: 'Hello' });
```

## Conclusion

The real-time update system provides a modern, responsive gaming experience with minimal server load and maximum user satisfaction. All game interactions now feel instant and fluid, creating a more engaging gameplay experience. 
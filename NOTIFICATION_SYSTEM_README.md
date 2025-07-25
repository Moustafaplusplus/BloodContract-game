# Notification System Documentation

## Overview
The notification system provides real-time notifications for various game events in BloodContract. It includes a comprehensive backend API, frontend components, and real-time updates via WebSocket.

## Features Implemented

### ✅ Notification Types
- **ATTACKED** - When player is attacked by another player
- **HOSPITALIZED** - When player is sent to hospital
- **JAILED** - When player is sent to jail
- **BANK_INTEREST** - When bank interest is received
- **JOB_SALARY** - When job salary is received
- **BLACK_MARKET_SOLD** - When item is sold in black market
- **MESSAGE_RECEIVED** - When receiving a new message
- **FRIEND_REQUEST_RECEIVED** - When receiving a friend request
- **FRIEND_REQUEST_ACCEPTED** - When friend request is accepted
- **CRIME_COOLDOWN_ENDED** - When crime cooldown ends
- **GYM_COOLDOWN_ENDED** - When gym cooldown ends
- **CONTRACT_EXECUTED** - When blood contract is executed
- **CONTRACT_FULFILLED** - When blood contract is fulfilled
- **VIP_EXPIRED** - When VIP status expires
- **VIP_ACTIVATED** - When VIP status is activated
- **OUT_OF_HOSPITAL** - When released from hospital
- **OUT_OF_JAIL** - When released from jail
- **GANG_JOIN_REQUEST** - When gang join request is received
- **GANG_MEMBER_LEFT** - When gang member leaves
- **ASSASSINATED** - When player is assassinated
- **SYSTEM** - General system notifications

### ✅ Backend Components

#### Database Model (`Notification.js`)
- Stores notification data with type, title, content, and metadata
- Includes read/unread status tracking
- Timestamps for creation

#### Service Layer (`NotificationService.js`)
- CRUD operations for notifications
- Helper methods for creating specific notification types
- Pagination support for lazy loading
- Bulk operations (mark all as read, delete all)

#### API Controller (`NotificationController.js`)
- RESTful endpoints for notification management
- Authentication and authorization
- Error handling and validation

#### Routes (`notifications.js`)
- `GET /api/notifications` - Get paginated notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications` - Delete all notifications
- `POST /api/notifications/test` - Test endpoint (remove in production)

### ✅ Frontend Components

#### Notification Icon (`NotificationIcon.jsx`)
- Displays in HUD with unread count badge
- Real-time updates via context
- Click to navigate to notifications page

#### Notifications Page (`Notifications.jsx`)
- Lazy loading with infinite scroll
- Individual notification management
- Bulk operations (mark all read, delete all)
- Color-coded notification types
- Arabic UI with proper RTL support

#### Context Provider (`NotificationContext.jsx`)
- Global state management for notifications
- Real-time updates via WebSocket
- Automatic polling for unread count

#### Custom Hook (`useNotifications.js`)
- Encapsulated notification logic
- WebSocket integration
- Audio notifications

### ✅ Integration Examples

#### Bank Interest Integration
```javascript
// In BankService.js
if (interest > 0) {
  await NotificationService.createBankInterestNotification(userId, interest);
}
```

#### Creating Custom Notifications
```javascript
// Using helper methods
await NotificationService.createAttackNotification(userId, attackerName, damage);

// Or using generic method
await NotificationService.createNotification(
  userId,
  'CUSTOM_TYPE',
  'Title',
  'Content',
  { customData: 'value' }
);
```

## Usage

### Backend Integration
1. Import `NotificationService` in your service file
2. Use helper methods or generic `createNotification` method
3. Notifications are automatically sent via WebSocket to connected clients

### Frontend Integration
1. Use `useNotificationContext()` hook to access notification state
2. The notification icon automatically appears in the HUD
3. Click the icon to view all notifications

### WebSocket Events
The system emits `notification` events when new notifications are created:
```javascript
socket.on('notification', (notification) => {
  // Handle new notification
  // Audio will play automatically
});
```

## Database Migration
Run the migration to update notification types:
```bash
# The migration is automatically applied when the server starts
# Or manually run:
npx sequelize-cli db:migrate
```

## Testing
Use the test endpoint to create sample notifications:
```bash
POST /api/notifications/test
Authorization: Bearer <token>
```

## Configuration
- Notifications are paginated with 30 items per page
- Unread count is polled every 30 seconds
- Audio notifications play for new notifications
- WebSocket events are sent in real-time

## Future Enhancements
- Notification preferences (email, push notifications)
- Notification categories and filtering
- Notification templates
- Notification analytics
- Mobile push notifications

## Security
- All endpoints require authentication
- Users can only access their own notifications
- Input validation and sanitization
- Rate limiting on notification creation

## Performance
- Lazy loading reduces initial load time
- Pagination prevents memory issues
- WebSocket reduces polling overhead
- Efficient database queries with proper indexing 
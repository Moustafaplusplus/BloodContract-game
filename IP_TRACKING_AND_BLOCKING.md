# IP Tracking and User Blocking System

## Overview
This system allows administrators to track IP addresses for all users and block both individual users and specific IP addresses from accessing the website.

## Features Implemented

### 1. IP Tracking
- **Automatic IP Detection**: Uses multiple headers to detect real IP addresses (x-forwarded-for, x-real-ip, etc.)
- **IP Storage**: Stores IP addresses with user agents and timestamps
- **IP History**: Tracks all IP addresses used by each user
- **Last IP Tracking**: Updates user's last known IP address

### 2. User Blocking
- **Account Blocking**: Block individual user accounts with custom reasons
- **IP Blocking**: Block specific IP addresses from accessing the site
- **Block Status**: Shows blocked users and IPs in admin panel
- **Block Messages**: Displays custom blocking messages to users

### 3. Admin Panel Features
- **IP Management Tab**: New tab in admin panel for IP management
- **IP Statistics**: Shows total IPs, blocked IPs, and unique users
- **Block IP Form**: Easy interface to block IP addresses
- **Blocked IPs List**: View and manage all blocked IP addresses
- **User Ban Buttons**: Quick ban/unban buttons in character management
- **IP Display**: Shows last known IP for each user

## Database Changes

### User Model Updates
```javascript
// Added fields to User model
isBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
banReason: { type: DataTypes.TEXT, defaultValue: '' },
bannedAt: { type: DataTypes.DATE, defaultValue: null },
isIpBanned: { type: DataTypes.BOOLEAN, defaultValue: false },
ipBanReason: { type: DataTypes.TEXT, defaultValue: '' },
ipBannedAt: { type: DataTypes.DATE, defaultValue: null },
lastIpAddress: { type: DataTypes.STRING, defaultValue: null },
```

### New IpTracking Model
```javascript
// New model for IP tracking
{
  userId: INTEGER,           // User who used this IP
  ipAddress: STRING,         // The IP address
  userAgent: TEXT,           // Browser/device info
  country: STRING,           // Country (future use)
  city: STRING,              // City (future use)
  isBlocked: BOOLEAN,        // Whether this IP is blocked
  blockReason: TEXT,         // Reason for blocking
  blockedAt: DATE,           // When blocked
  lastSeen: DATE             // Last time this IP was used
}
```

## API Endpoints

### IP Management
- `GET /api/admin/system/ips/blocked` - Get all blocked IPs
- `POST /api/admin/system/ips/block` - Block an IP address
- `DELETE /api/admin/system/ips/:ipAddress/unblock` - Unblock an IP
- `GET /api/admin/system/ips/stats` - Get IP statistics
- `GET /api/admin/system/users/:userId/ips` - Get user's IP history

### User Management
- `POST /api/admin/system/users/:userId/ban` - Ban/unban a user

## Frontend Components

### New Components
- `IpManagement.jsx` - Complete IP management interface
- Updated `CharacterManagement.jsx` - Added ban buttons and IP display
- Updated `SystemStats.jsx` - Added IP and ban statistics

### Updated Components
- `AdminPanel.jsx` - Added IP management tab
- `useAuth.jsx` - Added blocked user detection and handling

## How It Works

### 1. IP Detection
When a user makes any authenticated request:
1. System detects real IP using multiple headers
2. Validates IP format
3. Stores/updates IP tracking record
4. Updates user's last known IP

### 2. Blocking Logic
During login and authentication:
1. Check if user account is banned
2. Check if user's IP is blocked
3. If blocked, return 403 with blocking message
4. Frontend shows blocking message and logs out user

### 3. Admin Interface
- **IP Management Tab**: Block/unblock IPs, view statistics
- **Character Management**: Ban/unban users, view their IPs
- **System Stats**: View ban and IP statistics

## Usage Examples

### Block a User
1. Go to Admin Panel → Character Management
2. Find the user
3. Click the ban button (red icon)
4. Enter reason for ban
5. User will be blocked immediately

### Block an IP Address
1. Go to Admin Panel → IP Management
2. Enter IP address in the form
3. Add optional reason
4. Click "Block IP"
5. IP will be blocked for all users

### View IP History
1. Go to Admin Panel → Character Management
2. View "IP Address" column for each user
3. Shows last known IP for each user

## Security Features

### IP Detection
- Handles various proxy scenarios
- Validates IP format
- Uses multiple headers for accuracy
- Handles IPv4 and IPv6

### Blocking
- Immediate effect on login
- Custom blocking messages
- Audit trail with timestamps
- Separate user and IP blocking

### Admin Protection
- Only admins can access blocking features
- Confirmation dialogs for dangerous actions
- Clear visual indicators for blocked status

## Future Enhancements

### Geolocation
- Add country/city detection for IPs
- Block by geographic region
- Show location in admin panel

### Advanced Blocking
- Temporary blocks with expiration
- Block by IP range/CIDR
- Automatic blocking based on behavior

### Analytics
- IP usage patterns
- Blocking effectiveness metrics
- User behavior analysis

## Testing

### Test IP Blocking
1. Block your own IP address
2. Try to access the site
3. Should see blocking message
4. Unblock IP to restore access

### Test User Blocking
1. Block a test user account
2. Try to login with that account
3. Should see blocking message
4. Unblock user to restore access

## Notes

- IP tracking happens automatically on all authenticated requests
- Blocking takes effect immediately
- Blocked users see custom messages explaining why they're blocked
- All blocking actions are logged with timestamps
- Admin panel shows real-time statistics
- IPv4 and IPv6 addresses are supported
- Localhost addresses (::1) are displayed as "localhost" for better UX
- IP history can be viewed for each user via the globe icon in character management 
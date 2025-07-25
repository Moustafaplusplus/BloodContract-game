# Admin Control Panel - Blood Contract

## Overview
The admin control panel provides comprehensive tools for monitoring and managing player characters in the Blood Contract game. This panel allows administrators to view, modify, and control various aspects of player accounts and game data.

## Features

### 🔍 Character Management
- **View All Characters**: Browse all player characters with pagination and search functionality
- **Character Details**: View detailed information about each character including stats, equipment, and user data
- **Edit Character Properties**: Modify character names, levels, stats, and other attributes
- **Money Management**: Add or remove money from player accounts with reason tracking
- **Blackcoin Management**: Add or remove blackcoins from player accounts
- **Level Control**: Set character levels and automatically recalculate stats
- **Character Reset**: Completely reset a character to default values (dangerous operation)

### 📊 System Statistics
- **User Statistics**: Total users, active users, and user engagement metrics
- **Economic Overview**: Total money and blackcoins in the system
- **Game Balance**: Average player levels and progression statistics
- **Real-time Data**: Live updates of system metrics

### 🛡️ User Management
- **Ban/Unban Users**: Toggle user ban status with reason tracking
- **User Statistics**: View detailed statistics for individual users
- **Account Monitoring**: Track user activity and account status

## Setup Instructions

### 1. Make a User an Admin
To access the admin panel, you need to make a user an admin. Use the provided utility script:

```bash
# Navigate to the backend directory
cd backend

# Make a user an admin (replace with actual email)
node makeAdmin.js user@example.com
```

### 2. Access the Admin Panel
1. Log in with the admin account
2. Navigate to `/admin/panel` in your browser
3. The admin panel will be available in the navigation menu

## API Endpoints

### Character Management
- `GET /api/admin/characters` - Get all characters with pagination
- `GET /api/admin/characters/:id` - Get character by ID
- `PUT /api/admin/characters/:id` - Update character
- `POST /api/admin/characters/:id/money` - Adjust money
- `POST /api/admin/characters/:id/blackcoins` - Adjust blackcoins
- `POST /api/admin/characters/:id/level` - Set character level
- `POST /api/admin/characters/:id/reset` - Reset character

### User Management
- `POST /api/admin/users/:userId/ban` - Toggle user ban status
- `GET /api/admin/users/:userId/stats` - Get user statistics

### System Statistics
- `GET /api/admin/system/stats` - Get system-wide statistics

## Security Features

### Admin Authentication
- All admin routes require authentication
- Admin middleware checks for `isAdmin` flag in user account
- JWT token validation for all requests

### Dangerous Operations
- Character reset requires confirmation password
- Money/blackcoin adjustments are logged with reasons
- All operations are validated and sanitized

## Usage Guidelines

### Best Practices
1. **Always verify actions**: Double-check before making changes to player accounts
2. **Use reason tracking**: Provide clear reasons for money/blackcoin adjustments
3. **Monitor system stats**: Regularly check system statistics for balance issues
4. **Backup before major changes**: Consider backing up data before bulk operations

### Common Operations

#### Adding Money to a Player
1. Navigate to the Characters tab
2. Find the player using search
3. Click the "+1K" button next to their money
4. Provide a reason for the adjustment

#### Setting Player Level
1. Find the player in the character list
2. Click the edit icon next to their level
3. Enter the new level
4. The system will automatically recalculate stats

#### Resetting a Character
1. Find the player in the character list
2. Click the reset icon (refresh button)
3. Confirm the action with the password "CONFIRM_RESET"
4. The character will be reset to level 1 with default stats

## Troubleshooting

### Common Issues

#### "Admin access required" error
- Ensure the user has `isAdmin: true` in their user record
- Check that the JWT token is valid
- Verify the user is logged in

#### Character not found
- Check that the character ID is correct
- Ensure the character exists in the database
- Verify the user has a character record

#### Permission denied
- Check admin middleware is working correctly
- Verify the user's admin status in the database
- Ensure the JWT token contains the correct user ID

### Database Queries

#### Check if user is admin
```sql
SELECT id, username, email, "isAdmin" FROM "Users" WHERE email = 'user@example.com';
```

#### Make user admin
```sql
UPDATE "Users" SET "isAdmin" = true WHERE email = 'user@example.com';
```

#### View all admins
```sql
SELECT id, username, email FROM "Users" WHERE "isAdmin" = true;
```

## Development

### Adding New Admin Features
1. Add new methods to `AdminService.js`
2. Create corresponding controller methods in `AdminController.js`
3. Add routes to `admin.js`
4. Update the frontend admin panel component
5. Test thoroughly before deployment

### File Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── AdminController.js
│   ├── services/
│   │   └── AdminService.js
│   ├── middleware/
│   │   └── admin.js
│   └── routes/
│       └── admin.js
└── makeAdmin.js

frontend/
└── src/
    └── features/
        └── admin/
            ├── AdminPanel.jsx
            └── CreateCrime.jsx
```

## Support

For issues or questions about the admin panel:
1. Check the console for error messages
2. Verify database connections
3. Ensure all middleware is properly configured
4. Check user permissions and admin status

## Security Notes

⚠️ **Important Security Considerations:**
- The admin panel has full access to player data
- All operations are logged and should be monitored
- Use strong authentication for admin accounts
- Regularly audit admin actions
- Consider implementing additional security measures for production use 
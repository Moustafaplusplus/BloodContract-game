# Hospital and Jail Confinement System

## Overview

The confinement system restricts player access to various game features when they are in hospital or jail. This creates realistic gameplay consequences and prevents abuse of game mechanics.

## How It Works

### Entry Conditions

**Hospital:**
- Players enter hospital when their HP reaches 0 or below after fights
- Fixed 20-minute stay duration
- Fixed 100 HP loss

**Jail:**
- Players enter jail when they fail certain crimes
- Variable time based on crime type and severity
- No HP loss, just time restriction

### Cost System

Both hospital and jail use a fixed cost system:
- **100 money per minute** for early release
- Cost increases with remaining time
- Players can choose to wait for natural release or pay for immediate release

### Time Tracking

- Uses `startedAt` and `releasedAt` timestamps
- Real-time countdown timers
- Automatic release via background jobs
- Socket.io events for live updates

## Backend Implementation

### Middleware System

Created `backend/src/middleware/confinement.js` with four middleware functions:

1. **`checkHospitalAccess`** - Restricts access when in hospital
2. **`checkJailAccess`** - Restricts access when in jail  
3. **`checkConfinementAccess`** - Restricts access when in any confinement
4. **`addConfinementStatus`** - Adds confinement status to request object

### Applied Restrictions

The following routes now have confinement restrictions:

**Crimes:**
- `POST /api/crimes/execute/:crimeId` - Cannot commit crimes while confined

**Fights:**
- `POST /api/fight/:defenderId` - Cannot attack players while confined

**Blood Contracts:**
- `POST /api/blood-contracts/ghost-assassin` - Cannot hire assassins while confined
- `POST /api/blood-contracts` - Cannot create contracts while confined

**Jobs:**
- `POST /api/jobs/hire` - Can get hired while confined
- `POST /api/jobs/quit` - Can quit job while confined
- `POST /api/jobs/gym` - Can train at gym while confined

**Shops:**
- `POST /api/shop/buy/weapon/:id` - Can buy weapons while confined
- `POST /api/shop/buy/armor/:id` - Can buy armor while confined

**Special Shop:**
- `POST /api/special-shop/buy/blackcoin` - Can buy blackcoins while confined
- `POST /api/special-shop/buy/vip` - Can buy VIP while confined
- `POST /api/special-shop/buy/special/:id` - Can buy special items while confined
- `POST /api/special-shop/buy/weapon/:id` - Can buy special weapons while confined
- `POST /api/special-shop/buy/armor/:id` - Can buy special armor while confined
- `POST /api/special-shop/buy/money` - Can buy money packages while confined

**Black Market:**
- `POST /api/black-market/listings` - Can post listings while confined
- `POST /api/black-market/listings/buy` - Can buy listings while confined
- `POST /api/black-market/listings/cancel` - Can cancel listings while confined
- `POST /api/black-market/buy` - Can buy items while confined

### Error Responses

When a confined player tries to access restricted features, they receive:

```json
{
  "error": "Hospital Access Restricted" | "Jail Access Restricted",
  "message": "لا يمكن الوصول لهذه الميزة أثناء وجودك في المستشفى/السجن",
  "remainingSeconds": 1200,
  "cost": 2000,
  "type": "hospital" | "jail"
}
```

## Frontend Implementation

### Custom Hook

Created `frontend/src/hooks/useConfinement.js` with:

- Real-time confinement status tracking
- Socket.io integration for live updates
- Utility functions for checking confinement state
- Error handling for confinement-related API errors

### Components

**`ConfinementRestriction.jsx`:**
- Displays confinement status with timer and cost
- Provides navigation to hospital/jail pages
- Shows appropriate icons and messages

**`ConfinementWrapper.jsx`:**
- Higher-order component for wrapping pages
- Automatically shows restrictions when needed
- Supports different display modes (top, overlay)

### Utilities

**`confinementUtils.js`:**
- API call wrapper with confinement error handling
- Utility functions for formatting time and messages
- Error handling for confinement-related responses

## Usage Examples

### Backend Route Protection

```javascript
import { checkConfinementAccess } from '../middleware/confinement.js';

// Protect a route
router.post('/execute/:crimeId', auth, checkConfinementAccess, CrimeController.executeCrime);
```

### Frontend Component Usage

```javascript
import { useConfinement } from '@/hooks/useConfinement';
import ConfinementRestriction from '@/components/ConfinementRestriction';

function MyComponent() {
  const { isConfined, getConfinementMessage } = useConfinement();
  
  if (isConfined()) {
    return <ConfinementRestriction />;
  }
  
  return <div>Normal content</div>;
}
```

### API Call with Confinement Handling

```javascript
import { withConfinementCheck } from '@/utils/confinementUtils';

const apiCall = withConfinementCheck(async (url, options) => {
  const response = await fetch(url, options);
  return response.json();
});

try {
  await apiCall('/api/crimes/execute/123');
} catch (error) {
  if (error.isConfinementError) {
    // Handle confinement error
    console.log('User is confined:', error.type);
  }
}
```

## Allowed Features While Confined

Players can still access these features while in hospital or jail:

- **Viewing pages** (read-only access)
- **Chat and messaging**
- **Profile viewing**
- **Inventory viewing**
- **Bank balance checking**
- **Gang information**
- **Notifications**
- **Settings and preferences**

## Restricted Features While Confined

Players cannot access these features while confined:

- **Committing crimes**
- **Attacking other players**
- **Creating blood contracts**
- **Hiring ghost assassins**

## Real-time Updates

The system provides real-time updates through:

1. **Socket.io events:**
   - `hospital:enter` - Player enters hospital
   - `hospital:leave` - Player leaves hospital
   - `jail:enter` - Player enters jail
   - `jail:leave` - Player leaves jail

2. **Automatic status polling:**
   - Frontend polls confinement status every 10 seconds
   - Updates UI immediately when status changes

3. **Background jobs:**
   - Automatic release when time expires
   - Database cleanup of expired records

## Error Handling

The system gracefully handles:

- **Network errors** - Falls back to default states
- **Database errors** - Continues operation with error logging
- **Socket disconnections** - Falls back to polling
- **Invalid confinement states** - Resets to free state

## Future Enhancements

Potential improvements:

1. **Different restriction levels** - Some features could be partially restricted
2. **Confinement types** - Different types of hospital/jail with different rules
3. **Escape mechanics** - Special items or conditions for early release
4. **Confinement events** - Special activities available only while confined
5. **Visitor system** - Other players can visit confined players
6. **Confinement statistics** - Track time spent in confinement

## Testing

To test the confinement system:

1. **Enter hospital:** Lose a fight (HP reaches 0)
2. **Enter jail:** Fail a crime
3. **Test restrictions:** Try to access restricted features
4. **Test release:** Wait for natural release or pay for early release
5. **Test real-time updates:** Check socket events and UI updates 
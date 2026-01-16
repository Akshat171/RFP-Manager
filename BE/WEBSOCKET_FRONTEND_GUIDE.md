# WebSocket Frontend Integration Guide

Real-time vendor proposal notifications using Socket.IO

## Backend Setup ✅

The backend is now configured with WebSocket support:
- Socket.IO server running on `http://localhost:3000`
- Emits `new-proposal` events when vendors reply
- Supports RFP-specific rooms for targeted updates

---

## Frontend Integration

### Step 1: Install Socket.IO Client

```bash
npm install socket.io-client
```

### Step 2: Create WebSocket Hook (React)

Create `src/hooks/useProposalSocket.js`:

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const useProposalSocket = (rfpId) => {
  const [socket, setSocket] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [newProposal, setNewProposal] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket server');

      // Join specific RFP room if rfpId is provided
      if (rfpId) {
        socketInstance.emit('join-rfp', rfpId);
      }
    });

    // Listen for new proposals
    socketInstance.on('new-proposal', (proposal) => {
      console.log('📨 New proposal received:', proposal);

      // If this proposal is for our RFP, add it to the list
      if (!rfpId || proposal.rfpId === rfpId) {
        setNewProposal(proposal);
        setProposals((prev) => {
          // Check if proposal already exists (update case)
          const existingIndex = prev.findIndex((p) => p._id === proposal._id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = proposal;
            return updated;
          }
          // Add new proposal
          return [proposal, ...prev];
        });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (rfpId) {
        socketInstance.emit('leave-rfp', rfpId);
      }
      socketInstance.disconnect();
    };
  }, [rfpId]);

  return { socket, proposals, newProposal };
};
```

### Step 3: Use in Your Component

```javascript
import React, { useEffect, useState } from 'react';
import { useProposalSocket } from './hooks/useProposalSocket';

const RFPProposals = ({ rfpId }) => {
  const [allProposals, setAllProposals] = useState([]);
  const { proposals: socketProposals, newProposal } = useProposalSocket(rfpId);

  // Fetch initial proposals from API
  useEffect(() => {
    fetchInitialProposals();
  }, [rfpId]);

  const fetchInitialProposals = async () => {
    const response = await fetch(`http://localhost:3000/api/proposals/rfp/${rfpId}`);
    const data = await response.json();
    setAllProposals(data.data);
  };

  // Merge WebSocket proposals with existing ones
  useEffect(() => {
    if (socketProposals.length > 0) {
      setAllProposals((prev) => {
        const merged = [...prev];
        socketProposals.forEach((newProp) => {
          const existingIndex = merged.findIndex((p) => p._id === newProp._id);
          if (existingIndex >= 0) {
            merged[existingIndex] = newProp;
          } else {
            merged.unshift(newProp);
          }
        });
        return merged;
      });
    }
  }, [socketProposals]);

  // Show notification when new proposal arrives
  useEffect(() => {
    if (newProposal) {
      // Show toast/notification
      showNotification(`New proposal from ${newProposal.vendorId.name}`);
    }
  }, [newProposal]);

  return (
    <div className="proposals-container">
      <h2>Vendor Proposals ({allProposals.length})</h2>

      {allProposals.map((proposal) => (
        <div key={proposal._id} className="proposal-card">
          <div className="proposal-header">
            <h3>{proposal.vendorId.name}</h3>
            {proposal._id === newProposal?._id && (
              <span className="badge-new">NEW</span>
            )}
          </div>

          <p><strong>Email:</strong> {proposal.vendorId.email}</p>

          <div className="extracted-data">
            <p><strong>💰 Price:</strong> ${proposal.extractedData.totalPrice?.toLocaleString()}</p>
            <p><strong>📅 Delivery:</strong> {new Date(proposal.extractedData.deliveryDate).toLocaleDateString()}</p>
            <p><strong>🛡️ Warranty:</strong> {proposal.extractedData.warrantyProvided}</p>
          </div>

          <details>
            <summary>View Full Response</summary>
            <pre>{proposal.vendorResponseEmail}</pre>
          </details>

          <p className="timestamp">
            Received: {new Date(proposal.receivedAt).toLocaleString()}
          </p>
        </div>
      ))}

      {allProposals.length === 0 && (
        <p>No proposals yet. Waiting for vendor responses...</p>
      )}
    </div>
  );
};

// Helper function for notifications
const showNotification = (message) => {
  if (Notification.permission === 'granted') {
    new Notification('New Vendor Proposal', {
      body: message,
      icon: '/logo.png',
    });
  }
};

export default RFPProposals;
```

### Step 4: Add CSS for New Badge

```css
.proposal-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.proposal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-new {
  background: #4CAF50;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.extracted-data {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
```

### Step 5: Request Notification Permission

Add this to your app initialization:

```javascript
// Request notification permission on app load
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []);
```

---

## WebSocket Events

### Events Emitted by Backend:

1. **`new-proposal`** - Sent to specific RFP room
   ```javascript
   {
     _id: "proposal-id",
     rfpId: "rfp-id",
     vendorId: {
       _id: "vendor-id",
       name: "Vendor Name",
       email: "vendor@example.com",
       category: "Electronics"
     },
     vendorResponseEmail: "Full email text...",
     extractedData: {
       totalPrice: 50000,
       deliveryDate: "2026-01-30",
       warrantyProvided: "3 years",
       notes: "..."
     },
     receivedAt: "2026-01-14T20:30:00Z",
     // Response Statistics
     responseStats: {
       totalResponses: 3,           // How many vendors have responded
       totalVendorsContacted: 5,    // How many vendors were contacted
       responseRate: 60             // Percentage (3/5 = 60%)
     }
   }
   ```

2. **`proposal-update`** - Broadcast to all clients
   - Same format as `new-proposal`

### Events Client Can Emit:

1. **`join-rfp`** - Join specific RFP room
   ```javascript
   socket.emit('join-rfp', rfpId);
   ```

2. **`leave-rfp`** - Leave specific RFP room
   ```javascript
   socket.emit('leave-rfp', rfpId);
   ```

---

## API Endpoints

### Get Response Statistics

Fetch response statistics for an RFP:

```javascript
const fetchRFPStats = async (rfpId) => {
  const response = await fetch(`http://localhost:3000/api/rfps/${rfpId}/stats`);
  const data = await response.json();
  return data.data;
};

// Response:
{
  "message": "RFP statistics retrieved successfully",
  "data": {
    "rfpId": "...",
    "totalVendorsContacted": 5,
    "totalResponses": 3,
    "pendingResponses": 2,
    "responseRate": 60,
    "respondedVendors": [
      {
        "vendorId": "...",
        "vendorName": "Vendor A",
        "receivedAt": "2026-01-14T20:30:00Z",
        "price": 50000
      }
    ]
  }
}
```

### Display Response Counter in UI

```javascript
const ResponseCounter = ({ responseStats }) => {
  if (!responseStats) return null;

  return (
    <div className="response-counter">
      <div className="stat-card">
        <h4>Response Rate</h4>
        <div className="stat-value">
          <span className="percentage">{responseStats.responseRate}%</span>
          <span className="fraction">
            {responseStats.totalResponses} / {responseStats.totalVendorsContacted}
          </span>
        </div>
        <p className="stat-label">vendors responded</p>
      </div>
    </div>
  );
};

// Use in your component
const RFPProposals = ({ rfpId }) => {
  const { newProposal } = useProposalSocket(rfpId);

  return (
    <div>
      {/* Show live response stats from WebSocket */}
      {newProposal?.responseStats && (
        <ResponseCounter responseStats={newProposal.responseStats} />
      )}

      {/* Rest of your proposals... */}
    </div>
  );
};
```

## Testing

1. **Start backend:**
   ```bash
   npm run dev
   ```

2. **Open frontend** in browser

3. **Send a test email** to your Gmail with:
   - Subject: `RE: RFP for Laptops`
   - Body: `We can provide 20 laptops for $50,000`

4. **Watch the magic:**
   - Backend logs: `📡 WebSocket event emitted for RFP: ...`
   - Backend logs: `📊 Response stats: 3/5 vendors responded`
   - Frontend: Proposal appears instantly without refresh!
   - Frontend: Response counter updates in real-time: **3/5 (60%)**

---

## Troubleshooting

**Frontend not receiving events:**
- Check browser console for WebSocket connection errors
- Verify CORS settings in server.js
- Ensure frontend is using correct URL (`http://localhost:3000`)

**Proposals duplicating:**
- Make sure you're checking for existing proposals before adding new ones
- Use proposal `_id` to detect duplicates

**Connection keeps disconnecting:**
- Check if backend server is running
- Verify no firewall blocking WebSocket connections

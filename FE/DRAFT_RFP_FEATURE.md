# Draft RFP Feature Guide

## Overview
Users can now save RFPs as drafts before sending them to vendors. This allows for review and modification before final submission.

## Features Implemented

### 1. Save as Draft Button
- **Location**: Chat interface in RFP Creator (`VendorActionCard`)
- **Functionality**: 
  - Appears next to the "Send" button
  - Allows users to save selected vendors and RFP details without sending emails
  - Shows loading state while saving
  - Displays success message when draft is saved

### 2. Drafts Page
- **Route**: `/drafts`
- **Access**: Available in the sidebar navigation
- **Features**:
  - List all saved draft RFPs
  - View RFP details (title, items, budget, timeline, category)
  - See selected vendors for each draft
  - Statistics dashboard showing:
    - Total drafts
    - Total selected vendors
    - Ready to send count

### 3. Draft Management
- **Send Draft**: Send RFP to selected vendors from the drafts page
- **Delete Draft**: Remove a draft permanently with confirmation
- **Auto-refresh**: List updates after sending or deleting drafts

## User Flow

### Creating a Draft
1. User starts conversation in RFP Creator
2. AI generates RFP summary and matching vendors
3. User selects vendors they want to send to
4. User clicks **"Save as Draft"** instead of "Send"
5. Draft is saved to backend
6. Success message appears with link to Drafts page

### Managing Drafts
1. User navigates to **Drafts** page from sidebar
2. User sees list of all saved drafts with:
   - RFP title and details
   - Selected vendors
   - Creation date
   - Budget and timeline (if available)
3. User can:
   - **Send**: Dispatch RFP to selected vendors
   - **Delete**: Remove draft permanently

### Sending a Draft
1. User clicks **"Send to X Vendors"** button
2. System calls `/api/rfps/:id/dispatch` with vendor IDs
3. RFP is sent to all selected vendors
4. Draft is removed from drafts list (now appears in Active RFPs)
5. Success notification is shown

## API Integration

### Save Draft
```http
POST /api/rfps/:id/draft
Content-Type: application/json

{
  "vendorIds": ["vendor_id_1", "vendor_id_2"]
}
```

**Response**: Draft saved with status "draft"

### Fetch Drafts
```http
GET /api/rfps/drafts
```

**Response**:
```json
{
  "message": "Drafts retrieved successfully",
  "data": [
    {
      "_id": "rfp_id",
      "originalDescription": "I need 20 laptops...",
      "structuredData": {
        "title": "Office Equipment Request",
        "items": [...],
        "category": "Hardware",
        "estimatedBudget": "$50,000",
        "timeline": "2 weeks"
      },
      "selectedVendors": [
        {
          "_id": "vendor_id",
          "name": "Vendor Name",
          "email": "vendor@example.com",
          "category": "Hardware"
        }
      ],
      "status": "draft",
      "createdAt": "2026-01-15T...",
      "updatedAt": "2026-01-15T..."
    }
  ],
  "count": 1
}
```

### Send Draft
```http
POST /api/rfps/:id/dispatch
Content-Type: application/json

{
  "vendorIds": ["vendor_id_1", "vendor_id_2"]
}
```

**Response**: RFP sent, status updated to "sent" or "active"

### Delete Draft
```http
DELETE /api/rfps/:id
```

**Response**: Draft deleted successfully

## Backend Requirements

The backend should implement the following endpoints:

1. **POST `/api/rfps/:id/draft`**
   - Save RFP with status "draft"
   - Store selected vendor IDs
   - Return saved draft data

2. **GET `/api/rfps/drafts`**
   - Return all RFPs with status "draft"
   - Include populated vendor details
   - Sort by creation date (newest first)

3. **DELETE `/api/rfps/:id`**
   - Delete draft RFP by ID
   - Only allow deletion of drafts (not sent RFPs)
   - Return success confirmation

4. **POST `/api/rfps/:id/dispatch`** (already exists)
   - Update status from "draft" to "sent" or "active"
   - Send emails to selected vendors
   - Return dispatch confirmation

## UI Components

### Modified Components
1. **VendorActionCard** (`src/components/chat/VendorActionCard.tsx`)
   - Added "Save as Draft" button
   - Added draft saved state UI
   - Handles save draft functionality

2. **ChatWindow** (`src/components/chat/ChatWindow.tsx`)
   - Passes `onSaveDraft` handler to VendorActionCard

3. **RFPCreator** (`src/pages/RFPCreator.tsx`)
   - Implements `handleSaveDraft` function
   - Calls draft API endpoint

### New Components
4. **Drafts** (`src/pages/Drafts.tsx`)
   - Complete drafts management page
   - Draft list with details
   - Send and delete functionality
   - Statistics dashboard

### Navigation
5. **Sidebar** (`src/components/layout/Sidebar.tsx`)
   - Added "Drafts" navigation item with Save icon

6. **App.tsx**
   - Added `/drafts` route

## Styling
- Draft badge: Amber color scheme (amber-100 bg, amber-700 text)
- Consistent with existing Shadcn-like aesthetic
- Responsive grid layouts
- Loading and empty states

## Benefits
- **Save Time**: Don't lose work if interrupted
- **Review Later**: Take time to review vendor selection
- **Flexibility**: Prepare multiple RFPs in advance
- **Organization**: Keep track of pending RFPs before sending

## Future Enhancements
- Edit draft RFP details
- Duplicate drafts
- Add/remove vendors from draft
- Draft expiration/auto-cleanup
- Share drafts with team members

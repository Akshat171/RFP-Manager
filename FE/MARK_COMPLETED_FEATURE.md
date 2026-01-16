# Mark RFP as Completed Feature

## Overview
Users can now mark RFPs as completed directly from the Active RFPs page. This allows for better tracking of the RFP lifecycle and organization.

## Features

### 1. Mark as Completed Button
- **Location**: Active RFPs page, on each RFP card (next to "View Proposals" button)
- **Visibility**: Only shown for RFPs that are not already completed
- **Styling**: Green-themed button (emerald color) to indicate completion action
- **States**:
  - Default: Shows "Mark Completed" with checkmark icon
  - Loading: Shows "Marking..." with spinner while API call is in progress
  - Disabled: Button is disabled while marking is in progress

### 2. Confirmation Dialog
- Before marking as completed, user sees a confirmation dialog
- Dialog message: "Are you sure you want to mark '[RFP Title]' as completed?"
- Prevents accidental completion

### 3. Status Update
- **Local State Update**: RFP status immediately updates in the UI
- **Stats Refresh**: Active count decreases, Completed count increases
- **Badge Update**: RFP badge changes to "Completed" with green styling
- **Toast Notification**: Success message shown after completion

### 4. Real-time Feedback
- Loading spinner during API call
- Success toast: "RFP marked as completed successfully!"
- Error toast: "Failed to mark RFP as completed. Please try again."

## User Flow

1. **Navigate** to Active RFPs page
2. **Find** the RFP you want to mark as completed
3. **Click** "Mark Completed" button (green button with checkmark)
4. **Confirm** in the dialog that appears
5. **Wait** for processing (button shows "Marking..." with spinner)
6. **See** success notification and status badge update to "Completed"

## API Integration

### Endpoint
```http
PATCH /api/proposals/rfp/:rfpId
Content-Type: application/json
```

### Request Body
```json
{
  "status": "completed"
}
```

### Response (Expected)
```json
{
  "message": "RFP status updated successfully",
  "data": {
    "_id": "rfp_id",
    "status": "completed",
    "updatedAt": "2026-01-15T..."
  }
}
```

### Error Handling
- Network errors: Shows error toast
- Server errors (4xx, 5xx): Shows error toast
- State rollback: If error occurs, the UI state is not updated

## UI Changes

### Before Completion
- RFP Card shows status badge: "Active", "Sent", or "Pending" (blue/amber)
- "Mark Completed" button visible

### After Completion
- RFP Card shows status badge: "Completed" (green)
- "Mark Completed" button hidden (no longer visible)
- RFP remains in Active RFPs list for historical tracking

### Stats Dashboard
- **Active** count decreases by 1
- **Completed** count increases by 1
- **Total** count remains the same

## Technical Implementation

### State Management
```typescript
const [completingRfpId, setCompletingRfpId] = useState<string | null>(null)
```
- Tracks which RFP is currently being marked as completed
- Prevents duplicate API calls
- Enables loading state for specific RFP

### Handler Function
```typescript
const handleMarkAsCompleted = async (rfpId: string, title: string) => {
  // 1. Show confirmation dialog
  // 2. Make API call to PATCH /api/proposals/rfp/:rfpId
  // 3. Update local state
  // 4. Update statistics
  // 5. Show success/error toast
}
```

### Conditional Rendering
```tsx
{rfp.status !== 'completed' && (
  <Button
    variant="outline"
    size="sm"
    onClick={() => handleMarkAsCompleted(rfp._id, title)}
    disabled={completingRfpId === rfp._id}
    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
  >
    {/* Button content */}
  </Button>
)}
```

## Backend Requirements

The backend should:

1. **Accept PATCH Request**
   - Endpoint: `/api/proposals/rfp/:rfpId`
   - Body: `{ status: "completed" }`

2. **Update RFP Status**
   - Find RFP by ID
   - Update status field to "completed"
   - Update `updatedAt` timestamp

3. **Return Updated Data**
   - Confirm status update
   - Return updated RFP object

4. **Error Handling**
   - 404: RFP not found
   - 400: Invalid status value
   - 500: Server error

## Benefits

- **Organization**: Clear separation between active and completed RFPs
- **Tracking**: Better lifecycle management
- **Analytics**: Accurate completion statistics
- **User Experience**: Simple, one-click action with confirmation
- **Visibility**: Visual indication of RFP status at a glance

## Future Enhancements

- Filter RFPs by status (show only active, only completed, etc.)
- Ability to reopen completed RFPs
- Completion date/timestamp display
- Completion notes or reason
- Bulk mark as completed
- Export completed RFPs report
- Archive old completed RFPs

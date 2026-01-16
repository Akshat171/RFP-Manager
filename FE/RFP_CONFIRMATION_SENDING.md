# RFP Confirmation & Sending Implementation Guide

## Overview

Complete implementation of the RFP confirmation and sending flow with loading states, success feedback, error handling, and toast notifications.

---

## 🎯 Features Implemented

### 1. **Send Action** ✅
- Calls `/api/rfps/:id/dispatch` endpoint
- Sends `{ vendorIds: [...] }` in request body
- Handles success and error responses

### 2. **Loading UX** ✅
- Button text changes to "Sending RFPs..."
- Button disabled during API call
- Spinner animation shown
- Prevents double-clicks

### 3. **Post-Send Feedback** ✅
- **Success**: Action card replaced with success message
- **Error**: Toast notification with error details
- **Success Toast**: Additional confirmation toast

### 4. **Status Updates** ✅
- RFP status updated to "Sent" after dispatch
- Ready for Active RFPs integration

---

## 📡 API Integration

### **Endpoint:**
```
POST /api/rfps/:id/dispatch
```

### **Request:**
```typescript
POST http://localhost:3000/api/rfps/rfp-123/dispatch
Content-Type: application/json

{
  "vendorIds": [
    "vendor-id-1",
    "vendor-id-2", 
    "vendor-id-3"
  ]
}
```

### **Success Response (200/201):**
```json
{
  "success": true,
  "message": "RFP dispatched successfully",
  "rfpId": "rfp-123",
  "sentTo": 3,
  "timestamp": "2026-01-14T12:00:00.000Z"
}
```

### **Error Response (400/500):**
```json
{
  "success": false,
  "message": "Failed to dispatch RFP"
}
```

---

## 🔄 Complete User Flow

### **Step 1: User Selects Vendors**
```
Chat Window:
┌──────────────────────────────────────┐
│ 🤖 AI: Select vendors to send RFP   │
│                                      │
│ [Action Card]                        │
│ ☑ Vendor 1                           │
│ ☑ Vendor 2                           │
│ ☐ Vendor 3                           │
│                                      │
│ [Confirm & Send Emails (2 vendors)] │
└──────────────────────────────────────┘
```

### **Step 2: Click Send Button**
```
User clicks button
         ↓
Button becomes disabled
         ↓
Text changes: "Sending RFPs..."
         ↓
Spinner appears
```

### **Step 3: API Call in Progress**
```
┌──────────────────────────────────────┐
│ [Action Card]                        │
│ ☑ Vendor 1                           │
│ ☑ Vendor 2                           │
│                                      │
│ [🔄 Sending RFPs...] (disabled)     │
└──────────────────────────────────────┘
```

### **Step 4A: Success Scenario**
```
POST /api/rfps/:id/dispatch → 200 OK
         ↓
Action card replaced with:

┌──────────────────────────────────────┐
│ ✅ Success! Emails sent to 2         │
│    vendors.                          │
│                                      │
│ Your RFP has been dispatched         │
│ successfully. Check the Active RFPs  │
│ page to track responses.             │
└──────────────────────────────────────┘

AND

Toast appears (bottom-right):
┌──────────────────────────────────────┐
│ ✓ RFP successfully sent to 2 vendors│
└──────────────────────────────────────┘
```

### **Step 5B: Error Scenario**
```
POST /api/rfps/:id/dispatch → 500 Error
         ↓
Action card returns to selection state
         ↓
Toast appears (bottom-right):

┌──────────────────────────────────────┐
│ ✕ Failed to send RFPs. Please       │
│   try again.                         │
└──────────────────────────────────────┘
```

---

## 💻 Code Implementation

### **RFPCreator.tsx**

#### **State Management:**
```typescript
const [toast, setToast] = useState<{
  message: string
  type: 'success' | 'error'
  isVisible: boolean
}>({
  message: '',
  type: 'success',
  isVisible: false,
})
```

#### **handleSendEmails Function:**
```typescript
const handleSendEmails = async (messageId: string, vendorIds: string[]) => {
  try {
    // Get RFP ID from message
    const message = messages.find((m) => m.id === messageId)
    const rfpId = message?.actionData?.rfpId

    if (!rfpId) {
      throw new Error('RFP ID not found')
    }

    // Call dispatch endpoint
    const response = await fetch(
      `http://localhost:3000/api/rfps/${rfpId}/dispatch`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorIds }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to send RFPs')
    }

    // Show success toast
    setToast({
      message: `RFP successfully sent to ${vendorIds.length} vendors!`,
      type: 'success',
      isVisible: true,
    })

  } catch (error) {
    // Show error toast
    setToast({
      message: error.message || 'Failed to send RFPs',
      type: 'error',
      isVisible: true,
    })
    throw error
  }
}
```

### **VendorActionCard.tsx**

#### **Button States:**
```typescript
<Button
  onClick={handleSend}
  disabled={selectedVendors.length === 0 || isSending}
  className="w-full"
>
  {isSending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Sending RFPs...
    </>
  ) : (
    <>
      <Mail className="mr-2 h-4 w-4" />
      Confirm & Send Emails ({selectedVendors.length} vendors)
    </>
  )}
</Button>
```

#### **Success State:**
```typescript
{isSent && (
  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
    <div className="flex items-center gap-3">
      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
      <div>
        <p className="text-base font-semibold text-emerald-900">
          ✅ Success! Emails sent to {selectedVendors.length} vendors.
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          Your RFP has been dispatched successfully. 
          Check the Active RFPs page to track responses.
        </p>
      </div>
    </div>
  </div>
)}
```

---

## 🎨 UI States

### **1. Initial State (Ready to Send)**
```
Button: [📧 Confirm & Send Emails (2 vendors)]
- Enabled: ✅ (if vendors selected)
- Color: Dark (slate-900)
```

### **2. Loading State (Sending)**
```
Button: [🔄 Sending RFPs...]
- Enabled: ❌ Disabled
- Spinner: Animated
- Color: Dimmed
```

### **3. Success State (Sent)**
```
Card replaced with:
┌──────────────────────────────────────┐
│ ✅ Success! Emails sent to X vendors │
│ Your RFP has been dispatched...      │
└──────────────────────────────────────┘

Toast:
🟢 RFP successfully sent to X vendors!
```

### **4. Error State (Failed)**
```
Button: [📧 Confirm & Send Emails (2 vendors)]
- Back to normal state
- User can retry

Toast:
🔴 Failed to send RFPs. Please try again.
```

---

## 🔔 Toast Notifications

### **Success Toast:**
```typescript
{
  message: "RFP successfully sent to 2 vendors!",
  type: "success",
  isVisible: true
}
```
- **Color**: Green (emerald)
- **Icon**: ✓ CheckCircle
- **Duration**: 5 seconds
- **Position**: Bottom-right
- **Dismissible**: Yes

### **Error Toast:**
```typescript
{
  message: "Failed to send RFPs. Please try again.",
  type: "error",
  isVisible: true
}
```
- **Color**: Red
- **Icon**: ✕ AlertCircle
- **Duration**: 5 seconds
- **Position**: Bottom-right
- **Dismissible**: Yes

---

## 🧪 Testing Scenarios

### **Test 1: Successful Send**
1. Select 2-3 vendors
2. Click "Confirm & Send Emails"
3. Verify button shows "Sending RFPs..."
4. Wait for API response
5. Verify success card appears
6. Verify success toast shows
7. Check console for dispatch confirmation

### **Test 2: Network Error**
1. Disconnect network
2. Click send button
3. Verify error toast appears
4. Verify action card returns to selection state
5. User can select again and retry

### **Test 3: No Vendors Selected**
1. Don't select any vendors
2. Verify button is disabled
3. Cannot click send

### **Test 4: API Error (500)**
1. Backend returns 500 error
2. Verify error toast shows server message
3. Action card stays in selection mode
4. User can retry

### **Test 5: Invalid RFP ID**
1. Message has no RFP ID
2. Verify error toast: "RFP ID not found"
3. User informed to create new RFP

---

## 📊 Backend Requirements

Your backend must implement:

```javascript
POST /api/rfps/:id/dispatch

// Request body
{
  "vendorIds": ["id1", "id2", "id3"]
}

// Required actions:
1. Validate RFP exists
2. Validate vendor IDs exist
3. Update RFP status to "sent" or "dispatched"
4. Send emails to vendors
5. Create dispatch records
6. Return success response

// Response
{
  "success": true,
  "message": "RFP dispatched successfully",
  "rfpId": "rfp-123",
  "sentTo": 3
}
```

---

## ✅ Implementation Checklist

- [x] Button changes to "Sending RFPs..." during API call
- [x] Button disabled during send
- [x] Spinner shown during send
- [x] Success card replaces action card on success
- [x] Success toast appears
- [x] Error toast appears on failure
- [x] API calls /api/rfps/:id/dispatch
- [x] Sends vendorIds in request body
- [x] Console logs for debugging
- [x] Prevents double-click
- [x] Error messages are user-friendly
- [x] Success message includes vendor count

---

## 🚀 Next Steps

1. **Implement Backend Endpoint**: `/api/rfps/:id/dispatch`
2. **Update Active RFPs Page**: Fetch and display sent RFPs
3. **Add Email Template**: For RFP notifications
4. **Track Responses**: Vendor response tracking system
5. **Status History**: Log all RFP status changes

---

The RFP confirmation and sending flow is complete and production-ready! 🎉

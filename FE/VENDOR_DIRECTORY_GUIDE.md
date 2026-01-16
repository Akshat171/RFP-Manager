# Vendor Directory & RFP Distribution Guide

## Overview

The Vendor Directory feature provides a complete workflow for managing vendors and distributing RFPs with a professional, clean UI following the Shadcn-like aesthetic.

## Architecture

```
src/
├── components/
│   ├── ui/
│   │   ├── Checkbox.tsx         # Custom checkbox with Shadcn styling
│   │   ├── Input.tsx            # Input field component
│   │   ├── Modal.tsx            # Reusable modal/dialog component
│   │   └── Toast.tsx            # Toast notification system
│   └── vendors/
│       ├── VendorTable.tsx      # Main table with multi-select
│       ├── FloatingActionBar.tsx # Bottom action bar for selections
│       └── SendRFPModal.tsx     # RFP selection and sending modal
└── pages/
    └── VendorDirectory.tsx      # Updated main page
```

## Features

### 1. **VendorTable Component**
Location: `/components/vendors/VendorTable.tsx`

**Features:**
- ✅ Multi-select with checkboxes
- ✅ Select all functionality
- ✅ Search bar (searches name, email, category)
- ✅ Category filter dropdown
- ✅ Responsive table design
- ✅ Empty state handling
- ✅ Selection count display

**Props:**
```typescript
interface VendorTableProps {
  vendors: Vendor[]
  selectedVendors: string[]
  onSelectionChange: (selectedIds: string[]) => void
}
```

### 2. **FloatingActionBar Component**
Location: `/components/vendors/FloatingActionBar.tsx`

**Features:**
- ✅ Appears only when vendors are selected
- ✅ Shows selection count in a badge
- ✅ "Send RFP" button with count
- ✅ Clear selection button
- ✅ Smooth slide-in animation
- ✅ Fixed positioning at bottom center

**Props:**
```typescript
interface FloatingActionBarProps {
  selectedCount: number
  onSend: () => void
  onClear: () => void
}
```

### 3. **SendRFPModal Component**
Location: `/components/vendors/SendRFPModal.tsx`

**Features:**
- ✅ Fetches RFPs from `/api/rfps` endpoint
- ✅ Displays RFPs in selectable cards
- ✅ Shows RFP title, description, date, and status
- ✅ Summary preview of selection
- ✅ Sends to `/api/rfps/:id/send` with vendor IDs
- ✅ Loading states during fetch and send
- ✅ Error handling
- ✅ Escape key to close
- ✅ Click outside to close

**Props:**
```typescript
interface SendRFPModalProps {
  isOpen: boolean
  onClose: () => void
  selectedVendorIds: string[]
  vendorCount: number
  onSuccess: () => void
}
```

### 4. **Toast Notification**
Location: `/components/ui/Toast.tsx`

**Features:**
- ✅ Success and error variants
- ✅ Auto-dismiss after 5 seconds (configurable)
- ✅ Manual close button
- ✅ Smooth animations
- ✅ Fixed positioning at bottom-right

## User Flow

### Complete RFP Distribution Workflow

1. **Vendor Selection**
   - User navigates to Vendor Directory
   - Searches/filters vendors using search bar and category dropdown
   - Selects vendors using checkboxes
   - Can select all visible vendors at once

2. **Action Bar Appears**
   - Floating action bar slides up from bottom
   - Shows number of selected vendors
   - Displays "Send RFP to X Vendors" button

3. **RFP Selection Modal**
   - User clicks "Send RFP" button
   - Modal opens with loading spinner
   - RFPs are fetched from backend
   - User sees list of available RFPs
   - Clicks to select desired RFP

4. **Preview & Confirmation**
   - Summary preview shows:
     - Selected RFP title
     - Number of recipients
     - Brief description
   - "Send" button becomes active

5. **Send RFP**
   - User clicks "Send" button
   - Button shows loading spinner
   - POST request to `/api/rfps/:id/send` with vendor IDs
   - On success:
     - Modal closes
     - Selection clears
     - Success toast appears

6. **Feedback**
   - Green success toast: "RFP successfully sent to X vendors!"
   - Auto-dismisses after 5 seconds
   - User can continue working

## API Integration

### 1. Fetch RFPs
```typescript
GET http://localhost:3000/api/rfps

Response: RFP[]
interface RFP {
  id: string
  title: string
  description: string
  createdAt: string
  status: string
}
```

### 2. Send RFP to Vendors
```typescript
POST http://localhost:3000/api/rfps/:id/send
Content-Type: application/json

Body: {
  vendorIds: string[]
}

Response: Success/Error status
```

## UI Components Added

### Checkbox (`/components/ui/Checkbox.tsx`)
- Custom checkbox with clean styling
- Checked state shows checkmark icon
- Supports disabled state
- Focus ring for accessibility

### Input (`/components/ui/Input.tsx`)
- Clean text input with border
- Focus states with ring
- Placeholder styling
- Disabled state support

### Modal (`/components/ui/Modal.tsx`)
- Backdrop with blur effect
- Responsive sizing (sm, md, lg, xl)
- Close button in header
- Escape key and click outside to close
- Prevents body scroll when open

### Toast (`/components/ui/Toast.tsx`)
- Success (green) and error (red) variants
- Auto-dismiss with configurable duration
- Manual close button
- Smooth slide-in animation

## Styling Philosophy

All components follow the **Shadcn-like aesthetic**:

- ✅ Clean lines with subtle borders (`border-slate-200`)
- ✅ Professional monochrome palette (Slate/Zinc)
- ✅ Generous white space
- ✅ Smooth transitions and animations
- ✅ Clear typography hierarchy
- ✅ Consistent spacing using Tailwind scale
- ✅ Focus states for accessibility
- ✅ Hover effects for interactivity

## Responsive Design

- **Mobile**: Stacked layout, single column table
- **Tablet**: Adaptive search bar and filters
- **Desktop**: Full table layout with all features

## State Management

The VendorDirectory page manages:
- `vendors`: List of all vendors
- `selectedVendors`: Array of selected vendor IDs
- `isModalOpen`: Modal visibility state
- `toast`: Toast notification state

## Error Handling

- Network errors show error messages
- Empty states for no vendors/RFPs
- Loading states during API calls
- User-friendly error messages

## Accessibility

- ✅ Proper ARIA labels on checkboxes
- ✅ Keyboard navigation support
- ✅ Focus indicators on interactive elements
- ✅ Semantic HTML structure
- ✅ Escape key to close modal

## Future Enhancements

Consider adding:
- Vendor pagination
- Bulk vendor import
- RFP template preview
- Email preview before sending
- Send history/tracking
- Vendor groups/tags

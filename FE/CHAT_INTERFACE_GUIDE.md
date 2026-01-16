
# AI Chat Interface Guide

## Overview

A complete autonomous chat interface for RFP creation that allows users to describe their requirements in natural language and interact with AI-generated action cards to select vendors and send RFPs directly within the conversation.

## Architecture

```
src/
├── types/
│   └── chat.ts                    # TypeScript interfaces
├── components/
│   └── chat/
│       ├── ChatWindow.tsx         # Main chat container
│       ├── MessageBubble.tsx      # Individual message component
│       └── VendorActionCard.tsx   # AI-generated action card
└── pages/
    └── RFPCreator.tsx            # Updated with chat interface
```

## Components

### 1. **ChatWindow** (`/components/chat/ChatWindow.tsx`)

The main container component managing the entire chat experience.

#### Features:
- ✅ **Scrollable Message Area**: Auto-scrolls to latest message
- ✅ **Fixed Bottom Input**: Stays at bottom while scrolling
- ✅ **Auto-resizing Textarea**: Expands as user types
- ✅ **Empty State**: Helpful prompts and examples
- ✅ **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- ✅ **Loading States**: Disables input during processing

#### Props:
```typescript
interface ChatWindowProps {
  onSendMessage: (message: string) => Promise<void>
  messages: ChatMessage[]
  onSendEmails: (messageId: string, vendorIds: string[]) => Promise<void>
}
```

#### Layout:
```
┌────────────────────────────────────────┐
│  [Scrollable Messages Area]            │
│                                        │
│  👤 User: I need 20 laptops            │
│                                        │
│  🤖 AI: I've analyzed your request     │
│     [Action Card with vendor list]     │
│                                        │
│                                        │
│  ↓ Auto-scroll                         │
└────────────────────────────────────────┘
│  ┌──────────────────────────┐  [Send] │
│  │ Type your message...     │         │
│  └──────────────────────────┘         │
└────────────────────────────────────────┘
```

### 2. **MessageBubble** (`/components/chat/MessageBubble.tsx`)

Individual message component supporting different message types.

#### Message Types:
1. **User Messages**
   - Right-aligned
   - Dark background (`slate-900`)
   - White text
   - User icon avatar

2. **AI Messages**
   - Left-aligned
   - Light background with border
   - Dark text
   - Bot icon avatar

3. **Thinking Messages**
   - Animated spinner
   - "Thinking..." text
   - Bot avatar

4. **Action Messages**
   - Contains action cards
   - Special rendering

#### Features:
- ✅ Avatar icons (User/Bot)
- ✅ Timestamp display
- ✅ Message alignment
- ✅ Support for children (action cards)
- ✅ Responsive max-width

#### Design:
```
User Message (Right):
                    ┌────────────────┐  👤
                    │ User message   │
                    │ content here   │
                    └────────────────┘
                         10:30 AM

AI Message (Left):
  🤖  ┌────────────────┐
      │ AI response    │
      │ content here   │
      └────────────────┘
      [Action Card]
           10:31 AM
```

### 3. **VendorActionCard** (`/components/chat/VendorActionCard.tsx`)

AI-generated interactive card for vendor selection and RFP sending.

#### Features:
- ✅ **RFP Summary Table**: Displays parsed requirements
- ✅ **Vendor Selection**: Checkboxes for each vendor
- ✅ **Select All**: Quick selection toggle
- ✅ **Inline Sending**: "Confirm & Send Emails" button
- ✅ **Loading States**: Spinner during email sending
- ✅ **Success State**: Confirmation after sending

#### Sections:

**1. RFP Summary Table**
```
┌─────────────────────────────────────┐
│ 📄 AI-Generated RFP Summary        │
├─────────────────────────────────────┤
│ Purchase Request: Office Equipment  │
├─────────────────────────────────────┤
│ Item      │ Quantity │ Specs       │
├───────────┼──────────┼─────────────┤
│ Laptops   │ 20       │ -           │
│ Monitors  │ 15       │ -           │
├─────────────────────────────────────┤
│ Category: Hardware                  │
│ Budget: TBD  Timeline: 2 weeks     │
└─────────────────────────────────────┘
```

**2. Vendor Selection**
```
Matching Vendors (4)      [Select All]

☑ 🏢 TechSolutions Inc.
     contact@techsolutions.com

☐ 🏢 Dell Enterprise
     sales@dellenterprise.com

☑ 🏢 HP Business Solutions
     business@hp.com

☐ 🏢 Lenovo Corporate
     corporate@lenovo.com

[📧 Confirm & Send Emails (2 vendors)]
```

**3. Success State**
```
┌─────────────────────────────────────┐
│ ✅ Emails Sent Successfully!        │
│    RFP sent to 2 vendors            │
└─────────────────────────────────────┘
```

#### Props:
```typescript
interface VendorActionCardProps {
  actionData: VendorActionData
  onSendEmails: (selectedVendorIds: string[]) => Promise<void>
}
```

## Types & Interfaces

### ChatMessage
```typescript
interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'action' | 'thinking'
  content: string
  timestamp: Date
  actionData?: VendorActionData
}
```

### VendorActionData
```typescript
interface VendorActionData {
  rfpSummary: RFPSummary
  matchingVendors: Vendor[]
  rfpId?: string
}
```

### RFPSummary
```typescript
interface RFPSummary {
  title: string
  items: Array<{
    item: string
    quantity: number | string
    specifications?: string
  }>
  category: string
  estimatedBudget?: string
  timeline?: string
}
```

## User Flow

### Complete Interaction Workflow:

1. **User Inputs Request**
   - Types: "I need 20 laptops and 15 monitors"
   - Presses Enter or clicks Send
   - Message appears in chat (user bubble)

2. **AI Processes Request**
   - "Thinking..." animation appears
   - POST to `/api/rfps/parse` with description
   - Backend AI extracts requirements

3. **AI Responds with Summary**
   - Thinking animation disappears
   - AI message: "I've analyzed your requirements..."
   - Action card appears below

4. **Action Card Displays**
   - RFP summary table shown
   - Category detected (Hardware)
   - Matching vendors listed (4 found)

5. **User Selects Vendors**
   - Clicks checkboxes to select vendors
   - Can use "Select All" for convenience
   - Counter updates: "(2 vendors)"

6. **User Confirms**
   - Clicks "Confirm & Send Emails (2 vendors)"
   - Button shows loading spinner
   - POST to `/api/rfps/:id/send` with vendor IDs

7. **Success Confirmation**
   - Action card updates to success state
   - Green checkmark: "Emails Sent Successfully!"
   - Ready for next request

8. **Continue Conversation**
   - User can ask follow-up questions
   - Create multiple RFPs in same session
   - Each gets its own action card

## API Integration

### 1. Parse RFP Request
```typescript
POST /api/rfps/parse
Content-Type: application/json

Body: {
  "description": "I need 20 laptops and 15 monitors"
}

Response: {
  "rfpId": "rfp-123",
  "title": "Purchase Request: Office Equipment",
  "items": [
    { "item": "Laptops", "quantity": 20 },
    { "item": "Monitors", "quantity": 15 }
  ],
  "category": "Hardware",
  "estimatedBudget": "TBD",
  "timeline": "2 weeks"
}
```

### 2. Send RFP to Vendors
```typescript
POST /api/rfps/:id/send
Content-Type: application/json

Body: {
  "vendorIds": ["vendor-1", "vendor-2"]
}

Response: {
  "success": true,
  "sentCount": 2
}
```

## Design System

### Shadcn-like Aesthetic

#### Colors:
- **Background**: `slate-50` (main area)
- **Cards**: `white` with `slate-200` borders
- **User Bubble**: `slate-900` background, white text
- **AI Bubble**: `white` background, `slate-900` text
- **Accents**: `slate-700`, `slate-600`
- **Success**: `emerald-50`, `emerald-600`

#### Typography:
- **Headers**: Bold, `slate-900`
- **Body**: Regular, `slate-700`
- **Timestamps**: Small, `slate-400`
- **Helper Text**: Small, `slate-500`

#### Spacing:
- Message gap: `space-y-6`
- Card padding: `p-4` to `p-6`
- Input padding: `px-4 py-3`

## Advanced Features

### Auto-scroll
- Automatically scrolls to bottom on new messages
- Smooth animation
- Uses `messagesEndRef` for reliable positioning

### Auto-resize Textarea
- Expands as user types
- Max height: 120px
- Then scrolls internally
- Resets to single line after sending

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift + Enter**: New line
- **Escape**: (future) Cancel/clear input

### Empty State
- Welcoming icon and title
- Helpful description
- Example prompts as clickable buttons
- User can click example to populate input

### Category Detection
- AI analyzes message content
- Detects keywords (laptop, cloud, software, etc.)
- Maps to vendor categories
- Shows only matching vendors

### Inline Vendor Selection
- No modal required
- All actions within chat
- Immediate feedback
- Persistent state per message

## State Management

### RFPCreator Page State:
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([])
```

### VendorActionCard State:
```typescript
const [selectedVendors, setSelectedVendors] = useState<string[]>([])
const [isSending, setIsSending] = useState(false)
const [isSent, setIsSent] = useState(false)
```

## Example Interactions

### Example 1: Hardware Purchase
```
👤: I need 20 laptops for my development team

🤖: I've analyzed your requirements and created an RFP summary

[Action Card]
┌─────────────────────────────────────┐
│ RFP Summary: Development Equipment  │
│ - Laptops: 20                       │
│ Category: Hardware                  │
│                                     │
│ Matching Vendors (4)                │
│ ☑ TechSolutions Inc.                │
│ ☑ Dell Enterprise                   │
│ ☑ HP Business Solutions             │
│ ☐ Lenovo Corporate                  │
│                                     │
│ [Send Emails (3 vendors)]           │
└─────────────────────────────────────┘
```

### Example 2: Cloud Services
```
👤: Looking for cloud infrastructure and hosting services

🤖: I've analyzed your requirements...

[Action Card]
┌─────────────────────────────────────┐
│ RFP Summary: Cloud Services         │
│ Category: Cloud Infrastructure      │
│                                     │
│ Matching Vendors (2)                │
│ ☑ CloudMasters LLC                  │
│ ☑ AWS Partner Solutions             │
│                                     │
│ [Send Emails (2 vendors)]           │
└─────────────────────────────────────┘
```

## Testing Checklist

- [ ] Empty state displays correctly
- [ ] User messages appear on right
- [ ] AI messages appear on left
- [ ] Thinking animation shows during processing
- [ ] Action cards render with RFP summary
- [ ] Vendor checkboxes work
- [ ] Select All toggles all vendors
- [ ] Send button disabled when no selection
- [ ] Loading spinner shows during send
- [ ] Success state appears after sending
- [ ] Auto-scroll works on new messages
- [ ] Textarea auto-resizes
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Multiple conversations work
- [ ] API errors handled gracefully

## Future Enhancements

- Message editing/deletion
- RFP history in sidebar
- File attachments
- Voice input
- Multi-language support
- Conversation export
- Vendor suggestions based on history
- Budget recommendations
- Timeline suggestions
- Rich text formatting
- Image/document preview in chat
- Real-time vendor availability
- Chat search functionality

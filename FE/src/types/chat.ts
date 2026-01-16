export interface Vendor {
  id: string
  name: string
  email: string
  category: string
}

export interface RFPSummary {
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

export interface VendorActionData {
  rfpSummary: RFPSummary
  matchingVendors: Vendor[]
  rfpId?: string
}

export type MessageType = 'user' | 'ai' | 'action' | 'thinking'

export interface ChatMessage {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  actionData?: VendorActionData
}

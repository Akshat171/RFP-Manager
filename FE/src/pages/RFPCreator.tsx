import { useState, useEffect } from 'react'
import { Sparkles, PlusSquare } from 'lucide-react'
import { ChatMessage } from '../types/chat'
import ChatWindow from '../components/chat/ChatWindow'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { apiUrl } from '../config/api'

interface Vendor {
  id: string
  name: string
  email: string
  category: string
}

export default function RFPCreator() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [allVendors, setAllVendors] = useState<Vendor[]>([])
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
    isVisible: boolean
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  })

  // Fetch vendors on component mount
  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const response = await fetch(apiUrl('/api/vendors'))
      
      if (!response.ok) {
        console.error('Failed to fetch vendors:', response.statusText)
        return
      }

      const response_data = await response.json()
      
      // Handle different response formats
      let vendorsArray: any[] = []
      
      if (Array.isArray(response_data)) {
        vendorsArray = response_data
      } else if (response_data.data && Array.isArray(response_data.data)) {
        vendorsArray = response_data.data
      }

      // Map backend fields to frontend format
      const mappedVendors = vendorsArray.map((vendor: any) => ({
        id: vendor._id || vendor.id,
        name: vendor.name,
        email: vendor.email,
        category: vendor.category,
      }))

      setAllVendors(mappedVendors)
      console.log('Loaded vendors for RFP matching:', mappedVendors)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const handleStartNewRFP = () => {
    if (messages.length === 0) return
    
    // Confirm before clearing if there are messages
    if (window.confirm('Are you sure you want to start a new RFP? This will clear the current conversation.')) {
      setMessages([])
    }
  }

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: `thinking-${Date.now()}`,
      type: 'thinking',
      content: '',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, thinkingMessage])

    try {
      // Call API to parse RFP
      const response = await fetch(apiUrl('/api/rfps/parse'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: message }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API Response from /api/rfps/parse:', data)

      // Extract RFP ID (handle different response formats)
      const rfpId = data._id || data.id || data.rfpId || `rfp-${Date.now()}`
      console.log('Extracted RFP ID:', rfpId)

      // Remove thinking message
      setMessages((prev) => prev.filter((m) => m.id !== thinkingMessage.id))

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: `I've analyzed your requirements and created an RFP summary. Here's what I found:`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Simulate brief delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Use vendors from API response if available, otherwise filter locally
      let matchingVendors = []
      let detectedCategory = ''

      if (data.vendors && Array.isArray(data.vendors) && data.vendors.length > 0) {
        // Use vendors returned from backend and map _id to id
        matchingVendors = data.vendors.map((vendor: any) => ({
          id: vendor._id || vendor.id, // Map MongoDB _id to id
          name: vendor.name,
          email: vendor.email,
          category: vendor.category,
        }))
        detectedCategory = data.data?.structuredData?.category || detectCategory(message, data)
        console.log('Using vendors from API (mapped):', matchingVendors)
      } else {
        // Fallback: Determine category and filter locally
        detectedCategory = detectCategory(message, data)
        matchingVendors = allVendors.filter(
          (v) => v.category === detectedCategory
        )
        console.log('Using locally filtered vendors:', matchingVendors)
      }

      console.log('Detected category:', detectedCategory)
      console.log('Final matching vendors:', matchingVendors)

      // Add action message with vendor selection
      const actionMessage: ChatMessage = {
        id: rfpId,
        type: 'action',
        content: 'Select vendors to send this RFP to:',
        timestamp: new Date(),
        actionData: {
          rfpSummary: {
            title: data.title || 'RFP Request',
            items: data.items || extractItems(message),
            category: detectedCategory,
            estimatedBudget: data.estimatedBudget,
            timeline: data.timeline,
          },
          matchingVendors,
          rfpId: rfpId,
        },
      }

      setMessages((prev) => [...prev, actionMessage])
    } catch (error) {
      console.error('Error processing message:', error)

      // Remove thinking message
      setMessages((prev) => prev.filter((m) => m.id !== thinkingMessage.id))

      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: `I encountered an error processing your request: ${
          error instanceof Error ? error.message : 'Unknown error'
        }. Please try again.`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleSendEmails = async (messageId: string, vendorIds: string[]) => {
    try {
      // Find the message with RFP data
      console.log('Looking for message with ID:', messageId)
      console.log('Vendor IDs received:', vendorIds)
      const message = messages.find((m) => m.id === messageId)
      console.log('Found message:', message)
      console.log('Matching vendors in message:', message?.actionData?.matchingVendors)
      
      const rfpId = message?.actionData?.rfpId
      console.log('Extracted RFP ID:', rfpId)

      if (!rfpId) {
        console.error('Message action data:', message?.actionData)
        setToast({
          message: 'RFP ID not found. Please try creating a new RFP.',
          type: 'error',
          isVisible: true,
        })
        throw new Error('RFP ID not found')
      }

      console.log('Sending RFP to vendors:', { rfpId, vendorIds, messageId })
      console.log('Payload being sent:', JSON.stringify({ vendorIds }, null, 2))

      // Send emails via API using /dispatch endpoint
      const response = await fetch(
        apiUrl(`/api/rfps/${rfpId}/dispatch`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vendorIds }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to send RFPs: ${response.statusText}`
        )
      }

      const result = await response.json()
      console.log('RFP dispatch successful:', result)

      // Show success toast
      setToast({
        message: `RFP successfully sent to ${vendorIds.length} vendor${
          vendorIds.length !== 1 ? 's' : ''
        }!`,
        type: 'success',
        isVisible: true,
      })

      // Success is handled in the VendorActionCard component
    } catch (error) {
      console.error('Error sending emails:', error)
      
      // Show error toast
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send RFPs. Please try again.',
        type: 'error',
        isVisible: true,
      })
      
      throw error
    }
  }

  const handleSaveDraft = async (messageId: string, vendorIds: string[]) => {
    try {
      // Find the message with RFP data
      const message = messages.find((m) => m.id === messageId)
      const rfpId = message?.actionData?.rfpId

      if (!rfpId) {
        setToast({
          message: 'RFP ID not found. Please try creating a new RFP.',
          type: 'error',
          isVisible: true,
        })
        throw new Error('RFP ID not found')
      }

      console.log('Saving draft:', { rfpId, vendorIds })

      // Save draft via API
      const response = await fetch(
        apiUrl(`/api/rfps/${rfpId}/draft`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vendorIds }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to save draft: ${response.statusText}`
        )
      }

      const result = await response.json()
      console.log('Draft saved successfully:', result)

      // Show success toast
      setToast({
        message: `Draft saved with ${vendorIds.length} vendor${
          vendorIds.length !== 1 ? 's' : ''
        }!`,
        type: 'success',
        isVisible: true,
      })
    } catch (error) {
      console.error('Error saving draft:', error)
      
      setToast({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to save draft. Please try again.',
        type: 'error',
        isVisible: true,
      })
      
      throw error
    }
  }

  // Helper function to detect category from message
  const detectCategory = (message: string, apiData: any): string => {
    if (apiData.category) return apiData.category

    const lowerMessage = message.toLowerCase()

    if (
      lowerMessage.includes('laptop') ||
      lowerMessage.includes('computer') ||
      lowerMessage.includes('monitor') ||
      lowerMessage.includes('hardware')
    ) {
      return 'Hardware'
    }

    if (
      lowerMessage.includes('cloud') ||
      lowerMessage.includes('infrastructure') ||
      lowerMessage.includes('server')
    ) {
      return 'Cloud Infrastructure'
    }

    if (
      lowerMessage.includes('software') ||
      lowerMessage.includes('application') ||
      lowerMessage.includes('development')
    ) {
      return 'Software'
    }

    return 'Services'
  }

  // Helper function to extract items from message (fallback)
  const extractItems = (message: string) => {
    const items: Array<{
      item: string
      quantity: number | string
      specifications?: string
    }> = []

    // Simple extraction logic (this would be improved by backend AI)
    const laptopMatch = message.match(/(\d+)\s+laptop/i)
    if (laptopMatch) {
      items.push({
        item: 'Laptops',
        quantity: parseInt(laptopMatch[1]),
      })
    }

    const monitorMatch = message.match(/(\d+)\s+monitor/i)
    if (monitorMatch) {
      items.push({
        item: 'Monitors',
        quantity: parseInt(monitorMatch[1]),
      })
    }

    if (items.length === 0) {
      items.push({
        item: 'As described in request',
        quantity: 'TBD',
      })
    }

    return items
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-slate-900">
            <Sparkles className="h-8 w-8 text-slate-900" />
            RFP Creator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Chat with AI to create RFPs and connect with vendors automatically
          </p>
        </div>
        {messages.length > 0 && (
          <Button onClick={handleStartNewRFP} variant="outline">
            <PlusSquare className="mr-2 h-4 w-4" />
            Start New RFP
          </Button>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden rounded-lg ">
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          onSendEmails={handleSendEmails}
          onSaveDraft={handleSaveDraft}
        />
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </div>
  )
}

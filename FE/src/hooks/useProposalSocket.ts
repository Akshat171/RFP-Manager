import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { API_BASE_URL } from '../config/api'

const SOCKET_URL = API_BASE_URL

export interface ResponseStats {
  totalResponses: number
  totalVendorsContacted: number
  responseRate: number
}

export interface ProposalData {
  _id: string
  rfpId: string
  vendorId: {
    _id: string
    name: string
    email: string
    category: string
  }
  vendorResponseEmail: string
  extractedData: {
    totalPrice?: number
    deliveryDate?: string
    warrantyProvided?: string
    notes?: string
  }
  complianceStatus?: {
    fulfilled: boolean
    reasons?: string[]
    summary?: string
  }
  receivedAt: string
  responseStats?: ResponseStats
}

export const useProposalSocket = (rfpId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [newProposal, setNewProposal] = useState<ProposalData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Connect to WebSocket server
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket server')
      setIsConnected(true)

      // Join specific RFP room if rfpId is provided
      if (rfpId) {
        socketInstance.emit('join-rfp', rfpId)
        console.log(`📡 Joined RFP room: ${rfpId}`)
      }
    })

    // Listen for new proposals
    socketInstance.on('new-proposal', (proposal: ProposalData) => {
      console.log('📨 New proposal received:', proposal)

      // If this proposal is for our RFP, add it to the list
      if (!rfpId || proposal.rfpId === rfpId) {
        setNewProposal(proposal)
        setProposals((prev) => {
          // Check if proposal already exists (update case)
          const existingIndex = prev.findIndex((p) => p._id === proposal._id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = proposal
            return updated
          }
          // Add new proposal
          return [proposal, ...prev]
        })
      }
    })

    // Listen for proposal updates
    socketInstance.on('proposal-update', (proposal: ProposalData) => {
      console.log('🔄 Proposal updated:', proposal)
      
      if (!rfpId || proposal.rfpId === rfpId) {
        setProposals((prev) => {
          const existingIndex = prev.findIndex((p) => p._id === proposal._id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = proposal
            return updated
          }
          return prev
        })
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      if (rfpId) {
        socketInstance.emit('leave-rfp', rfpId)
        console.log(`📡 Left RFP room: ${rfpId}`)
      }
      socketInstance.disconnect()
    }
  }, [rfpId])

  return { socket, proposals, newProposal, isConnected }
}

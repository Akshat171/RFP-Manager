import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ProposalData, ResponseStats } from './useProposalSocket'
import { API_BASE_URL } from '../config/api'

const SOCKET_URL = API_BASE_URL

export interface RFPUpdate {
  rfpId: string
  responseStats: ResponseStats
}

/**
 * Hook to listen for all RFP proposal updates across all RFPs
 * Used for updating response counts in the Active RFPs list
 */
export const useRFPUpdates = () => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [rfpUpdates, setRfpUpdates] = useState<Map<string, ResponseStats>>(new Map())
  const [updateCounter, setUpdateCounter] = useState(0)

  useEffect(() => {
    // Connect to WebSocket server
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to WebSocket server (RFP Updates)')
      setIsConnected(true)
    })

    // Listen for proposal-update events (broadcast to all clients)
    socketInstance.on('proposal-update', (proposal: ProposalData) => {
      console.log('🔄 RFP Update received:', proposal.rfpId, proposal.responseStats)
      
      if (proposal.responseStats) {
        setRfpUpdates((prev) => {
          const updated = new Map(prev)
          updated.set(proposal.rfpId, proposal.responseStats!)
          return updated
        })
        setUpdateCounter((prev) => prev + 1)
      }
    })

    // Also listen for new-proposal events (in case they're broadcast)
    socketInstance.on('new-proposal', (proposal: ProposalData) => {
      console.log('📨 New proposal (RFP Update):', proposal.rfpId, proposal.responseStats)
      
      if (proposal.responseStats) {
        setRfpUpdates((prev) => {
          const updated = new Map(prev)
          updated.set(proposal.rfpId, proposal.responseStats!)
          return updated
        })
        setUpdateCounter((prev) => prev + 1)
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server (RFP Updates)')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error (RFP Updates):', error)
      setIsConnected(false)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Helper function to get response stats for a specific RFP
  const getRFPStats = (rfpId: string): ResponseStats | null => {
    return rfpUpdates.get(rfpId) || null
  }

  return { socket, isConnected, rfpUpdates, getRFPStats, updateCounter }
}

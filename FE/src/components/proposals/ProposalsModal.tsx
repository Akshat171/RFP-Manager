import { useEffect, useState } from 'react'
import { X, Loader2, Package, Wifi, WifiOff } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Toast from '../ui/Toast'
import ProposalCard from './ProposalCard'
import { useProposalSocket, ProposalData } from '../../hooks/useProposalSocket'
import { apiUrl } from '../../config/api'

interface ProposalsModalProps {
  isOpen: boolean
  onClose: () => void
  rfpId: string
  rfpTitle: string
}

export default function ProposalsModal({
  isOpen,
  onClose,
  rfpId,
  rfpTitle,
}: ProposalsModalProps) {
  const [allProposals, setAllProposals] = useState<ProposalData[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as 'success' | 'error',
    isVisible: false,
  })

  // WebSocket hook for real-time updates
  const { proposals: socketProposals, newProposal, isConnected } = useProposalSocket(rfpId)

  // Fetch initial proposals from API
  useEffect(() => {
    if (isOpen && rfpId) {
      fetchInitialProposals()
    }
  }, [isOpen, rfpId])

  const fetchInitialProposals = async () => {
    setIsLoadingInitial(true)
    try {
      const response = await fetch(apiUrl(`/api/proposals/rfp/${rfpId}`))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch proposals: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Fetched initial proposals:', data)
      
      const proposalsArray = data.data || []
      setAllProposals(proposalsArray)
    } catch (error) {
      console.error('Error fetching proposals:', error)
      setToast({
        message: 'Failed to load proposals. Please try again.',
        type: 'error',
        isVisible: true,
      })
    } finally {
      setIsLoadingInitial(false)
    }
  }

  // Merge WebSocket proposals with existing ones
  useEffect(() => {
    if (socketProposals.length > 0) {
      setAllProposals((prev) => {
        const merged = [...prev]
        socketProposals.forEach((newProp) => {
          const existingIndex = merged.findIndex((p) => p._id === newProp._id)
          if (existingIndex >= 0) {
            merged[existingIndex] = newProp
          } else {
            merged.unshift(newProp)
          }
        })
        return merged
      })
    }
  }, [socketProposals])

  // Show notification when new proposal arrives
  useEffect(() => {
    if (newProposal) {
      setToast({
        message: `New proposal from ${newProposal.vendorId.name}`,
        type: 'success',
        isVisible: true,
      })

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Vendor Proposal', {
          body: `${newProposal.vendorId.name} has submitted a proposal`,
          icon: '/vite.svg',
        })
      }
    }
  }, [newProposal])

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Vendor Proposals</h2>
            <p className="mt-1 text-sm text-slate-600">{rfpTitle}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                <Package className="h-3 w-3" />
                {allProposals.length} {allProposals.length === 1 ? 'Proposal' : 'Proposals'}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Live Updates
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Reconnecting...
                  </>
                )}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <span className="ml-3 text-sm text-slate-600">Loading proposals...</span>
            </div>
          ) : allProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">
                No proposals yet. Waiting for vendor responses...
              </p>
              {isConnected && (
                <p className="mt-2 text-sm text-slate-500">
                  🔔 You'll be notified when vendors respond
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {allProposals.map((proposal) => (
                <ProposalCard
                  key={proposal._id}
                  proposal={proposal}
                  isNew={proposal._id === newProposal?._id}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </>
  )
}

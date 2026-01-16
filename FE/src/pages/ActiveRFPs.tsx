import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle2, AlertCircle, Loader2, MessageSquare, Wifi, WifiOff } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/Card'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import ProposalsModal from '../components/proposals/ProposalsModal'
import { useRFPUpdates } from '../hooks/useRFPUpdates'
import { apiUrl } from '../config/api'

interface RFPItem {
  name: string
  specs?: string
  quantity?: number | string
}

interface RFP {
  _id: string
  originalDescription: string
  structuredData: {
    title?: string
    items?: RFPItem[] | string[]
    category?: string
    estimatedBudget?: string
    timeline?: string
  }
  status: string
  sentToVendors?: string[]
  vendorCount?: number
  vendors?: number
  responseCount?: number
  responses?: number
  responseStats?: {
    totalResponses: number
    totalVendorsContacted: number
    responseRate: number
  }
  createdAt: string
  updatedAt: string
}

const statusConfig: Record<string, {
  label: string
  icon: any
  color: string
}> = {
  active: {
    label: 'Active',
    icon: Clock,
    color: 'text-blue-600 bg-blue-50',
  },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50',
  },
  sent: {
    label: 'Sent',
    icon: CheckCircle2,
    color: 'text-blue-600 bg-blue-50',
  },
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    color: 'text-amber-600 bg-amber-50',
  },
  draft: {
    label: 'Draft',
    icon: FileText,
    color: 'text-slate-600 bg-slate-50',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50',
  },
}

export default function ActiveRFPs() {
  const [rfps, setRfps] = useState<RFP[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completingRfpId, setCompletingRfpId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
  })
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
    isVisible: boolean
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  })
  const [selectedRfp, setSelectedRfp] = useState<{
    id: string
    title: string
  } | null>(null)

  // WebSocket hook for real-time RFP updates
  const { isConnected, rfpUpdates, updateCounter } = useRFPUpdates()

  useEffect(() => {
    fetchRFPs()
  }, [])

  const fetchRFPs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/api/rfps/active'))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RFPs: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log('Fetched Active RFPs Response:', responseData)
      
      // Extract the data array from the response
      const rfpsArray: RFP[] = responseData.data || []
      console.log('RFPs Array:', rfpsArray)
      console.log('RFPs Count:', rfpsArray.length)

      setRfps(rfpsArray)

      // Calculate stats
      const total = rfpsArray.length
      const active = rfpsArray.filter((r: RFP) => 
        r.status === 'active' || r.status === 'published' || r.status === 'sent'
      ).length
      const pending = rfpsArray.filter((r: RFP) => 
        r.status === 'pending' || r.status === 'draft'
      ).length
      const completed = rfpsArray.filter((r: RFP) => 
        r.status === 'completed'
      ).length

      setStats({ total, active, pending, completed })

    } catch (error) {
      console.error('Error fetching RFPs:', error)
      setToast({
        message: 'Failed to load RFPs. Please refresh the page.',
        type: 'error',
        isVisible: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  const handleViewProposals = (rfpId: string, title: string) => {
    setSelectedRfp({ id: rfpId, title })
  }

  const closeProposalsModal = () => {
    setSelectedRfp(null)
  }

  const handleMarkAsCompleted = async (rfpId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to mark "${title}" as completed?`)) {
      return
    }

    setCompletingRfpId(rfpId)
    try {
      const response = await fetch(
        apiUrl(`/api/proposals/rfp/${rfpId}`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'completed' }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to mark RFP as completed')
      }

      // Update local state
      setRfps((prevRfps) =>
        prevRfps.map((rfp) =>
          rfp._id === rfpId ? { ...rfp, status: 'completed' } : rfp
        )
      )

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        active: prevStats.active - 1,
        completed: prevStats.completed + 1,
      }))

      setToast({
        message: 'RFP marked as completed successfully!',
        type: 'success',
        isVisible: true,
      })
    } catch (error) {
      console.error('Error marking RFP as completed:', error)
      setToast({
        message: 'Failed to mark RFP as completed. Please try again.',
        type: 'error',
        isVisible: true,
      })
    } finally {
      setCompletingRfpId(null)
    }
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Update RFPs when WebSocket receives updates
  useEffect(() => {
    if (updateCounter > 0 && rfpUpdates.size > 0) {
      setRfps((prevRfps) => {
        const updatedRfps = prevRfps.map((rfp) => {
          const stats = rfpUpdates.get(rfp._id)
          if (stats) {
            const oldCount = rfp.responseCount || 0
            const newCount = stats.totalResponses
            
            // Show toast notification if response count increased
            if (newCount > oldCount) {
              const title = rfp.structuredData?.title || 
                            rfp.originalDescription?.substring(0, 50) || 
                            'RFP'
              setToast({
                message: `New response received for "${title}" (${stats.totalResponses}/${stats.totalVendorsContacted} responses)`,
                type: 'success',
                isVisible: true,
              })
            }
            
            return {
              ...rfp,
              responseCount: stats.totalResponses,
              vendorCount: stats.totalVendorsContacted,
            }
          }
          return rfp
        })
        
        return updatedRfps
      })
    }
  }, [updateCounter, rfpUpdates])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Active RFPs
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Track your RFPs, vendor responses, and email communications
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total RFPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-3 text-sm text-slate-600">Loading RFPs...</span>
        </div>
      ) : rfps.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">No RFPs found. Create your first RFP to get started!</p>
        </div>
      ) : (
        /* RFP List */
        <div className="space-y-4">
          {rfps.map((rfp) => {
            const statusInfo = statusConfig[rfp.status?.toLowerCase()] || statusConfig.draft
            const StatusIcon = statusInfo.icon
            
            // Safely extract title
            let title = 'Untitled RFP'
            if (rfp.structuredData?.title) {
              title = rfp.structuredData.title
            } else if (rfp.originalDescription) {
              title = rfp.originalDescription.substring(0, 50) + '...'
            }
            
            const vendorCount = rfp.sentToVendors?.length || rfp.vendorCount || rfp.vendors || 0
            const responseCount = rfp.responseStats?.totalResponses || 0
            
            return (
              <Card key={rfp._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <CardDescription className="mt-2">
                        Created on {new Date(rfp.createdAt).toLocaleDateString()}
                        {rfp.structuredData?.timeline && ` • Timeline: ${rfp.structuredData.timeline}`}
                      </CardDescription>
                      {rfp.structuredData?.category && (
                        <CardDescription className="mt-1">
                          Category: {rfp.structuredData.category}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProposals(rfp._id, title)}
                      >
                        <MessageSquare className="mr-1.5 h-4 w-4" />
                        View Proposals
                      </Button>
                      
                      {rfp.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsCompleted(rfp._id, title)}
                          disabled={completingRfpId === rfp._id}
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          {completingRfpId === rfp._id ? (
                            <>
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              Marking...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Mark Completed
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8 text-sm">
                    <div>
                      <span className="text-slate-500">Vendors Invited:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {vendorCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Responses Received:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {responseCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Response Rate:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {vendorCount > 0 ? Math.round((responseCount / vendorCount) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  {rfp.structuredData?.estimatedBudget && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-500">Estimated Budget:</span>
                      <span className="ml-2 font-medium text-slate-900">
                        {rfp.structuredData.estimatedBudget}
                      </span>
                    </div>
                  )}
                  {rfp.structuredData?.items && rfp.structuredData.items.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-slate-500">Items:</span>
                      <ul className="mt-1 ml-4 list-disc text-sm text-slate-700">
                        {rfp.structuredData.items.slice(0, 3).map((item, idx) => {
                          // Handle both object and string formats
                          if (typeof item === 'string') {
                            return <li key={idx}>{item}</li>
                          } else if (typeof item === 'object' && item !== null) {
                            const itemObj = item as RFPItem
                            return (
                              <li key={idx}>
                                <strong>{itemObj.name}</strong>
                                {itemObj.quantity && ` (Qty: ${itemObj.quantity})`}
                                {itemObj.specs && ` - ${itemObj.specs}`}
                              </li>
                            )
                          }
                          return null
                        })}
                        {rfp.structuredData.items.length > 3 && (
                          <li className="text-slate-500">
                            +{rfp.structuredData.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      {/* Proposals Modal */}
      {selectedRfp && (
        <ProposalsModal
          isOpen={true}
          onClose={closeProposalsModal}
          rfpId={selectedRfp.id}
          rfpTitle={selectedRfp.title}
        />
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { FileText, Users, Calendar, Mail, Trash2, Loader2, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import { apiUrl } from '../config/api'

interface DraftItem {
  item: string
  quantity: number | string
  specifications?: string
}

interface Draft {
  _id: string
  originalDescription: string
  structuredData: {
    title?: string
    items?: DraftItem[]
    category?: string
    estimatedBudget?: string
    timeline?: string
  }
  selectedVendors: Array<{
    _id: string
    name: string
    email: string
    category: string
  }>
  createdAt: string
  updatedAt: string
}

export default function Drafts() {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sendingDraftId, setSendingDraftId] = useState<string | null>(null)
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
    isVisible: boolean
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  })

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(apiUrl('/api/rfps/drafts'))
      
      if (!response.ok) {
        throw new Error('Failed to fetch drafts')
      }

      const data = await response.json()
      console.log('Fetched drafts:', data)
      
      const draftsArray = data.data || []
      setDrafts(draftsArray)
    } catch (error) {
      console.error('Error fetching drafts:', error)
      setToast({
        message: 'Failed to load drafts. Please try again.',
        type: 'error',
        isVisible: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendDraft = async (draftId: string) => {
    setSendingDraftId(draftId)
    try {
      const draft = drafts.find(d => d._id === draftId)
      if (!draft) return

      const vendorIds = draft.selectedVendors.map(v => v._id)

      const response = await fetch(
        apiUrl(`/api/rfps/${draftId}/dispatch`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vendorIds }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send RFP')
      }

      setToast({
        message: `RFP sent successfully to ${vendorIds.length} vendor${vendorIds.length !== 1 ? 's' : ''}!`,
        type: 'success',
        isVisible: true,
      })

      // Refresh drafts list
      await fetchDrafts()
    } catch (error) {
      console.error('Error sending draft:', error)
      setToast({
        message: 'Failed to send RFP. Please try again.',
        type: 'error',
        isVisible: true,
      })
    } finally {
      setSendingDraftId(null)
    }
  }

  const handleDeleteDraft = async (draftId: string) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return
    }

    setDeletingDraftId(draftId)
    try {
      const response = await fetch(
        apiUrl(`/api/rfps/${draftId}`),
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }

      setToast({
        message: 'Draft deleted successfully',
        type: 'success',
        isVisible: true,
      })

      // Refresh drafts list
      await fetchDrafts()
    } catch (error) {
      console.error('Error deleting draft:', error)
      setToast({
        message: 'Failed to delete draft. Please try again.',
        type: 'error',
        isVisible: true,
      })
    } finally {
      setDeletingDraftId(null)
    }
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Draft RFPs
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Review and send your saved draft RFPs
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{drafts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Selected Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {drafts.reduce((acc, draft) => acc + draft.selectedVendors.length, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Ready to Send
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {drafts.filter(d => d.selectedVendors.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-3 text-sm text-slate-600">Loading drafts...</span>
        </div>
      ) : drafts.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">No drafts found. Save an RFP as draft to see it here!</p>
        </div>
      ) : (
        /* Drafts List */
        <div className="space-y-4">
          {drafts.map((draft) => {
            const title = draft.structuredData?.title || 
                         draft.originalDescription?.substring(0, 60) + '...' || 
                         'Untitled Draft'
            
            return (
              <Card key={draft._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <FileText className="h-3 w-3" />
                          Draft
                        </span>
                      </div>
                      <CardDescription className="mt-2">
                        Created on {new Date(draft.createdAt).toLocaleDateString()}
                        {draft.structuredData?.timeline && ` • Timeline: ${draft.structuredData.timeline}`}
                      </CardDescription>
                      {draft.structuredData?.category && (
                        <CardDescription className="mt-1">
                          Category: {draft.structuredData.category}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* RFP Details */}
                    {draft.structuredData?.items && draft.structuredData.items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-2">Items:</h4>
                        <ul className="ml-4 list-disc text-sm text-slate-700 space-y-1">
                          {draft.structuredData.items.slice(0, 3).map((item, idx) => (
                            <li key={idx}>
                              <strong>{typeof item === 'string' ? item : item.item}</strong>
                              {typeof item === 'object' && item.quantity && ` (Qty: ${item.quantity})`}
                              {typeof item === 'object' && item.specifications && ` - ${item.specifications}`}
                            </li>
                          ))}
                          {draft.structuredData.items.length > 3 && (
                            <li className="text-slate-500">
                              +{draft.structuredData.items.length - 3} more items
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {draft.structuredData?.estimatedBudget && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <span className="text-slate-500">Budget:</span>
                        <span className="font-medium text-slate-900">
                          {draft.structuredData.estimatedBudget}
                        </span>
                      </div>
                    )}

                    {/* Selected Vendors */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Selected Vendors ({draft.selectedVendors.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {draft.selectedVendors.map((vendor) => (
                          <div
                            key={vendor._id}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
                          >
                            <span className="font-medium text-slate-900">{vendor.name}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-600">{vendor.email}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleSendDraft(draft._id)}
                        disabled={sendingDraftId === draft._id || draft.selectedVendors.length === 0}
                        className="flex-1"
                      >
                        {sendingDraftId === draft._id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send to {draft.selectedVendors.length} Vendor{draft.selectedVendors.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDeleteDraft(draft._id)}
                        disabled={deletingDraftId === draft._id}
                        variant="outline"
                      >
                        {deletingDraftId === draft._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
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
    </div>
  )
}

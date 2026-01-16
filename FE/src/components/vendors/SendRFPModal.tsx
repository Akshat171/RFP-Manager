import { useState, useEffect } from 'react'
import { Loader2, Mail, FileText, Calendar, CheckCircle2 } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { apiUrl } from '../../config/api'

interface RFP {
  id: string
  title: string
  description: string
  createdAt: string
  status: string
}

interface SendRFPModalProps {
  isOpen: boolean
  onClose: () => void
  selectedVendorIds: string[]
  vendorCount: number
  onSuccess: () => void
}

export default function SendRFPModal({
  isOpen,
  onClose,
  selectedVendorIds,
  vendorCount,
  onSuccess,
}: SendRFPModalProps) {
  const [rfps, setRfps] = useState<RFP[]>([])
  const [selectedRFP, setSelectedRFP] = useState<string | null>(null)
  const [isLoadingRFPs, setIsLoadingRFPs] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch RFPs when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRFPs()
    }
  }, [isOpen])

  const fetchRFPs = async () => {
    setIsLoadingRFPs(true)
    setError(null)
    try {
      const response = await fetch(apiUrl('/api/rfps'))
      if (!response.ok) {
        throw new Error(`Failed to fetch RFPs: ${response.statusText}`)
      }
      const data = await response.json()
      setRfps(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFPs')
      console.error('Error fetching RFPs:', err)
    } finally {
      setIsLoadingRFPs(false)
    }
  }

  const handleSendRFP = async () => {
    if (!selectedRFP) return

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(
        apiUrl(`/api/rfps/${selectedRFP}/send`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vendorIds: selectedVendorIds }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to send RFP: ${response.statusText}`)
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send RFP')
      console.error('Error sending RFP:', err)
    } finally {
      setIsSending(false)
    }
  }

  const selectedRFPData = rfps.find((rfp) => rfp.id === selectedRFP)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send RFP to Vendors"
      description={`Select an RFP to send to ${vendorCount} selected vendor${
        vendorCount !== 1 ? 's' : ''
      }`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Loading State */}
        {isLoadingRFPs && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* RFP Selection */}
        {!isLoadingRFPs && rfps.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-900">
              Select RFP to Send
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rfps.map((rfp) => (
                <Card
                  key={rfp.id}
                  className={`cursor-pointer transition-all ${
                    selectedRFP === rfp.id
                      ? 'border-slate-900 ring-2 ring-slate-900'
                      : 'hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedRFP(rfp.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-600" />
                          {rfp.title}
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                          {rfp.description}
                        </p>
                      </div>
                      {selectedRFP === rfp.id && (
                        <CheckCircle2 className="h-5 w-5 text-slate-900" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(rfp.createdAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {rfp.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No RFPs State */}
        {!isLoadingRFPs && rfps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-slate-300" />
            <p className="mt-2 text-sm text-slate-600">
              No RFPs available. Create one first.
            </p>
          </div>
        )}

        {/* Preview Section */}
        {selectedRFPData && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-900">
              Summary Preview
            </h4>
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-medium">RFP:</span> {selectedRFPData.title}
              </p>
              <p>
                <span className="font-medium">Recipients:</span> {vendorCount}{' '}
                vendor{vendorCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-500">
                An email with the RFP details will be sent to all selected
                vendors.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 border-t border-slate-200 pt-4">
          <Button
            onClick={handleSendRFP}
            disabled={!selectedRFP || isSending}
            className="flex-1"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send to {vendorCount} Vendor{vendorCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}

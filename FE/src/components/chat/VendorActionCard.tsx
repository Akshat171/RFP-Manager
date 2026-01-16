import { useState } from 'react'
import { FileText, Mail, Loader2, CheckCircle2, Building2, Save } from 'lucide-react'
import { VendorActionData } from '../../types/chat'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'

interface VendorActionCardProps {
  actionData: VendorActionData
  onSendEmails: (selectedVendorIds: string[]) => Promise<void>
  onSaveDraft?: (selectedVendorIds: string[]) => Promise<void>
}

export default function VendorActionCard({
  actionData,
  onSendEmails,
  onSaveDraft,
}: VendorActionCardProps) {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isDraftSaved, setIsDraftSaved] = useState(false)

  const { rfpSummary, matchingVendors } = actionData

  const handleSelectAll = () => {
    if (selectedVendors.length === matchingVendors.length) {
      setSelectedVendors([])
    } else {
      setSelectedVendors(matchingVendors.map((v) => v.id))
    }
  }

  const handleSelectVendor = (vendorId: string) => {
    if (selectedVendors.includes(vendorId)) {
      setSelectedVendors(selectedVendors.filter((id) => id !== vendorId))
    } else {
      setSelectedVendors([...selectedVendors, vendorId])
    }
  }

  const handleSend = async () => {
    if (selectedVendors.length === 0) return

    setIsSending(true)
    try {
      await onSendEmails(selectedVendors)
      setIsSent(true)
    } catch (error) {
      console.error('Error sending emails:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleSaveDraft = async () => {
    if (selectedVendors.length === 0 || !onSaveDraft) return

    setIsSavingDraft(true)
    try {
      await onSaveDraft(selectedVendors)
      setIsDraftSaved(true)
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const allSelected = selectedVendors.length === matchingVendors.length

  return (
    <Card className="border-slate-300 bg-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-slate-700" />
          AI-Generated RFP Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RFP Summary Table */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
            <h4 className="text-sm font-semibold text-slate-900">
              {rfpSummary.title}
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Item
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Quantity
                  </th>
                  {rfpSummary.items.some((item) => item.specifications) && (
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Specifications
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rfpSummary.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-slate-900">{item.item}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {item.quantity}
                    </td>
                    {rfpSummary.items.some((i) => i.specifications) && (
                      <td className="px-4 py-2 text-slate-600">
                        {item.specifications || '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <span>
                <span className="font-medium">Category:</span>{' '}
                {rfpSummary.category}
              </span>
              {rfpSummary.estimatedBudget && (
                <span>
                  <span className="font-medium">Budget:</span>{' '}
                  {rfpSummary.estimatedBudget}
                </span>
              )}
              {rfpSummary.timeline && (
                <span>
                  <span className="font-medium">Timeline:</span>{' '}
                  {rfpSummary.timeline}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Selection */}
        {!isSent ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">
                Matching Vendors ({matchingVendors.length})
              </h4>
              <button
                onClick={handleSelectAll}
                className="text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2">
              {matchingVendors.map((vendor) => (
                <label
                  key={vendor.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
                >
                  <Checkbox
                    checked={selectedVendors.includes(vendor.id)}
                    onChange={() => handleSelectVendor(vendor.id)}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                      <Building2 className="h-4 w-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {vendor.name}
                      </p>
                      <p className="text-xs text-slate-500">{vendor.email}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                disabled={selectedVendors.length === 0 || isSending || isSavingDraft}
                className="flex-1"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending RFPs...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send ({selectedVendors.length})
                  </>
                )}
              </Button>
              
              {onSaveDraft && (
                <Button
                  onClick={handleSaveDraft}
                  disabled={selectedVendors.length === 0 || isSavingDraft || isSending}
                  variant="outline"
                  className="flex-1"
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ) : isDraftSaved ? (
          /* Draft Saved State */
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <Save className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-base font-semibold text-blue-900">
                  💾 Draft Saved Successfully!
                </p>
                <p className="mt-1 text-sm text-blue-700">
                  Your RFP draft has been saved with {selectedVendors.length} selected vendor{selectedVendors.length !== 1 ? 's' : ''}. 
                  View it in the Drafts tab to send it later.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-base font-semibold text-emerald-900">
                  ✅ Success! Emails sent to {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''}.
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  Your RFP has been dispatched successfully. Check the Active RFPs page to track responses.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

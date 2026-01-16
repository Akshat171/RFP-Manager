import { DollarSign, Calendar, Shield, Package, Mail, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { ProposalData } from '../../hooks/useProposalSocket'

interface ProposalCardProps {
  proposal: ProposalData
  isNew?: boolean
}

export default function ProposalCard({ proposal, isNew }: ProposalCardProps) {
  return (
    <Card className="relative">
      {isNew && (
        <div className="absolute -right-2 -top-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
          NEW
        </div>
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{proposal.vendorId.name}</CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-3.5 w-3.5" />
              {proposal.vendorId.email}
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {proposal.vendorId.category}
              </span>
              
              {/* Compliance Status Badge */}
              {proposal.complianceStatus && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    proposal.complianceStatus.fulfilled
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {proposal.complianceStatus.fulfilled ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Requirements Met
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Not Compliant
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Compliance Summary */}
        {proposal.complianceStatus && proposal.complianceStatus.summary && (
          <div className={`mb-4 rounded-lg border p-4 ${
            proposal.complianceStatus.fulfilled
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <h4 className={`text-sm font-semibold mb-2 ${
              proposal.complianceStatus.fulfilled
                ? 'text-emerald-900'
                : 'text-red-900'
            }`}>
              Compliance Assessment
            </h4>
            <p className={`text-sm ${
              proposal.complianceStatus.fulfilled
                ? 'text-emerald-700'
                : 'text-red-700'
            }`}>
              {proposal.complianceStatus.summary}
            </p>
            
            {/* Display reasons if not fulfilled */}
            {!proposal.complianceStatus.fulfilled && 
             proposal.complianceStatus.reasons && 
             proposal.complianceStatus.reasons.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-red-800 mb-1">Issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  {proposal.complianceStatus.reasons.map((reason, idx) => (
                    <li key={idx} className="text-xs text-red-700">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Extracted Data */}
        {proposal.extractedData && (
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-900">Proposal Details</h4>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {proposal.extractedData.totalPrice !== undefined && 
               proposal.extractedData.totalPrice !== null && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <div>
                    <div className="text-xs text-slate-500">Total Price</div>
                    <div className="font-semibold text-slate-900">
                      ${proposal.extractedData.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {proposal.extractedData.deliveryDate && 
               proposal.extractedData.deliveryDate !== null && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-slate-500">Delivery Date</div>
                    <div className="font-semibold text-slate-900">
                      {new Date(proposal.extractedData.deliveryDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}

              {proposal.extractedData.warrantyProvided && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <div>
                    <div className="text-xs text-slate-500">Warranty</div>
                    <div className="font-semibold text-slate-900">
                      {proposal.extractedData.warrantyProvided}
                    </div>
                  </div>
                </div>
              )}

              {proposal.extractedData.notes && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Package className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">Additional Notes</div>
                    <div className="text-sm text-slate-900">
                      {proposal.extractedData.notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Email Response - Collapsible */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
            View Full Email Response
          </summary>
          <div className="mt-3 rounded-lg bg-slate-50 p-4">
            <pre className="whitespace-pre-wrap text-xs text-slate-700">
              {proposal.vendorResponseEmail}
            </pre>
          </div>
        </details>

        {/* Timestamp */}
        <div className="mt-4 text-xs text-slate-500">
          Received: {new Date(proposal.receivedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}

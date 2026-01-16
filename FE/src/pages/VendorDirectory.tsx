import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Toast from '../components/ui/Toast'
import VendorTable, { Vendor } from '../components/vendors/VendorTable'
import FloatingActionBar from '../components/vendors/FloatingActionBar'
import SendRFPModal from '../components/vendors/SendRFPModal'
import AddVendorModal from '../components/vendors/AddVendorModal'
import { apiUrl } from '../config/api'

export default function VendorDirectory() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoadingVendors, setIsLoadingVendors] = useState(true)
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
    isVisible: boolean
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  })

  // Fetch vendors from API on mount
  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    setIsLoadingVendors(true)
    try {
      const response = await fetch(apiUrl('/api/vendors'))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vendors: ${response.statusText}`)
      }

      const response_data = await response.json()
      console.log('Fetched vendors response:', response_data) // Debug log
      
      // Handle different response formats
      let vendorsArray: Vendor[] = []
      
      if (Array.isArray(response_data)) {
        // Direct array format
        vendorsArray = response_data
      } else if (response_data.data && Array.isArray(response_data.data)) {
        // Nested data format: { data: [...] }
        vendorsArray = response_data.data
      } else {
        console.error('Unexpected API response format:', response_data)
        setVendors([])
        setToast({
          message: 'Invalid data format received from server.',
          type: 'error',
          isVisible: true,
        })
        return
      }

      // Map backend fields to frontend format if needed
      const mappedVendors = vendorsArray.map((vendor: any) => ({
        id: vendor._id || vendor.id,
        name: vendor.name,
        email: vendor.email,
        category: vendor.category,
        contactPerson: vendor.contactPerson,
      }))

      console.log('Mapped vendors:', mappedVendors)
      setVendors(mappedVendors)
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setVendors([]) // Ensure vendors is empty on error
      setToast({
        message: 'Failed to load vendors. Please refresh the page.',
        type: 'error',
        isVisible: true,
      })
    } finally {
      setIsLoadingVendors(false)
    }
  }

  const handleSendClick = () => {
    setIsSendModalOpen(true)
  }

  const handleAddVendorClick = () => {
    setIsAddModalOpen(true)
  }

  const handleClearSelection = () => {
    setSelectedVendors([])
  }

  const handleSendSuccess = () => {
    setToast({
      message: `RFP successfully sent to ${selectedVendors.length} vendor${
        selectedVendors.length !== 1 ? 's' : ''
      }!`,
      type: 'success',
      isVisible: true,
    })
    setSelectedVendors([])
  }

  const handleAddVendorSuccess = (newVendor: any) => {
    // Refresh the vendor list from API to get the latest data
    fetchVendors()
    
    setToast({
      message: `Vendor "${newVendor.name}" successfully added!`,
      type: 'success',
      isVisible: true,
    })
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Vendor Directory
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your vendor master data and send RFPs
          </p>
        </div>
        <Button onClick={handleAddVendorClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* Loading State */}
      {isLoadingVendors ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-3 text-sm text-slate-600">Loading vendors...</span>
        </div>
      ) : vendors.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-slate-600">No vendors found. Add your first vendor to get started!</p>
        </div>
      ) : (
        /* Vendor Table */
        <VendorTable
          vendors={vendors}
          selectedVendors={selectedVendors}
          onSelectionChange={setSelectedVendors}
        />
      )}

      {/* Floating Action Bar */}
      <FloatingActionBar
        selectedCount={selectedVendors.length}
        onSend={handleSendClick}
        onClear={handleClearSelection}
      />

      {/* Send RFP Modal */}
      <SendRFPModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        selectedVendorIds={selectedVendors}
        vendorCount={selectedVendors.length}
        onSuccess={handleSendSuccess}
      />

      {/* Add Vendor Modal */}
      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddVendorSuccess}
      />

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

import Modal from '../ui/Modal'
import AddVendorForm from './AddVendorForm'

interface AddVendorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (vendor: any) => void
}

export default function AddVendorModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVendorModalProps) {
  const handleSuccess = (vendor: any) => {
    onSuccess(vendor)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Vendor"
      description="Enter vendor details to add them to your directory"
      size="md"
    >
      <AddVendorForm onSuccess={handleSuccess} onCancel={onClose} />
    </Modal>
  )
}

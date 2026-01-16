import { useForm } from 'react-hook-form'
import { Loader2, Building2 } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { apiUrl } from '../../config/api'

interface AddVendorFormData {
  name: string
  email: string
  category: string
  contactPerson: string
}

interface AddVendorFormProps {
  onSuccess: (vendor: AddVendorFormData) => void
  onCancel?: () => void
}

const categories = [
  'Hardware',
  'Software',
  'Services',
  'Cloud Infrastructure',
  'Cybersecurity',
  'DevOps & Automation',
  'Mobile Development',
  'Web Development',
  'Analytics & BI',
  'Artificial Intelligence',
  'Database Solutions',
  'Quality Assurance',
  'Networking',
  'IT Consulting',
  'Other',
]

export default function AddVendorForm({
  onSuccess,
  onCancel,
}: AddVendorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<AddVendorFormData>({
    defaultValues: {
      name: '',
      email: '',
      category: '',
      contactPerson: '',
    },
  })

  const onSubmit = async (data: AddVendorFormData) => {
    try {
      const response = await fetch(apiUrl('/api/vendors'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle specific error codes
        if (response.status === 409) {
          throw new Error(
            errorData.message || 'A vendor with this email already exists. Please use a different email address.'
          )
        }
        
        throw new Error(
          errorData.message || `API Error: ${response.statusText}`
        )
      }

      const newVendor = await response.json()
      console.log('Vendor added successfully:', newVendor)
      reset() // Clear form
      onSuccess(newVendor)
    } catch (err) {
      console.error('Error adding vendor:', err)
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to add vendor',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Header Icon */}
      <div className="flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Building2 className="h-8 w-8 text-slate-600" />
        </div>
      </div>

      {/* Vendor Name */}
      <div className="space-y-2">
        <label
          htmlFor="vendor-name"
          className="block text-sm font-medium text-slate-900"
        >
          Vendor Name <span className="text-red-500">*</span>
        </label>
        <Input
          id="vendor-name"
          type="text"
          placeholder="e.g., Apple Authorized Reseller"
          disabled={isSubmitting}
          {...register('name', {
            required: 'Vendor name is required',
            minLength: {
              value: 2,
              message: 'Vendor name must be at least 2 characters',
            },
            maxLength: {
              value: 100,
              message: 'Vendor name must not exceed 100 characters',
            },
          })}
          className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.name && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="font-medium">Error:</span> {errors.name.message}
          </p>
        )}
      </div>

      {/* Contact Email */}
      <div className="space-y-2">
        <label
          htmlFor="vendor-email"
          className="block text-sm font-medium text-slate-900"
        >
          Contact Email <span className="text-red-500">*</span>
        </label>
        <Input
          id="vendor-email"
          type="email"
          placeholder="e.g., contact@vendor.com"
          disabled={isSubmitting}
          {...register('email', {
            required: 'Contact email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email format',
            },
          })}
          className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.email && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="font-medium">Error:</span> {errors.email.message}
          </p>
        )}
        <p className="text-xs text-slate-500">
          This email will receive RFP notifications
        </p>
      </div>

      {/* Contact Person */}
      <div className="space-y-2">
        <label
          htmlFor="contact-person"
          className="block text-sm font-medium text-slate-900"
        >
          Contact Person <span className="text-red-500">*</span>
        </label>
        <Input
          id="contact-person"
          type="text"
          placeholder="e.g., John Doe"
          disabled={isSubmitting}
          {...register('contactPerson', {
            required: 'Contact person name is required',
            minLength: {
              value: 2,
              message: 'Contact person name must be at least 2 characters',
            },
            maxLength: {
              value: 100,
              message: 'Contact person name must not exceed 100 characters',
            },
          })}
          className={errors.contactPerson ? 'border-red-500 focus:ring-red-500' : ''}
        />
        {errors.contactPerson && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="font-medium">Error:</span> {errors.contactPerson.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label
          htmlFor="vendor-category"
          className="block text-sm font-medium text-slate-900"
        >
          Category <span className="text-red-500">*</span>
        </label>
        <select
          id="vendor-category"
          disabled={isSubmitting}
          {...register('category', {
            required: 'Please select a category',
          })}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.category
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
          }`}
        >
          <option value="">Select a category...</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <span className="font-medium">Error:</span> {errors.category.message}
          </p>
        )}
      </div>

      {/* Root Error (API errors) */}
      {errors.root && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{errors.root.message}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 border-t border-slate-200 pt-6">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Vendor...
            </>
          ) : (
            <>
              <Building2 className="mr-2 h-4 w-4" />
              Add Vendor
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

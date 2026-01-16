import { useState, useMemo } from 'react'
import { Search, Building2 } from 'lucide-react'
import Checkbox from '../ui/Checkbox'
import Input from '../ui/Input'
import { Card } from '../ui/Card'

export interface Vendor {
  id: string
  name: string
  email: string
  category: string
}

interface VendorTableProps {
  vendors: Vendor[]
  selectedVendors: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

export default function VendorTable({
  vendors,
  selectedVendors,
  onSelectionChange,
}: VendorTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(vendors.map((v) => v.category)))
    return ['all', ...cats]
  }, [vendors])

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' || vendor.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [vendors, searchQuery, categoryFilter])

  const handleSelectAll = () => {
    if (selectedVendors.length === filteredVendors.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredVendors.map((v) => v.id))
    }
  }

  const handleSelectVendor = (vendorId: string) => {
    if (selectedVendors.includes(vendorId)) {
      onSelectionChange(selectedVendors.filter((id) => id !== vendorId))
    } else {
      onSelectionChange([...selectedVendors, vendorId])
    }
  }

  const allSelected =
    filteredVendors.length > 0 &&
    selectedVendors.length === filteredVendors.length

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search vendors by name, email, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">
              Category:
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Vendor Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-12 px-6 py-3 text-left">
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all vendors"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Vendor Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Category
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="h-12 w-12 text-slate-300" />
                      <p className="text-sm text-slate-500">
                        No vendors found matching your criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className={`transition-colors hover:bg-slate-50 ${
                      selectedVendors.includes(vendor.id) ? 'bg-slate-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => handleSelectVendor(vendor.id)}
                        aria-label={`Select ${vendor.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                          <Building2 className="h-5 w-5 text-slate-600" />
                        </div>
                        <span className="font-medium text-slate-900">
                          {vendor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {vendor.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        {vendor.category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredVendors.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-3 text-sm text-slate-600">
            Showing {filteredVendors.length} of {vendors.length} vendors
            {selectedVendors.length > 0 &&
              ` • ${selectedVendors.length} selected`}
          </div>
        )}
      </Card>
    </div>
  )
}

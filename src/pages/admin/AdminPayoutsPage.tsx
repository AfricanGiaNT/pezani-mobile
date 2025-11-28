import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@contexts/AuthContext'
import { Button } from '@/components/common'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

interface Payout {
  id: string
  transaction_id: string
  landlord_id: string
  amount: number
  payout_method: string
  payout_provider: string
  payout_account: string
  reference_number: string | null
  status: 'pending' | 'completed' | 'failed'
  processed_by: string | null
  processed_at: string | null
  notes: string | null
  created_at: string
  profiles: {
    full_name: string
    email: string
    phone: string
  }
  transactions: {
    viewing_request_id: string
    paychangu_reference: string
    viewing_requests: {
      property_id: string
      properties: {
        title: string
        location: string
      }
    }
  }
}

export default function AdminPayoutsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending')
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Verify admin access
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        toast.error('Access denied. Admin only.')
        navigate('/')
      }
    }

    checkAdmin()
  }, [user, navigate])

  // Fetch payouts
  const fetchPayouts = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('payouts')
        .select(`
          *,
          profiles:landlord_id (full_name, email, phone),
          transactions (
            viewing_request_id,
            paychangu_reference,
            viewing_requests (
              property_id,
              properties (
                title,
                location
              )
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setPayouts(data || [])
    } catch (error: any) {
      console.error('Error fetching payouts:', error)
      toast.error('Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayouts()
  }, [filter])

  // Mark payout as processed
  const handleMarkProcessed = async (payoutId: string) => {
    const referenceNumber = prompt('Enter payout reference number (e.g., transaction ID):')

    if (!referenceNumber) {
      toast.error('Reference number is required')
      return
    }

    const notes = prompt('Add any notes (optional):')

    try {
      setProcessingId(payoutId)

      const { error } = await supabase
        .from('payouts')
        .update({
          status: 'completed',
          reference_number: referenceNumber,
          notes: notes || null,
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
        })
        .eq('id', payoutId)

      if (error) throw error

      toast.success('Payout marked as processed')
      fetchPayouts()
    } catch (error: any) {
      console.error('Error processing payout:', error)
      toast.error('Failed to process payout')
    } finally {
      setProcessingId(null)
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const csvData = payouts.map((payout) => ({
        'Payout ID': payout.id,
        'Landlord Name': payout.profiles.full_name,
        'Landlord Email': payout.profiles.email,
        'Landlord Phone': payout.profiles.phone,
        'Amount (MWK)': payout.amount,
        'Payout Method': payout.payout_method,
        'Provider': payout.payout_provider,
        'Account Number': payout.payout_account,
        'Property': payout.transactions.viewing_requests.properties.title,
        'Location': payout.transactions.viewing_requests.properties.location,
        'Status': payout.status,
        'Reference Number': payout.reference_number || 'N/A',
        'Created At': new Date(payout.created_at).toLocaleString(),
        'Processed At': payout.processed_at ? new Date(payout.processed_at).toLocaleString() : 'N/A',
        'Notes': payout.notes || 'N/A',
      }))

      // Convert to CSV string
      const headers = Object.keys(csvData[0])
      const csvContent = [
        headers.join(','),
        ...csvData.map((row) =>
          headers.map((header) => JSON.stringify(row[header as keyof typeof row])).join(',')
        ),
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `payouts_${filter}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('CSV exported successfully')
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export CSV')
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payout Management</h1>
        <p className="text-gray-600">Manage and process payouts to landlords and agents</p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            onClick={() => setFilter('completed')}
          >
            Completed
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>

        <Button variant="outline" onClick={handleExportCSV} disabled={payouts.length === 0}>
          📊 Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-medium mb-1">Pending Payouts</p>
          <p className="text-2xl font-bold text-yellow-900">
            {payouts.filter((p) => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium mb-1">Completed Payouts</p>
          <p className="text-2xl font-bold text-green-900">
            {payouts.filter((p) => p.status === 'completed').length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium mb-1">Total Amount (Pending)</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(
              payouts
                .filter((p) => p.status === 'pending')
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Payouts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payouts...</p>
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No {filter !== 'all' ? filter : ''} payouts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payouts.map((payout) => (
            <div
              key={payout.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Landlord Info */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Landlord</p>
                  <p className="font-semibold text-gray-900">{payout.profiles.full_name}</p>
                  <p className="text-sm text-gray-600">{payout.profiles.email}</p>
                  <p className="text-sm text-gray-600">{payout.profiles.phone}</p>
                </div>

                {/* Property Info */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Property</p>
                  <p className="font-semibold text-gray-900">
                    {payout.transactions.viewing_requests.properties.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {payout.transactions.viewing_requests.properties.location}
                  </p>
                </div>

                {/* Payout Details */}
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payout Details</p>
                  <p className="font-bold text-lg text-primary">{formatCurrency(payout.amount)}</p>
                  <p className="text-sm text-gray-600">
                    {payout.payout_method === 'mobile_money' ? '📱' : '🏦'}{' '}
                    {payout.payout_provider}
                  </p>
                  <p className="text-sm text-gray-600 font-mono">{payout.payout_account}</p>
                  {payout.reference_number && (
                    <p className="text-xs text-gray-500 mt-1">Ref: {payout.reference_number}</p>
                  )}
                </div>

                {/* Status & Actions */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <div className="mb-3">
                    {payout.status === 'pending' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Pending
                      </span>
                    )}
                    {payout.status === 'completed' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✅ Completed
                      </span>
                    )}
                    {payout.status === 'failed' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ❌ Failed
                      </span>
                    )}
                  </div>

                  {payout.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkProcessed(payout.id)}
                      disabled={processingId === payout.id}
                    >
                      {processingId === payout.id ? 'Processing...' : 'Mark as Processed'}
                    </Button>
                  )}

                  {payout.processed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Processed: {new Date(payout.processed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {payout.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Notes:</p>
                  <p className="text-sm text-gray-700">{payout.notes}</p>
                </div>
              )}

              {/* Created Date */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created: {new Date(payout.created_at).toLocaleString()} • Transaction ID:{' '}
                  {payout.transactions.paychangu_reference}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


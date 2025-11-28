import React, { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/common'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface NoShowReportModalProps {
  isOpen: boolean
  onClose: () => void
  viewingRequest: any
  onSuccess: () => void
}

export const NoShowReportModal: React.FC<NoShowReportModalProps> = ({
  isOpen,
  onClose,
  viewingRequest,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleReportNoShow = async () => {
    if (!reason.trim()) {
      toast.error('Please provide details about the no-show')
      return
    }

    setIsProcessing(true)

    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          viewing_request_id: viewingRequest.id,
          refund_reason: reason,
          cancelled_by: 'landlord',
          dispute_type: 'tenant_no_show',
        },
      })

      if (error) throw error

      toast.success(
        'No-show claim submitted. Tenant has 24 hours to dispute.',
        { duration: 5000 }
      )
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error reporting no-show:', error)
      toast.error(error.message || 'Failed to report no-show')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle size={24} className="text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Report Tenant No-Show
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              What happens next?
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Tenant will be notified of the no-show claim</li>
              <li>They have 24 hours to dispute</li>
              <li>If no dispute, payment is released to you</li>
              <li>If disputed, admin will review and decide</li>
            </ul>
          </div>

          {/* Property Info */}
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">Property:</p>
            <p>{viewingRequest.properties?.title || 'Unknown Property'}</p>
            {viewingRequest.scheduled_date && (
              <>
                <p className="font-medium text-gray-900 mt-2">
                  Was scheduled for:
                </p>
                <p>{new Date(viewingRequest.scheduled_date).toLocaleString()}</p>
              </>
            )}
          </div>

          {/* Reason Input */}
          <div>
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Details of No-Show *
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Tenant didn't show up at scheduled time. I waited 15 minutes and tried calling but no response..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          {/* Warning */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm font-medium text-orange-900 mb-1">
              ⚠️ Important
            </p>
            <p className="text-sm text-orange-700">
              False no-show claims may result in penalties to your account. Only
              report genuine no-shows with accurate details.
            </p>
          </div>

          {/* Payment Amount */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 mb-1">
              Payment to be released:
            </p>
            <p className="text-2xl font-bold text-green-900">
              {(viewingRequest.transactions?.[0]?.amount || 0).toLocaleString()}{' '}
              MWK
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReportNoShow}
            disabled={isProcessing || !reason.trim()}
            fullWidth
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isProcessing ? 'Submitting...' : 'Report No-Show'}
          </Button>
        </div>
      </div>
    </div>
  )
}


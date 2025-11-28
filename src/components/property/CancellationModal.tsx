import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/common'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  viewingRequest: any
  userRole: 'tenant' | 'landlord'
  onSuccess: () => void
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  viewingRequest,
  userRole,
  onSuccess,
}) => {
  const [reason, setReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const calculateRefundInfo = () => {
    if (userRole === 'landlord') {
      return {
        refundPercent: 100,
        message: 'Tenant will receive 100% refund (Full refund)',
      }
    }

    // Tenant cancellation
    if (!viewingRequest.scheduled_date) {
      return {
        refundPercent: 100,
        message: 'You will receive 100% refund',
      }
    }

    const scheduledDate = new Date(viewingRequest.scheduled_date)
    const now = new Date()
    const hoursUntil = (scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntil > 24) {
      return {
        refundPercent: 100,
        message: 'You will receive 100% refund (>24 hours notice)',
      }
    } else if (hoursUntil > 0) {
      return {
        refundPercent: 50,
        message: 'You will receive 50% refund (<24 hours notice)',
      }
    } else {
      return {
        refundPercent: 0,
        message: 'No refund (after scheduled viewing time)',
      }
    }
  }

  const refundInfo = calculateRefundInfo()

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }

    setIsProcessing(true)

    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          viewing_request_id: viewingRequest.id,
          refund_reason: reason,
          cancelled_by: userRole,
        },
      })

      if (error) throw error

      toast.success(
        `Viewing cancelled. Refund: ${data.refund_amount.toLocaleString()} MWK`
      )
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error cancelling viewing:', error)
      toast.error(error.message || 'Failed to cancel viewing')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Cancel Viewing Request
          </h2>
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
          {/* Refund Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Refund Policy
            </p>
            <p className="text-sm text-blue-700">{refundInfo.message}</p>
            <p className="text-lg font-bold text-blue-900 mt-2">
              {refundInfo.refundPercent}% Refund (
              {((viewingRequest.transactions?.[0]?.amount || 0) * refundInfo.refundPercent / 100).toLocaleString()} MWK)
            </p>
          </div>

          {/* Property Info */}
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">Property:</p>
            <p>{viewingRequest.properties?.title || 'Unknown Property'}</p>
            {viewingRequest.scheduled_date && (
              <>
                <p className="font-medium text-gray-900 mt-2">Scheduled for:</p>
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
              Reason for Cancellation *
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for cancelling this viewing..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
          </div>

          {/* Warning */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              ⚠️ This action cannot be undone. The viewing request will be cancelled
              and refund will be processed according to the policy.
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
            Keep Viewing
          </Button>
          <Button
            variant="primary"
            onClick={handleCancel}
            disabled={isProcessing || !reason.trim()}
            fullWidth
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? 'Cancelling...' : 'Cancel Viewing'}
          </Button>
        </div>
      </div>
    </div>
  )
}


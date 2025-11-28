import React, { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/common'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface DisputeNoShowModalProps {
  isOpen: boolean
  onClose: () => void
  viewingRequest: any
  onSuccess: () => void
}

export const DisputeNoShowModal: React.FC<DisputeNoShowModalProps> = ({
  isOpen,
  onClose,
  viewingRequest,
  onSuccess,
}) => {
  const [evidence, setEvidence] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const getTimeRemaining = () => {
    if (!viewingRequest.dispute_deadline) return 'No deadline set'
    
    const deadline = new Date(viewingRequest.dispute_deadline)
    const now = new Date()
    const hoursLeft = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursLeft < 1) {
      const minutesLeft = Math.floor(hoursLeft * 60)
      return `${minutesLeft} minutes remaining`
    }
    
    return `${Math.floor(hoursLeft)} hours remaining`
  }

  const handleDispute = async () => {
    if (!evidence.trim()) {
      toast.error('Please provide evidence for your dispute')
      return
    }

    setIsProcessing(true)

    try {
      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: {
          viewing_request_id: viewingRequest.id,
          refund_reason: evidence,
          cancelled_by: 'tenant',
          dispute_type: 'tenant_dispute_no_show',
        },
      })

      if (error) throw error

      toast.success(
        'Dispute submitted successfully. Admin will review and contact you.',
        { duration: 5000 }
      )
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error submitting dispute:', error)
      toast.error(error.message || 'Failed to submit dispute')
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
            <AlertCircle size={24} className="text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Dispute No-Show Claim
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
          {/* Time Remaining */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900 mb-1">
              ⏰ Dispute Deadline
            </p>
            <p className="text-lg font-bold text-red-700">
              {getTimeRemaining()}
            </p>
          </div>

          {/* Landlord's Claim */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900 mb-2">
              Landlord's Claim:
            </p>
            <p className="text-sm text-gray-700">
              {viewingRequest.cancellation_reason || 'Tenant did not show up for scheduled viewing'}
            </p>
          </div>

          {/* What Happens Next */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              What happens after you dispute?
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Your dispute will be reviewed by an admin</li>
              <li>Both you and landlord may be contacted for details</li>
              <li>Decision will be made within 2-3 business days</li>
              <li>Refund will be processed based on admin decision</li>
            </ul>
          </div>

          {/* Property Info */}
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">Property:</p>
            <p>{viewingRequest.properties?.title || 'Unknown Property'}</p>
            {viewingRequest.scheduled_date && (
              <>
                <p className="font-medium text-gray-900 mt-2">
                  Scheduled Date:
                </p>
                <p>{new Date(viewingRequest.scheduled_date).toLocaleString()}</p>
              </>
            )}
          </div>

          {/* Evidence Input */}
          <div>
            <label
              htmlFor="evidence"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Evidence/Explanation *
            </label>
            <textarea
              id="evidence"
              rows={5}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Please provide detailed evidence that you attended or attempted to attend the viewing. Include:
- What time you arrived
- Any communication with landlord
- Photos/screenshots if available
- Any witnesses"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <p className="mt-1 text-xs text-gray-500">
              Be as detailed as possible. Strong evidence increases chances of refund.
            </p>
          </div>

          {/* Amount at Stake */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 mb-1">
              Amount at stake:
            </p>
            <p className="text-2xl font-bold text-yellow-900">
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
            onClick={handleDispute}
            disabled={isProcessing || !evidence.trim()}
            fullWidth
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </div>
      </div>
    </div>
  )
}


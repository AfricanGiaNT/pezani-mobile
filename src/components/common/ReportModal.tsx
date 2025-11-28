import { useState } from 'react'
import toast from 'react-hot-toast'
import { Flag } from 'lucide-react'
import { Modal, Button } from '@components/common'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedType: 'property' | 'user'
  reportedId: string
}

const reportReasons = [
  { value: 'fake_listing', label: 'Fake Listing' },
  { value: 'wrong_information', label: 'Wrong Information' },
  { value: 'scam_fraud', label: 'Scam/Fraud' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'unavailable_property', label: 'Property Not Available' },
  { value: 'other', label: 'Other' },
]

const ReportModal = ({ isOpen, onClose, reportedType, reportedId }: ReportModalProps) => {
  const { user } = useAuth()
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to report')
      onClose()
      return
    }

    if (!reason) {
      toast.error('Please select a reason')
      return
    }

    setIsSubmitting(true)

    try {
      // Check for duplicate report
      const { data: existing } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', user.id)
        .eq('reported_type', reportedType)
        .eq(`reported_${reportedType}_id`, reportedId)
        .maybeSingle()

      if (existing) {
        toast.error('You have already reported this. We will review it shortly.')
        onClose()
        return
      }

      // Create report
      const reportData: any = {
        reporter_id: user.id,
        reported_type: reportedType,
        reason,
        description: details || null,
        status: 'pending',
      }

      // Set the appropriate ID field based on type
      if (reportedType === 'property') {
        reportData.reported_property_id = reportedId
      } else {
        reportData.reported_user_id = reportedId
      }

      const { error } = await supabase.from('reports').insert(reportData)

      if (error) throw error

      toast.success('Report submitted. Thank you for helping keep our platform safe.')
      
      // Reset form and close
      setReason('')
      setDetails('')
      onClose()
    } catch (error: any) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('')
      setDetails('')
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Report ${reportedType === 'property' ? 'Property' : 'User'}`}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-text-light text-sm">
          Help us keep the platform safe by reporting any issues. All reports are reviewed by our
          team.
        </p>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Reason for Report *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
              reason
                ? 'border-gray-300 focus:border-primary focus:ring-primary'
                : 'border-gray-300 focus:border-primary focus:ring-primary'
            }`}
          >
            <option value="">Select reason...</option>
            {reportReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Additional Details (Optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Please provide any additional information that might help us review this report..."
            rows={4}
            disabled={isSubmitting}
            className="block w-full rounded-lg border border-gray-300 transition-all focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary px-4 py-2.5 text-base bg-surface text-text"
          />
          <p className="mt-1.5 text-sm text-text-light">
            {details.length} / 500 characters
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            isLoading={isSubmitting}
            leftIcon={<Flag size={18} />}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ReportModal


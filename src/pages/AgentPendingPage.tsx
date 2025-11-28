import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@components/common'
import { useAuth } from '@contexts/AuthContext'
import { formatDate } from '@utils/formatting'

const AgentPendingPage = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  // Redirect if not agent or not pending
  useEffect(() => {
    if (profile) {
      if (profile.role !== 'agent') {
        navigate('/dashboard')
      } else if (profile.status !== 'pending') {
        // If agent is approved or rejected, redirect to dashboard
        navigate('/dashboard')
      }
    }
  }, [profile, navigate])

  if (!user || profile?.role !== 'agent' || profile?.status !== 'pending') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-surface rounded-lg shadow-lg p-8 md:p-12 text-center"
      >
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <Clock size={48} className="text-yellow-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text mb-4">Application Under Review</h1>

        {/* Message */}
        <p className="text-lg text-text-light mb-6">
          Your agent application is currently being reviewed by our team. You will receive an
          email notification once your application is approved.
        </p>

        {/* Submission Date */}
        {user.created_at && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-text-light mb-1">Application Submitted</p>
            <p className="text-base font-medium text-text">{formatDate(user.created_at)}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-text-light mb-2">Questions about your application?</p>
          <a
            href="mailto:support@pezani.com"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
          >
            <Mail size={18} />
            support@pezani.com
          </a>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft size={18} />}
          >
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default AgentPendingPage


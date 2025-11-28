import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Mail, Phone, Calendar, Loader2 } from 'lucide-react'
import { Button, Modal } from '@components/common'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'
import { formatDate, formatPhone } from '@utils/formatting'

interface PendingAgent {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: string
  status: string
  created_at: string
}

const AgentApprovalPage = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([])
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [agentToReject, setAgentToReject] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (profile) {
      if (profile.role !== 'admin') {
        toast.error('Access denied. Admin only.')
        navigate('/dashboard')
      }
    }
  }, [profile, navigate])

  // Fetch pending agents
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchPendingAgents()
    }
  }, [user, profile])

  const fetchPendingAgents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (error) throw error

      setPendingAgents((data || []) as PendingAgent[])
    } catch (error: any) {
      console.error('Error fetching pending agents:', error)
      toast.error('Failed to load pending agents')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (agentId: string) => {
    if (!user) return

    setIsProcessing(true)

    try {
      // 1. Update status to active
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', agentId)
        .eq('role', 'agent')

      if (error) throw error

      // 2. Send welcome email via Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-agent-email', {
          body: { agentId, approved: true }
        })
        if (emailError) {
          console.error('Failed to send approval email:', emailError)
          // Don't fail the approval if email fails
        }
      } catch (emailErr) {
        console.error('Error sending approval email:', emailErr)
        // Don't fail the approval if email fails
      }

      toast.success('Agent approved successfully')
      
      // Refresh list
      await fetchPendingAgents()
    } catch (error: any) {
      console.error('Error approving agent:', error)
      toast.error('Failed to approve agent')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectClick = (agentId: string) => {
    setAgentToReject(agentId)
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!user || !agentToReject || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setIsProcessing(true)

    try {
      // 1. Update status to rejected
      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'rejected',
        })
        .eq('id', agentToReject)
        .eq('role', 'agent')

      if (error) throw error

      // 2. Send rejection email via Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-agent-email', {
          body: { 
            agentId: agentToReject, 
            approved: false, 
            rejectionReason: rejectionReason 
          }
        })
        if (emailError) {
          console.error('Failed to send rejection email:', emailError)
          // Don't fail the rejection if email fails
        }
      } catch (emailErr) {
        console.error('Error sending rejection email:', emailErr)
        // Don't fail the rejection if email fails
      }

      toast.success('Agent application rejected')
      
      // Close modal and refresh list
      setRejectModalOpen(false)
      setAgentToReject(null)
      setRejectionReason('')
      await fetchPendingAgents()
    } catch (error: any) {
      console.error('Error rejecting agent:', error)
      toast.error('Failed to reject agent application')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectCancel = () => {
    setRejectModalOpen(false)
    setAgentToReject(null)
    setRejectionReason('')
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text mb-2">Pending Agent Applications</h1>
        <p className="text-text-light">
          Review and approve or reject agent applications
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : pendingAgents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200"
        >
          <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-text mb-2">No Pending Applications</h3>
          <p className="text-text-light">
            All agent applications have been reviewed.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pendingAgents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Agent Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-text mb-2">
                    {agent.full_name || 'No name provided'}
                  </h3>
                  <div className="space-y-1 text-sm text-text-light">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{agent.email}</span>
                    </div>
                    {agent.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{formatPhone(agent.phone)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Applied: {formatDate(agent.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleApprove(agent.id)}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    leftIcon={<CheckCircle2 size={18} />}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRejectClick(agent.id)}
                    disabled={isProcessing}
                    leftIcon={<XCircle size={18} />}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={handleRejectCancel}
        title="Reject Agent Application"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text">
            Please provide a reason for rejecting this agent application. This reason will be
            sent to the applicant via email.
          </p>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Rejection Reason *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Insufficient documentation, does not meet requirements..."
              rows={4}
              className="block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2.5 text-base bg-surface text-text"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={handleRejectCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectConfirm}
              disabled={isProcessing || !rejectionReason.trim()}
              isLoading={isProcessing}
              leftIcon={<XCircle size={18} />}
            >
              {isProcessing ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AgentApprovalPage


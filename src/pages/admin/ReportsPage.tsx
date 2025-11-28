import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  FileText,
  EyeOff,
  X,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@components/common'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'
import { formatDate } from '@utils/formatting'

interface Report {
  id: string
  reporter_id: string
  reported_type: 'property' | 'user'
  reported_property_id: string | null
  reported_user_id: string | null
  reason: string
  description: string | null
  status: 'pending' | 'resolved' | 'dismissed'
  created_at: string
  reporter: {
    full_name: string
    email: string
  } | null
  property: {
    id: string
    title: string
    location: string
  } | null
  reported_user: {
    full_name: string
    email: string
  } | null
}

const reportReasonLabels: Record<string, string> = {
  fake_listing: 'Fake Listing',
  wrong_information: 'Wrong Information',
  scam_fraud: 'Scam/Fraud',
  inappropriate_content: 'Inappropriate Content',
  unavailable_property: 'Property Not Available',
  other: 'Other',
}

const ReportsPage = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Check admin authorization
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      toast.error('Access denied. Admin only.')
      navigate('/dashboard')
    }
  }, [profile, navigate])

  // Fetch reports
  useEffect(() => {
    if (profile?.role !== 'admin') return

    const fetchReports = async () => {
      try {
        setLoading(true)

        let query = supabase
          .from('reports')
          .select(
            `
            *,
            reporter:profiles!reporter_id (full_name, email),
            property:properties!reported_property_id (id, title, location),
            reported_user:profiles!reported_user_id (full_name, email)
          `
          )
          .order('created_at', { ascending: false })

        // Apply filter
        if (filter !== 'all') {
          query = query.eq('status', filter)
        }

        const { data, error } = await query

        if (error) throw error

        setReports(data || [])
      } catch (error: any) {
        console.error('Error fetching reports:', error)
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [filter, profile])

  const handleHideListing = async (reportId: string, propertyId: string) => {
    if (!propertyId) {
      toast.error('Property ID not found')
      return
    }

    setActionLoading(reportId)

    try {
      // 1. Hide property by setting status to unavailable
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'unavailable' })
        .eq('id', propertyId)

      if (propertyError) throw propertyError

      // 2. Resolve report
      const { error: reportError } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId)

      if (reportError) throw reportError

      toast.success('Property marked as unavailable and report resolved')
      
      // Update local state
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' as const } : r))
      )
    } catch (error: any) {
      console.error('Error hiding listing:', error)
      toast.error('Failed to hide listing')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDismiss = async (reportId: string) => {
    setActionLoading(reportId)

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'dismissed' })
        .eq('id', reportId)

      if (error) throw error

      toast.success('Report dismissed')
      
      // Update local state
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' as const } : r))
      )
    } catch (error: any) {
      console.error('Error dismissing report:', error)
      toast.error('Failed to dismiss report')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} />
            Pending
          </span>
        )
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 size={12} />
            Resolved
          </span>
        )
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <X size={12} />
            Dismissed
          </span>
        )
      default:
        return null
    }
  }

  if (profile?.role !== 'admin') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container-custom max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">User Reports</h1>
          <p className="text-text-light">Review and manage property and user reports</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {(['pending', 'resolved', 'dismissed', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                filter === status
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-light hover:text-text'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                  {reports.filter((r) => r.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-surface rounded-lg shadow-md p-12 text-center">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">No Reports Found</h3>
            <p className="text-text-light">
              {filter === 'all'
                ? 'No reports have been submitted yet.'
                : `No ${filter} reports found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-surface rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text">
                        {reportReasonLabels[report.reason] || report.reason}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    {report.description && (
                      <p className="text-sm text-text-light mb-4">{report.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-text-light">Reported by:</span>
                    <span className="ml-2 font-medium text-text">
                      {report.reporter?.full_name || 'Unknown User'}
                    </span>
                    <span className="ml-2 text-text-light">
                      ({report.reporter?.email || 'No email'})
                    </span>
                  </div>
                  <div>
                    <span className="text-text-light">Date:</span>
                    <span className="ml-2 font-medium text-text">
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                  {report.reported_type === 'property' && report.property && (
                    <div className="md:col-span-2">
                      <span className="text-text-light">Property:</span>
                      <span className="ml-2 font-medium text-text">
                        {report.property.title} - {report.property.location}
                      </span>
                    </div>
                  )}
                  {report.reported_type === 'user' && report.reported_user && (
                    <div className="md:col-span-2">
                      <span className="text-text-light">Reported User:</span>
                      <span className="ml-2 font-medium text-text">
                        {report.reported_user.full_name} ({report.reported_user.email})
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {report.status === 'pending' && (
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {report.reported_type === 'property' && report.reported_property_id && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(`/properties/${report.reported_property_id}`, '_blank')
                          }
                          leftIcon={<ExternalLink size={14} />}
                        >
                          View Property
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            handleHideListing(report.id, report.reported_property_id!)
                          }
                          disabled={actionLoading === report.id}
                          isLoading={actionLoading === report.id}
                          leftIcon={<EyeOff size={14} />}
                        >
                          Hide Listing
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismiss(report.id)}
                      disabled={actionLoading === report.id}
                      isLoading={actionLoading === report.id}
                      leftIcon={<X size={14} />}
                    >
                      Dismiss Report
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage


import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  Bookmark, 
  Eye, 
  CheckCircle2, 
  Search, 
  Building2,
  Loader2,
  Calendar,
  X,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react'
import { Button, Modal } from '@components/common'
import PropertyCard from '@components/property/PropertyCard'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'
import { formatDate, formatDateTime, formatPhone } from '@utils/formatting'

interface SavedProperty {
  id: string
  created_at: string
  properties: {
    id: string
    title: string
    description: string
    location: string
    price: number
    viewing_fee: number
    bedrooms: number
    bathrooms: number
    property_type: string
    amenities: string[]
    status: string
    view_count: number
    save_count: number
    created_at: string
    property_images: Array<{
      image_url: string
      is_primary: boolean
      display_order: number
    }>
  }
}

const TenantDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])
  const [stats, setStats] = useState({
    savedCount: 0,
    pendingViewings: 0,
    completedViewings: 0,
  })
  const [viewingRequests, setViewingRequests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'scheduled' | 'completed'>('all')
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  
  // Limit saved properties preview on dashboard
  const SAVED_PROPERTIES_PREVIEW_LIMIT = 4

  // Redirect if not tenant
  useEffect(() => {
    if (profile && profile.role !== 'tenant') {
      navigate('/dashboard')
    }
  }, [profile, navigate])

  // Fetch saved properties and stats
  useEffect(() => {
    if (authLoading) {
      // Wait for auth to finish loading
      setLoading(true)
      return
    }

    if (user && profile?.role === 'tenant') {
      fetchSavedProperties()
      fetchStats()
      fetchViewingRequests()
    } else if (user && !profile) {
      // User exists but profile not loaded yet - wait
      setLoading(true)
    } else if (user && profile && profile.role !== 'tenant') {
      // User exists but is not a tenant - will redirect, stop loading
      setLoading(false)
    } else if (!user) {
      // No user - not loading data
      setLoading(false)
    }
  }, [user, profile, authLoading])

  const fetchSavedProperties = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('saved_properties')
        .select(`
          id,
          created_at,
          properties (
            *,
            property_images (
              image_url,
              is_primary,
              display_order
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match PropertyCard format
      const transformed = (data || []).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        properties: item.properties,
      }))

      setSavedProperties(transformed)
    } catch (error: any) {
      console.error('Error fetching saved properties:', error)
      toast.error('Failed to load saved properties')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      // Count saved properties
      const { count: savedCount } = await supabase
        .from('saved_properties')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Count viewing requests
      const { count: pendingCount } = await supabase
        .from('viewing_requests')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        .in('status', ['pending', 'scheduled'])

      const { count: completedCount } = await supabase
        .from('viewing_requests')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user.id)
        .eq('status', 'completed')

      setStats({
        savedCount: savedCount || 0,
        pendingViewings: pendingCount || 0,
        completedViewings: completedCount || 0,
      })
    } catch (error: any) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchViewingRequests = async () => {
    if (!user) return

    try {
      setLoadingRequests(true)
      const { data, error } = await supabase
        .from('viewing_requests')
        .select(`
          id,
          property_id,
          landlord_id,
          status,
          preferred_dates,
          scheduled_date,
          tenant_confirmed,
          landlord_confirmed,
          notes,
          created_at,
          updated_at,
          properties (
            id,
            title,
            location,
            viewing_fee,
            property_images (
              image_url,
              is_primary,
              display_order
            )
          ),
          landlord:profiles!landlord_id (
            id,
            full_name,
            email,
            phone
          ),
          transactions (
            id,
            payment_status,
            escrow_status,
            amount
          )
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setViewingRequests(data || [])
    } catch (error: any) {
      console.error('Error fetching viewing requests:', error)
      toast.error('Failed to load viewing requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleCancelClick = (requestId: string) => {
    setRequestToCancel(requestId)
    setCancelModalOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!user || !requestToCancel) return

    setIsCancelling(true)
    try {
      const { error } = await supabase
        .from('viewing_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestToCancel)
        .eq('tenant_id', user.id)

      if (error) throw error

      toast.success('Viewing request cancelled')
      await fetchViewingRequests()
      await fetchStats()
      setCancelModalOpen(false)
      setRequestToCancel(null)
    } catch (error: any) {
      console.error('Error cancelling viewing request:', error)
      toast.error('Failed to cancel viewing request')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleConfirmViewing = async (requestId: string) => {
    if (!user) return

    try {
      // Update tenant confirmation
      const { data: updatedRequest, error: updateError } = await supabase
        .from('viewing_requests')
        .update({ tenant_confirmed: true })
        .eq('id', requestId)
        .eq('tenant_id', user.id)
        .select('landlord_confirmed')
        .single()

      if (updateError) throw updateError

      // If both parties have confirmed, release payment
      if (updatedRequest?.landlord_confirmed) {
        const { error: releaseError } = await supabase.functions.invoke('release-payment', {
          body: { viewing_request_id: requestId }
        })

        if (releaseError) {
          console.error('Error releasing payment:', releaseError)
          // Don't fail the confirmation if release fails - can be retried
          toast.success('Viewing confirmed. Payment release may take a moment.')
        } else {
          toast.success('Viewing confirmed! Payment has been released.')
        }
      } else {
        toast.success('Viewing confirmed. Waiting for landlord confirmation.')
      }

      await fetchViewingRequests()
      await fetchStats()
    } catch (error: any) {
      console.error('Error confirming viewing:', error)
      toast.error('Failed to confirm viewing')
    }
  }

  const getFilteredRequests = () => {
    if (activeTab === 'all') return viewingRequests
    if (activeTab === 'pending') return viewingRequests.filter(r => r.status === 'pending')
    if (activeTab === 'scheduled') return viewingRequests.filter(r => r.status === 'scheduled')
    if (activeTab === 'completed') return viewingRequests.filter(r => r.status === 'completed')
    return viewingRequests
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getPrimaryImage = (property: any) => {
    if (!property?.property_images) return ''
    const primaryImage = property.property_images.find((img: any) => img.is_primary)
    return primaryImage?.image_url || property.property_images[0]?.image_url || ''
  }

  const handleUnsave = async (propertyId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)

      if (error) throw error

      // Remove from local state
      setSavedProperties((prev) =>
        prev.filter((item) => item.properties.id !== propertyId)
      )

      // Update stats
      setStats((prev) => ({
        ...prev,
        savedCount: prev.savedCount - 1,
      }))

      toast.success('Property unsaved')
    } catch (error: any) {
      console.error('Error unsaving property:', error)
      toast.error('Failed to unsave property')
    }
  }

  // Convert saved properties to PropertyCard format
  const convertedProperties = savedProperties.map((item) => ({
    id: item.properties.id,
    title: item.properties.title,
    location: item.properties.location,
    price: item.properties.price,
    viewing_fee: item.properties.viewing_fee,
    bedrooms: item.properties.bedrooms,
    bathrooms: item.properties.bathrooms,
    property_type: item.properties.property_type as any,
    status: item.properties.status as 'available' | 'unavailable',
    images: item.properties.property_images
      ?.sort((a, b) => {
        // Primary image first, then by display_order
        if (a.is_primary) return -1
        if (b.is_primary) return 1
        return a.display_order - b.display_order
      })
      .map((img) => img.image_url) || [],
    description: item.properties.description,
    amenities: item.properties.amenities || [],
    view_count: item.properties.view_count || 0,
    save_count: item.properties.save_count || 0,
    created_at: item.properties.created_at,
  }))

  // Show loading if auth is still loading or if we're waiting for profile
  if (authLoading || (user && !profile)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Redirect if user exists but is not a tenant
  if (user && profile?.role !== 'tenant') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text mb-6">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-light text-sm mb-1">Saved Properties</p>
              <p className="text-3xl font-bold text-text">{stats.savedCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Bookmark size={24} className="text-primary" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-light text-sm mb-1">Pending Viewings</p>
              <p className="text-3xl font-bold text-text">{stats.pendingViewings}</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Eye size={24} className="text-accent" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-light text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold text-text">{stats.completedViewings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={24} className="text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/browse')}
          leftIcon={<Search size={18} />}
        >
          Browse Properties
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/browse')}
          leftIcon={<Building2 size={18} />}
        >
          Search
        </Button>
      </div>

      {/* Saved Properties Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-text">Saved Properties</h2>
          {convertedProperties.length > SAVED_PROPERTIES_PREVIEW_LIMIT && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/saved-properties')}
              className="text-primary"
            >
              View All ({convertedProperties.length})
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : convertedProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Bookmark size={48} className="text-text-light" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              No saved properties yet
            </h3>
            <p className="text-text-light mb-6">
              Start browsing to save properties you like!
            </p>
            <Button onClick={() => navigate('/browse')} leftIcon={<Search size={18} />}>
              Browse Properties
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {convertedProperties.slice(0, SAVED_PROPERTIES_PREVIEW_LIMIT).map((property) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <PropertyCard property={property} onSave={handleUnsave} />
                  {/* Show unavailable badge if property is unavailable */}
                  {property.status === 'unavailable' && (
                    <div className="absolute top-2 left-2 z-20 bg-error text-white px-2 py-1 rounded text-xs font-medium">
                      Unavailable
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            {convertedProperties.length > SAVED_PROPERTIES_PREVIEW_LIMIT && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/saved-properties')}
                  leftIcon={<Bookmark size={18} />}
                >
                  View All {convertedProperties.length} Saved Properties
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Viewing Requests Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-text mb-4">Viewing Requests</h2>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-light hover:text-text'
            }`}
          >
            All ({viewingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-light hover:text-text'
            }`}
          >
            Pending ({viewingRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'scheduled'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-light hover:text-text'
            }`}
          >
            Scheduled ({viewingRequests.filter(r => r.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'completed'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-light hover:text-text'
            }`}
          >
            Completed ({viewingRequests.filter(r => r.status === 'completed').length})
          </button>
        </div>

        {/* Requests List */}
        {loadingRequests ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : getFilteredRequests().length === 0 ? (
          <div className="bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Eye size={48} className="text-text-light" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              No viewing requests {activeTab !== 'all' ? `(${activeTab})` : ''}
            </h3>
            <p className="text-text-light">
              {activeTab === 'all' 
                ? "You haven't made any viewing requests yet. Browse properties to request a viewing!"
                : `You don't have any ${activeTab} viewing requests.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getFilteredRequests().map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-lg shadow-md border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Property Image */}
                    <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {getPrimaryImage(request.properties) ? (
                        <img
                          src={getPrimaryImage(request.properties)}
                          alt={request.properties?.title || 'Property'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 size={48} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-text mb-1">
                            {request.properties?.title || 'Property'}
                          </h3>
                          <div className="flex items-center gap-2 text-text-light text-sm mb-2">
                            <MapPin size={16} />
                            <span>{request.properties?.location || 'Location not specified'}</span>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      {/* Payment Status */}
                      {request.transactions?.[0] && (
                        <div className="mb-3">
                          <span className="text-sm text-text-light">
                            Payment: <span className={`font-medium ${
                              request.transactions[0].payment_status === 'completed' 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`}>
                              {request.transactions[0].payment_status}
                            </span>
                            {request.transactions[0].payment_status === 'completed' && (
                              <span className="text-text-light ml-2">
                                (MWK {request.transactions[0].amount?.toLocaleString()})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Scheduled Date or Preferred Dates */}
                      {request.scheduled_date ? (
                        <div className="mb-3 flex items-center gap-2 text-sm text-text">
                          <Calendar size={16} className="text-primary" />
                          <span className="font-medium">Scheduled:</span>
                          <span>{formatDateTime(request.scheduled_date)}</span>
                        </div>
                      ) : request.preferred_dates && request.preferred_dates.length > 0 ? (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-text mb-1">Preferred Dates:</p>
                          <ul className="text-sm text-text-light space-y-1">
                            {request.preferred_dates.map((date: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Clock size={14} />
                                {formatDate(date)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {/* Landlord Contact */}
                      {request.landlord && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-text mb-2">Landlord Contact:</p>
                          <div className="space-y-1 text-sm text-text-light">
                            <p className="font-medium text-text">{request.landlord.full_name || 'Not provided'}</p>
                            {request.landlord.email && (
                              <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <a href={`mailto:${request.landlord.email}`} className="hover:text-primary">
                                  {request.landlord.email}
                                </a>
                              </div>
                            )}
                            {request.landlord.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <a href={`tel:${request.landlord.phone}`} className="hover:text-primary">
                                  {formatPhone(request.landlord.phone)}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Confirmation Status */}
                      {request.status === 'scheduled' && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-text mb-2">Confirmation Status:</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              {request.tenant_confirmed ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                              ) : (
                                <Clock size={16} className="text-yellow-600" />
                              )}
                              <span className={request.tenant_confirmed ? 'text-green-600 font-medium' : 'text-text-light'}>
                                You: {request.tenant_confirmed ? 'Confirmed' : 'Not confirmed'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.landlord_confirmed ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                              ) : (
                                <Clock size={16} className="text-yellow-600" />
                              )}
                              <span className={request.landlord_confirmed ? 'text-green-600 font-medium' : 'text-text-light'}>
                                Landlord: {request.landlord_confirmed ? 'Confirmed' : 'Waiting'}
                              </span>
                            </div>
                          </div>
                          {request.tenant_confirmed && request.landlord_confirmed && (
                            <p className="text-xs text-green-600 mt-2">
                              ✓ Both parties confirmed - Payment released
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/properties/${request.properties?.id}`)}
                        >
                          View Property
                        </Button>
                        {request.status === 'scheduled' && !request.tenant_confirmed && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleConfirmViewing(request.id)}
                            leftIcon={<CheckCircle2 size={16} />}
                          >
                            Confirm Viewing Completed
                          </Button>
                        )}
                        {request.status === 'scheduled' && request.tenant_confirmed && !request.landlord_confirmed && (
                          <div className="text-sm text-text-light flex items-center gap-2">
                            <Clock size={16} />
                            <span>Waiting for landlord confirmation</span>
                          </div>
                        )}
                        {['pending', 'scheduled'].includes(request.status) && !request.tenant_confirmed && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleCancelClick(request.id)}
                            leftIcon={<X size={16} />}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setRequestToCancel(null)
        }}
        title="Cancel Viewing Request"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text">
            Are you sure you want to cancel this viewing request? This action cannot be undone.
          </p>
          <p className="text-sm text-text-light">
            If payment was already made, please contact support for refund information.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setCancelModalOpen(false)
                setRequestToCancel(null)
              }}
              disabled={isCancelling}
            >
              Keep Request
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelConfirm}
              disabled={isCancelling}
              isLoading={isCancelling}
              leftIcon={<X size={18} />}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TenantDashboard


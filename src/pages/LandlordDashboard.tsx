import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  Home, 
  Eye, 
  Heart, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Grid3x3,
  List,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  X,
  DollarSign
} from 'lucide-react'
import { Button, Modal, Input } from '@components/common'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'
import { formatPrice, formatDate, formatDateTime, formatPhone } from '@utils/formatting'

interface Property {
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

const LandlordDashboard = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalSaves: 0,
    totalViewingRequests: 0,
  })
  const [viewingRequests, setViewingRequests] = useState<any[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [requestToSchedule, setRequestToSchedule] = useState<any | null>(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Redirect if not landlord or agent, or if agent is pending
  useEffect(() => {
    if (profile) {
      if (profile.role !== 'landlord' && profile.role !== 'agent') {
        navigate('/dashboard')
      } else if (profile.role === 'agent' && profile.status === 'pending') {
        navigate('/agent-pending')
      }
    }
  }, [profile, navigate])

  // Fetch properties and stats
  useEffect(() => {
    if (user && (profile?.role === 'landlord' || profile?.role === 'agent')) {
      fetchProperties()
      fetchStats()
      fetchViewingRequests()
    }
  }, [user, profile])

  const fetchProperties = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (
            image_url,
            is_primary,
            display_order
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProperties((data || []) as Property[])
    } catch (error: any) {
      console.error('Error fetching properties:', error)
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!user) return

    try {
      // Total properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)

      // Total views (sum of all property view_counts)
      const { data: viewData } = await supabase
        .from('properties')
        .select('view_count')
        .eq('owner_id', user.id)

      const totalViews = (viewData || []).reduce((sum, p) => sum + (p.view_count || 0), 0)

      // Total saves (count saved_properties for this landlord's properties)
      // First get all property IDs owned by this user
      const { data: ownedProperties } = await supabase
        .from('properties')
        .select('id')
        .eq('owner_id', user.id)

      const propertyIds = (ownedProperties || []).map((p) => p.id)

      // Then count saved_properties for those properties
      let totalSaves = 0
      if (propertyIds.length > 0) {
        const { count } = await supabase
          .from('saved_properties')
          .select('*', { count: 'exact', head: true })
          .in('property_id', propertyIds)

        totalSaves = count || 0
      }

      // Total viewing requests
      const { count: totalViewingRequests } = await supabase
        .from('viewing_requests')
        .select('*', { count: 'exact', head: true })
        .eq('landlord_id', user.id)
        .in('status', ['pending', 'scheduled'])

      setStats({
        totalProperties: totalProperties || 0,
        totalViews,
        totalSaves,
        totalViewingRequests: totalViewingRequests || 0,
      })
    } catch (error: any) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleToggleStatus = async (propertyId: string, currentStatus: string) => {
    if (!user) return

    try {
      const newStatus = currentStatus === 'available' ? 'unavailable' : 'available'
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId)
        .eq('owner_id', user.id)

      if (error) throw error

      // Update local state
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
      )

      toast.success(`Property marked as ${newStatus}`)
    } catch (error: any) {
      console.error('Error updating status:', error)
      toast.error('Failed to update property status')
    }
  }

  const handleDeleteClick = (propertyId: string) => {
    setPropertyToDelete(propertyId)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user || !propertyToDelete) return

    setIsDeleting(true)

    try {
      // 1. Get property images
      const { data: images } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('property_id', propertyToDelete)

      // 2. Delete images from storage
      if (images && images.length > 0) {
        for (const img of images) {
          try {
            const fileName = img.image_url.split('/').pop()
            if (fileName) {
              await supabase.storage.from('property-images').remove([fileName])
            }
          } catch (storageError) {
            console.warn('Error deleting image from storage:', storageError)
            // Continue even if storage deletion fails
          }
        }
      }

      // 3. Delete property (cascades to property_images, saved_properties)
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete)
        .eq('owner_id', user.id)

      if (error) throw error

      // Remove from local state
      setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete))

      // Refresh stats
      await fetchStats()

      toast.success('Property deleted successfully')
      setDeleteModalOpen(false)
      setPropertyToDelete(null)
    } catch (error: any) {
      console.error('Error deleting property:', error)
      toast.error('Failed to delete property')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setPropertyToDelete(null)
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
          tenant_id,
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
          tenant:profiles!tenant_id (
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
        .eq('landlord_id', user.id)
        .in('status', ['pending', 'scheduled', 'confirmed', 'completed'])
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

  const handleScheduleClick = (request: any) => {
    setRequestToSchedule(request)
    setScheduledDate('')
    setScheduledTime('')
    setScheduleModalOpen(true)
  }

  const handleScheduleConfirm = async () => {
    if (!user || !requestToSchedule || !scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time')
      return
    }

    setIsScheduling(true)
    try {
      // Combine date and time
      const dateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      const isoDateTime = dateTime.toISOString()

      const { error } = await supabase
        .from('viewing_requests')
        .update({
          status: 'scheduled',
          scheduled_date: isoDateTime,
        })
        .eq('id', requestToSchedule.id)
        .eq('landlord_id', user.id)

      if (error) throw error

      toast.success('Viewing scheduled successfully')
      await fetchViewingRequests()
      await fetchStats()
      setScheduleModalOpen(false)
      setRequestToSchedule(null)
      setScheduledDate('')
      setScheduledTime('')
    } catch (error: any) {
      console.error('Error scheduling viewing:', error)
      toast.error('Failed to schedule viewing')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleConfirmViewing = async (requestId: string) => {
    if (!user) return

    try {
      // Update landlord confirmation
      const { data: updatedRequest, error: updateError } = await supabase
        .from('viewing_requests')
        .update({ landlord_confirmed: true })
        .eq('id', requestId)
        .eq('landlord_id', user.id)
        .select('tenant_confirmed')
        .single()

      if (updateError) throw updateError

      // If both parties have confirmed, release payment
      if (updatedRequest?.tenant_confirmed) {
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
        toast.success('Viewing confirmed. Waiting for tenant confirmation.')
      }

      await fetchViewingRequests()
      await fetchStats()
    } catch (error: any) {
      console.error('Error confirming viewing:', error)
      toast.error('Failed to confirm viewing')
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
        .eq('landlord_id', user.id)

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

  const getMinDateTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMinTime = () => {
    if (!scheduledDate) return ''
    const today = new Date().toISOString().split('T')[0]
    if (scheduledDate === today) {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return ''
  }

  const getPrimaryImage = (property: Property) => {
    const primaryImage = property.property_images?.find((img) => img.is_primary)
    if (primaryImage) return primaryImage.image_url
    return property.property_images?.[0]?.image_url || ''
  }

  if (!user || (profile?.role !== 'landlord' && profile?.role !== 'agent')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <Button onClick={() => navigate('/properties/add')} leftIcon={<Plus size={18} />}>
          Add Property
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-light text-sm mb-1">Total Properties</p>
              <p className="text-3xl font-bold text-text">{stats.totalProperties}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Home size={24} className="text-primary" />
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
              <p className="text-text-light text-sm mb-1">Total Views</p>
              <p className="text-3xl font-bold text-text">{stats.totalViews}</p>
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
              <p className="text-text-light text-sm mb-1">Total Saves</p>
              <p className="text-3xl font-bold text-text">{stats.totalSaves}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <Heart size={24} className="text-pink-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface rounded-lg shadow-md p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-light text-sm mb-1">Viewing Requests</p>
              <p className="text-3xl font-bold text-text">{stats.totalViewingRequests}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar size={24} className="text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* My Listings Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-text">My Listings</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              leftIcon={<Grid3x3 size={18} />}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              leftIcon={<List size={18} />}
            >
              List
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200"
          >
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Home size={48} className="text-text-light" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">No properties listed yet</h3>
            <p className="text-text-light mb-6">
              Start by adding your first property listing
            </p>
            <Button onClick={() => navigate('/properties/add')} leftIcon={<Plus size={18} />}>
              Add Property
            </Button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {getPrimaryImage(property) ? (
                    <img
                      src={getPrimaryImage(property)}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home size={48} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        property.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {property.status === 'available' ? '● Available' : '● Unavailable'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-text mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  <p className="text-primary font-bold text-xl mb-2">
                    {formatPrice(property.price)}/month
                  </p>
                  <p className="text-text-light text-sm mb-3">{property.location}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-text-light mb-4">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{property.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>{property.save_count || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/properties/edit/${property.id}`)}
                      leftIcon={<Edit size={14} />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(property.id, property.status)}
                      leftIcon={
                        property.status === 'available' ? (
                          <ToggleLeft size={14} />
                        ) : (
                          <ToggleRight size={14} />
                        )
                      }
                    >
                      {property.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClick(property.id)}
                      leftIcon={<Trash2 size={14} />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface rounded-lg shadow-md p-4 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {getPrimaryImage(property) ? (
                      <img
                        src={getPrimaryImage(property)}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home size={48} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-text mb-1">
                          {property.title}
                        </h3>
                        <p className="text-text-light text-sm mb-2">{property.location}</p>
                        <p className="text-primary font-bold text-xl mb-2">
                          {formatPrice(property.price)}/month
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          property.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {property.status === 'available' ? '● Available' : '● Unavailable'}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-text-light mb-4">
                      <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{property.view_count || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart size={16} />
                        <span>{property.save_count || 0} saves</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/properties/edit/${property.id}`)}
                        leftIcon={<Edit size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(property.id, property.status)}
                        leftIcon={
                          property.status === 'available' ? (
                            <ToggleLeft size={14} />
                          ) : (
                            <ToggleRight size={14} />
                          )
                        }
                      >
                        {property.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteClick(property.id)}
                        leftIcon={<Trash2 size={14} />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Delete Property"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-text">
            Are you sure you want to delete this property? This action cannot be undone.
          </p>
          <p className="text-sm text-text-light">
            This will permanently delete the property and all associated images. Any saved
            properties will also be removed.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="ghost" onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              isLoading={isDeleting}
              leftIcon={<Trash2 size={18} />}
            >
              {isDeleting ? 'Deleting...' : 'Delete Property'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Viewing Requests Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-text mb-4">Incoming Viewing Requests</h2>

        {loadingRequests ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : viewingRequests.length === 0 ? (
          <div className="bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar size={48} className="text-text-light" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              No viewing requests yet
            </h3>
            <p className="text-text-light">
              You haven't received any viewing requests for your properties.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {viewingRequests.map((request) => (
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
                          <Home size={48} className="text-gray-400" />
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
                        <div className="mb-3 flex items-center gap-2">
                          <DollarSign size={16} className="text-green-600" />
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
                          <p className="text-sm font-medium text-text mb-1">Tenant's Preferred Dates:</p>
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

                      {/* Tenant Contact */}
                      {request.tenant && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-text mb-2">Tenant Contact:</p>
                          <div className="space-y-1 text-sm text-text-light">
                            <p className="font-medium text-text">{request.tenant.full_name || 'Not provided'}</p>
                            {request.tenant.email && (
                              <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <a href={`mailto:${request.tenant.email}`} className="hover:text-primary">
                                  {request.tenant.email}
                                </a>
                              </div>
                            )}
                            {request.tenant.phone && (
                              <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <a href={`tel:${request.tenant.phone}`} className="hover:text-primary">
                                  {formatPhone(request.tenant.phone)}
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
                                Tenant: {request.tenant_confirmed ? 'Confirmed' : 'Waiting'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.landlord_confirmed ? (
                                <CheckCircle2 size={16} className="text-green-600" />
                              ) : (
                                <Clock size={16} className="text-yellow-600" />
                              )}
                              <span className={request.landlord_confirmed ? 'text-green-600 font-medium' : 'text-text-light'}>
                                You: {request.landlord_confirmed ? 'Confirmed' : 'Not confirmed'}
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
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleScheduleClick(request)}
                            leftIcon={<Calendar size={16} />}
                          >
                            Schedule
                          </Button>
                        )}
                        {request.status === 'scheduled' && !request.landlord_confirmed && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleConfirmViewing(request.id)}
                            leftIcon={<CheckCircle2 size={16} />}
                          >
                            Confirm Viewing Completed
                          </Button>
                        )}
                        {request.status === 'scheduled' && request.landlord_confirmed && !request.tenant_confirmed && (
                          <div className="text-sm text-text-light flex items-center gap-2">
                            <Clock size={16} />
                            <span>Waiting for tenant confirmation</span>
                          </div>
                        )}
                        {['pending', 'scheduled'].includes(request.status) && !request.landlord_confirmed && (
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

      {/* Schedule Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false)
          setRequestToSchedule(null)
          setScheduledDate('')
          setScheduledTime('')
        }}
        title="Schedule Viewing"
        size="md"
      >
        <div className="space-y-4">
          {requestToSchedule && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-text mb-2">Property:</p>
                <p className="text-text">{requestToSchedule.properties?.title}</p>
                <p className="text-sm text-text-light">{requestToSchedule.properties?.location}</p>
              </div>

              {requestToSchedule.preferred_dates && requestToSchedule.preferred_dates.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-text mb-2">Tenant's Preferred Dates:</p>
                  <ul className="text-sm text-text-light space-y-1">
                    {requestToSchedule.preferred_dates.map((date: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Clock size={14} />
                        {formatDate(date)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div>
            <Input
              type="date"
              label="Select Date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={getMinDateTime()}
              leftIcon={<Calendar size={18} />}
              required
            />
          </div>

          <div>
            <Input
              type="time"
              label="Select Time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={scheduledDate === new Date().toISOString().split('T')[0] ? getMinTime() : undefined}
              leftIcon={<Clock size={18} />}
              required
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setScheduleModalOpen(false)
                setRequestToSchedule(null)
                setScheduledDate('')
                setScheduledTime('')
              }}
              disabled={isScheduling}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleScheduleConfirm}
              disabled={isScheduling || !scheduledDate || !scheduledTime}
              isLoading={isScheduling}
              leftIcon={<Calendar size={18} />}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Viewing'}
            </Button>
          </div>
        </div>
      </Modal>

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
            The tenant will be notified and may be eligible for a refund depending on payment status.
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

export default LandlordDashboard


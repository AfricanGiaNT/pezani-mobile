import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  Bookmark, 
  Search,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@components/common'
import PropertyCard from '@components/property/PropertyCard'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'

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

const SavedPropertiesPage = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([])

  // Redirect if not tenant
  useEffect(() => {
    if (profile && profile.role !== 'tenant') {
      navigate('/dashboard')
    }
  }, [profile, navigate])

  // Fetch saved properties
  useEffect(() => {
    if (user && profile?.role === 'tenant') {
      fetchSavedProperties()
    }
  }, [user, profile])

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

  if (!user || profile?.role !== 'tenant') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          leftIcon={<ArrowLeft size={18} />}
          className="text-text-light hover:text-text"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Saved Properties</h1>
          <p className="text-text-light">
            {convertedProperties.length} {convertedProperties.length === 1 ? 'property' : 'properties'} saved
          </p>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {convertedProperties.map((property) => (
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
      )}
    </div>
  )
}

export default SavedPropertiesPage


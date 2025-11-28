import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { Button, Input } from '@components/common'
import {
  propertySchema,
  PropertyFormData,
  malawiLocations,
  propertyTypes,
  availableAmenities,
} from '@utils/validation'
import { supabase } from '@lib/supabase'
import { useAuth } from '@contexts/AuthContext'

const EditPropertyPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: 'onBlur',
  })

  // Fetch property and pre-fill form
  useEffect(() => {
    if (!id || !user) return

    const fetchProperty = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          toast.error('Property not found')
          navigate('/dashboard')
          return
        }

        // Check ownership
        if (data.owner_id !== user.id) {
          toast.error('You do not have permission to edit this property')
          navigate('/dashboard')
          return
        }

        // Pre-fill form with existing data
        reset({
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price,
          viewing_fee: data.viewing_fee,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          property_type: data.property_type as any,
          amenities: data.amenities || [],
        })

        // Set selected amenities for checkbox state
        setSelectedAmenities(data.amenities || [])
      } catch (error: any) {
        console.error('Error fetching property:', error)
        toast.error('Failed to load property')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id, user, navigate, reset])

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => {
      const updated = prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
      setValue('amenities', updated)
      return updated
    })
  }

  const onSubmit = async (data: PropertyFormData) => {
    if (!user || !id) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price,
          viewing_fee: data.viewing_fee,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          property_type: data.property_type as any,
          amenities: data.amenities || [],
        })
        .eq('id', id)
        .eq('owner_id', user.id)

      if (error) throw error

      toast.success('Property updated successfully')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Error updating property:', error)
      toast.error(error.message || 'Failed to update property. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container-custom max-w-3xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            leftIcon={<ArrowLeft size={18} />}
            className="mb-4"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-text mb-2">Edit Property</h1>
          <p className="text-text-light">Update your property listing details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-surface rounded-lg shadow-md p-6 md:p-8 space-y-6">
            {/* Basic Details */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Basic Details</h2>
              <div className="space-y-4">
                <Input
                  label="Property Title *"
                  placeholder="e.g., Modern 3 Bedroom House"
                  {...register('title')}
                  error={errors.title?.message}
                  fullWidth
                />

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder="Describe your property in detail..."
                    rows={5}
                    className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
                      errors.description
                        ? 'border-error focus:border-error focus:ring-error'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-sm text-error">{errors.description.message}</p>
                  )}
                  <p className="mt-1.5 text-sm text-text-light">
                    {getValues('description')?.length || 0} / 1500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Location *
                  </label>
                  <select
                    {...register('location')}
                    className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
                      errors.location
                        ? 'border-error focus:border-error focus:ring-error'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    }`}
                  >
                    <option value="">Select location...</option>
                    {malawiLocations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="mt-1.5 text-sm text-error">{errors.location.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Pricing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Monthly Rent (MWK) *
                  </label>
                  <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="150000"
                    className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
                      errors.price
                        ? 'border-error focus:border-error focus:ring-error'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {errors.price && (
                    <p className="mt-1.5 text-sm text-error">{errors.price.message}</p>
                  )}
                  <p className="mt-1.5 text-sm text-text-light">Minimum: MWK 5,000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Viewing Fee (MWK) *
                  </label>
                  <input
                    type="number"
                    {...register('viewing_fee', { valueAsNumber: true })}
                    placeholder="5000"
                    className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
                      errors.viewing_fee
                        ? 'border-error focus:border-error focus:ring-error'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {errors.viewing_fee && (
                    <p className="mt-1.5 text-sm text-error">{errors.viewing_fee.message}</p>
                  )}
                  <p className="mt-1.5 text-sm text-text-light">
                    Fee charged to tenants for property viewing (can be 0)
                  </p>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h2 className="text-xl font-semibold text-text mb-4">Property Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      {...register('bedrooms', { valueAsNumber: true })}
                      placeholder="3"
                      min="0"
                      className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
                        errors.bedrooms
                          ? 'border-error focus:border-error focus:ring-error'
                          : 'border-gray-300 focus:border-primary focus:ring-primary'
                      }`}
                    />
                    {errors.bedrooms && (
                      <p className="mt-1.5 text-sm text-error">{errors.bedrooms.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      {...register('bathrooms', { valueAsNumber: true })}
                      placeholder="2"
                      min="0"
                      className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
                        errors.bathrooms
                          ? 'border-error focus:border-error focus:ring-error'
                          : 'border-gray-300 focus:border-primary focus:ring-primary'
                      }`}
                    />
                    {errors.bathrooms && (
                      <p className="mt-1.5 text-sm text-error">{errors.bathrooms.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Property Type *
                  </label>
                  <select
                    {...register('property_type')}
                    className={`block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${
                      errors.property_type
                        ? 'border-error focus:border-error focus:ring-error'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    }`}
                  >
                    <option value="">Select property type...</option>
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.property_type && (
                    <p className="mt-1.5 text-sm text-error">{errors.property_type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-3">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-text">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Images Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Images cannot be edited in this version. To add more images,
                please contact support or use the property detail page.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} leftIcon={<Save size={18} />}>
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPropertyPage


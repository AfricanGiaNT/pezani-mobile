import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/common';
import ImageUpload from '@/components/property/ImageUpload';
import { propertySchema, PropertyFormData, malawiLocations, propertyTypes, availableAmenities } from '@/utils/validation';
import { slideLeft, slideRight } from '@/utils/animations';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@contexts/AuthContext';

const AddPropertyPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; isPrimary: boolean; displayOrder: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: 'onBlur',
    defaultValues: {
      amenities: [],
    },
  });

  const totalSteps = 4;

  const steps = [
    { number: 1, title: 'Basic Details', fields: ['title', 'description', 'location'] },
    { number: 2, title: 'Pricing', fields: ['price', 'viewing_fee'] },
    { number: 3, title: 'Property Details', fields: ['bedrooms', 'bathrooms', 'property_type', 'amenities'] },
    { number: 4, title: 'Images', fields: [] },
  ];

  const handleNext = async () => {
    const currentFields = steps[currentStep - 1].fields as (keyof PropertyFormData)[];
    const isValid = await trigger(currentFields);

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => {
      const updated = prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity];
      setValue('amenities', updated);
      return updated;
    });
  };

  const onSubmit = async (data: PropertyFormData) => {
    // Check if user is authenticated
    if (!user) {
      setSubmitError('You must be logged in to list a property');
      navigate('/login');
      return;
    }

    // Check if images are uploaded
    if (uploadedImages.length === 0) {
      setSubmitError('Please upload at least one image');
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Insert property into database
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          title: data.title,
          description: data.description,
          location: data.location,
          price: data.price,
          viewing_fee: data.viewing_fee,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          property_type: data.property_type as any,
          amenities: data.amenities || [],
          status: 'available',
        })
        .select()
        .single();

      if (propertyError) {
        throw propertyError;
      }

      if (!property) {
        throw new Error('Failed to create property');
      }

      // 2. Insert property images
      const imageInserts = uploadedImages.map((img) => ({
        property_id: property.id,
        image_url: img.url,
        is_primary: img.isPrimary,
        display_order: img.displayOrder,
      }));

      const { error: imagesError } = await supabase
        .from('property_images')
        .insert(imageInserts);

      if (imagesError) {
        // If images fail, try to delete the property (cleanup)
        await supabase.from('properties').delete().eq('id', property.id);
        throw imagesError;
      }

      // 3. Success! Redirect to dashboard
      navigate('/dashboard?success=property-created');
    } catch (error: any) {
      console.error('Error creating property:', error);
      setSubmitError(error.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">List Your Property</h1>
          <p className="text-text-light">Fill in the details to create your property listing</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Steps */}
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <motion.div
                  animate={{
                    backgroundColor: currentStep >= step.number ? '#E4B012' : '#E5E7EB',
                    scale: currentStep === step.number ? 1.1 : 1,
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                    currentStep >= step.number ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? <Check size={20} /> : step.number}
                </motion.div>
                <span className="text-xs text-center text-text-light hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-surface rounded-lg shadow-md p-6 md:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-semibold text-text mb-6">Basic Details</h2>

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
                </motion.div>
              )}

              {/* Step 2: Pricing */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-semibold text-text mb-6">Pricing</h2>

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
                    <p className="mt-1.5 text-sm text-text-light">
                      Minimum: MWK 5,000
                    </p>
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
                </motion.div>
              )}

              {/* Step 3: Property Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-semibold text-text mb-6">Property Details</h2>

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
                    <label className="block text-sm font-medium text-text mb-3">
                      Amenities
                    </label>
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
                </motion.div>
              )}

              {/* Step 4: Images */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-semibold text-text mb-6">Property Images</h2>
                  
                  <ImageUpload 
                    onImagesChange={() => {}}
                    onUploadedImagesChange={setUploadedImages}
                    maxImages={10}
                  />
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} uploaded successfully
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={20} className="mr-1" />
              Previous
            </Button>

            <span className="text-sm text-text-light">
              Step {currentStep} of {totalSteps}
            </span>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight size={20} className="ml-1" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="mr-1 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={20} className="mr-1" />
                    Submit Listing
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;


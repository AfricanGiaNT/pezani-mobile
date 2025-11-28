import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200'
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
  }

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

// Pre-built skeleton patterns
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton height="200px" className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton height="24px" className="w-3/4" />
        <Skeleton height="16px" className="w-1/2" />
        <div className="flex gap-2">
          <Skeleton height="16px" width="60px" />
          <Skeleton height="16px" width="60px" />
          <Skeleton height="16px" width="60px" />
        </div>
        <Skeleton height="20px" className="w-1/3" />
      </div>
    </div>
  )
}

export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  )
}

export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Image Gallery Skeleton */}
      <Skeleton height="400px" className="w-full rounded-lg" />

      {/* Title and Price */}
      <div className="space-y-3">
        <Skeleton height="32px" className="w-3/4" />
        <Skeleton height="24px" className="w-1/4" />
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Skeleton height="40px" width="100px" />
        <Skeleton height="40px" width="100px" />
        <Skeleton height="40px" width="100px" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton height="16px" className="w-full" />
        <Skeleton height="16px" className="w-full" />
        <Skeleton height="16px" className="w-3/4" />
      </div>

      {/* Amenities */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height="60px" />
        ))}
      </div>

      {/* CTA Button */}
      <Skeleton height="48px" className="w-full rounded-lg" />
    </div>
  )
}

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton height="32px" className="w-1/3" />
        <Skeleton height="16px" className="w-1/4" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height="100px" className="rounded-lg" />
        ))}
      </div>

      {/* Table/List */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="80px" className="rounded-lg" />
        ))}
      </div>
    </div>
  )
}


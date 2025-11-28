import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/common';
import { malawiLocations, propertyTypes } from '@/utils/validation';

export interface FilterState {
  location: string;
  minPrice: number | '';
  maxPrice: number | '';
  bedrooms: string;
  propertyTypes: string[];
  status: 'available' | 'all';
}

interface PropertyFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const PropertyFilters = ({
  filters,
  onFiltersChange,
  onReset,
  isMobile = false,
  onClose,
}: PropertyFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const togglePropertyType = (type: string) => {
    const updated = {
      ...localFilters,
      propertyTypes: localFilters.propertyTypes.includes(type)
        ? localFilters.propertyTypes.filter(t => t !== type)
        : [...localFilters.propertyTypes, type],
    };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      propertyTypes: [],
      status: 'available',
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters = 
    localFilters.location !== '' ||
    localFilters.minPrice !== '' ||
    localFilters.maxPrice !== '' ||
    localFilters.bedrooms !== '' ||
    localFilters.propertyTypes.length > 0 ||
    localFilters.status !== 'available';

  return (
    <div className={`bg-surface rounded-lg shadow-md ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text">Filters</h3>
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Location
          </label>
          <select
            value={localFilters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base"
          >
            <option value="">All Locations</option>
            {malawiLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Price Range (MWK)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base"
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Bedrooms Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Bedrooms
          </label>
          <select
            value={localFilters.bedrooms}
            onChange={(e) => updateFilter('bedrooms', e.target.value)}
            className="w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2 text-base"
          >
            <option value="">Any</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4 Bedrooms</option>
            <option value="5+">5+ Bedrooms</option>
          </select>
        </div>

        {/* Property Type Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Property Type
          </label>
          <div className="space-y-2">
            {propertyTypes.map((type) => (
              <label
                key={type.value}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localFilters.propertyTypes.includes(type.value)}
                  onChange={() => togglePropertyType(type.value)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-text">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Status
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="available"
                checked={localFilters.status === 'available'}
                onChange={(e) => updateFilter('status', e.target.value as 'available')}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text">Available Only</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="all"
                checked={localFilters.status === 'all'}
                onChange={(e) => updateFilter('status', e.target.value as 'all')}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text">All Properties</span>
            </label>
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            fullWidth
            onClick={handleReset}
          >
            <X size={16} className="mr-2" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default PropertyFilters;

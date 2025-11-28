import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/common';
import PropertyGrid from '@/components/property/PropertyGrid';
import PropertyFilters, { FilterState } from '@/components/property/PropertyFilters';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  viewing_fee: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  status: string;
  view_count: number;
  save_count: number;
  created_at: string;
  property_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const itemsPerPage = 12;

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
    bedrooms: searchParams.get('bedrooms') || '',
    propertyTypes: searchParams.get('propertyTypes')?.split(',') || [],
    status: (searchParams.get('status') as 'available' | 'all') || 'available',
  });

  const searchQuery = searchParams.get('search') || '';

  // Fetch properties
  useEffect(() => {
    fetchProperties();
  }, [filters, sortBy, page, searchQuery]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);
    if (filters.propertyTypes.length > 0) params.set('propertyTypes', filters.propertyTypes.join(','));
    if (filters.status !== 'available') params.set('status', filters.status);
    if (searchQuery) params.set('search', searchQuery);

    setSearchParams(params, { replace: true });
  }, [filters, searchQuery]);

  const fetchProperties = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('properties')
        .select('*, property_images(*)', { count: 'exact' });

      // Apply status filter - only show available properties by default
      if (filters.status === 'available') {
        query = query.eq('status', 'available');
      } else if (filters.status === 'all') {
        // Show all statuses except unavailable (for browsing)
        query = query.neq('status', 'unavailable');
      }

      // Apply location filter
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Apply price filters
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      // Apply bedrooms filter
      if (filters.bedrooms) {
        if (filters.bedrooms === '5+') {
          query = query.gte('bedrooms', 5);
        } else {
          query = query.eq('bedrooms', Number(filters.bedrooms));
        }
      }

      // Apply property type filter
      if (filters.propertyTypes.length > 0) {
        query = query.in('property_type', filters.propertyTypes);
      }

      // Apply search query
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
        );
      }

      // Apply sorting
      if (sortBy === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      console.log('Fetched properties:', data?.length || 0, 'Total count:', count);
      
      setProperties((data as Property[]) || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      setProperties([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      propertyTypes: [],
      status: 'available',
    };
    setFilters(resetFilters);
    setPage(1);
  };

  const handleLoadMore = () => {
    if ((page * itemsPerPage) < totalCount) {
      setPage(prev => prev + 1);
    }
  };

  const hasMore = (page * itemsPerPage) < totalCount;

  // Convert Property to format expected by PropertyGrid
  const convertedProperties = properties.map(prop => ({
    id: prop.id,
    title: prop.title,
    location: prop.location,
    price: prop.price,
    viewing_fee: prop.viewing_fee,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    property_type: prop.property_type as any,
    status: prop.status as 'available' | 'unavailable',
    images: prop.property_images?.map(img => img.image_url) || [],
    description: prop.description,
    amenities: prop.amenities || [],
    view_count: prop.view_count || 0,
    save_count: prop.save_count || 0,
    created_at: prop.created_at,
  }));

  return (
    <div className="min-h-screen bg-background py-6 md:py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-text mb-2">Browse Properties</h1>
          {searchQuery && (
            <p className="text-text-light">
              Search results for: <span className="font-semibold text-text">"{searchQuery}"</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <PropertyFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
              </button>

              {/* Results Count and Sort */}
              <div className="flex-1 flex items-center justify-between gap-4">
                <p className="text-text-light">
                  Showing <span className="font-semibold text-text">{properties.length}</span> of{' '}
                  <span className="font-semibold text-text">{totalCount}</span> properties
                </p>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-text-light">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setPage(1);
                    }}
                    className="rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property Grid */}
            {loading && properties.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={48} className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                <PropertyGrid
                  properties={convertedProperties}
                  loading={loading && properties.length > 0}
                  emptyMessage={
                    searchQuery
                      ? `No properties found matching "${searchQuery}"`
                      : 'No properties found. Try adjusting your filters.'
                  }
                />

                {/* Load More Button */}
                {hasMore && !loading && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        `Load More (${totalCount - (page * itemsPerPage)} remaining)`
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Filters Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-surface shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4">
                <PropertyFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onReset={handleResetFilters}
                  isMobile
                  onClose={() => setMobileFiltersOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrowsePage;

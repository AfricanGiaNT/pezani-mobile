import { motion } from 'framer-motion';
import PropertyCard from './PropertyCard';
import { MockProperty } from '@/utils/mockData';
import { staggerContainer, staggerItem } from '@/utils/animations';

interface PropertyGridProps {
  properties: MockProperty[];
  loading?: boolean;
  emptyMessage?: string;
  onSaveProperty?: (propertyId: string) => void;
}

const PropertyGrid = ({
  properties,
  loading = false,
  emptyMessage = 'No properties found',
  onSaveProperty,
}: PropertyGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-lg" />
            <div className="bg-surface p-4 rounded-b-lg border border-gray-200">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="flex gap-3 mb-3">
                <div className="h-4 bg-gray-200 rounded w-12" />
                <div className="h-4 bg-gray-200 rounded w-12" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🏠</span>
        </div>
        <h3 className="text-xl font-semibold text-text mb-2">{emptyMessage}</h3>
        <p className="text-text-light">Try adjusting your search filters</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {properties.map((property) => (
        <motion.div key={property.id} variants={staggerItem}>
          <PropertyCard property={property} onSave={onSaveProperty} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default PropertyGrid;

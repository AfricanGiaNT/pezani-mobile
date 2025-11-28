import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Home as HomeIcon, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/common';
import DarkVeil from '@/components/common/DarkVeil';
import { PropertyGrid } from '@/components/property';
import { supabase } from '@/lib/supabase';
import { slideUp, fadeIn } from '@/utils/animations';

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

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Fetch featured and recent properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);

        // Fetch featured properties (most viewed or saved)
        const { data: featuredData } = await supabase
          .from('properties')
          .select('*, property_images(*)')
          .eq('status', 'available')
          .order('view_count', { ascending: false })
          .order('save_count', { ascending: false })
          .limit(6);

        // Fetch recent properties
        const { data: recentData } = await supabase
          .from('properties')
          .select('*, property_images(*)')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(8);

        // Convert to PropertyGrid format
        const convertProperties = (props: any[]) => {
          return (props || []).map(prop => ({
            id: prop.id,
            title: prop.title,
            location: prop.location,
            price: prop.price,
            viewing_fee: prop.viewing_fee,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            property_type: prop.property_type,
            status: prop.status as 'available' | 'unavailable',
            images: prop.property_images?.map((img: any) => img.image_url) || [],
            description: prop.description,
            amenities: prop.amenities || [],
            view_count: prop.view_count || 0,
            save_count: prop.save_count || 0,
            created_at: prop.created_at,
          }));
        };

        setFeaturedProperties(convertProperties(featuredData || []));
        setRecentProperties(convertProperties(recentData || []));
      } catch (error) {
        console.error('Error fetching properties:', error);
        setFeaturedProperties([]);
        setRecentProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary via-secondary-dark to-accent py-20 md:py-32 overflow-hidden min-h-[600px]">
        {/* DarkVeil Animated Background */}
        <div className="absolute inset-0 z-0 w-full h-full" style={{ minHeight: '600px' }}>
          <DarkVeil
            hueShift={200}
            noiseIntensity={0.02}
            scanlineIntensity={0.1}
            speed={0.3}
            scanlineFrequency={2.0}
            warpAmount={0.3}
            resolutionScale={1}
          />
        </div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-secondary-dark/70 to-accent/80 z-[1]" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Find Your Perfect Home in Malawi
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8">
                Browse thousands of properties and connect with landlords directly.
                No more deceitful agents, no more hidden fees.
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-light" size={24} />
                <input
                  type="text"
                  placeholder="Search by location, property type, or price..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 md:py-5 text-lg bg-white rounded-xl border-2 border-transparent focus:outline-none focus:border-primary shadow-2xl"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">500+</div>
                <div className="text-sm md:text-base text-gray-300">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">1000+</div>
                <div className="text-sm md:text-base text-gray-300">Happy Tenants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">50+</div>
                <div className="text-sm md:text-base text-gray-300">Landlords</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="#F8F9FA"
            />
          </svg>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="text-primary" size={28} />
              <h2 className="text-3xl md:text-4xl font-bold text-text">Featured Properties</h2>
            </div>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              Hand-picked properties with verified information and quality photos
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin text-primary" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <PropertyGrid properties={featuredProperties.slice(0, 6)} />
          ) : (
            <div className="text-center py-12">
              <p className="text-text-light">No featured properties available at the moment.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/browse">
              <Button size="lg" variant="outline">
                View All Properties
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Recent Properties Section */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <HomeIcon className="text-primary" size={28} />
              <h2 className="text-3xl md:text-4xl font-bold text-text">Recently Added</h2>
            </div>
            <p className="text-text-light text-lg max-w-2xl mx-auto">
              Fresh listings from verified landlords and agents
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin text-primary" />
            </div>
          ) : recentProperties.length > 0 ? (
            <PropertyGrid properties={recentProperties.slice(0, 8)} />
          ) : (
            <div className="text-center py-12">
              <p className="text-text-light">No recent properties available at the moment.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/browse">
              <Button size="lg">
                Browse More Properties
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Are You a Landlord?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              List your properties for free and reach thousands of potential tenants.
              No hidden fees, no commission charges.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary">
                List Your Property
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

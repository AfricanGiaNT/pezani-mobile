import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, Home, Building2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/common';
import { useAuth } from '@contexts/AuthContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Navigation links based on user state
  const guestLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Browse Properties', path: '/browse', icon: Building2 },
  ];

  const authenticatedLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Browse Properties', path: '/browse', icon: Building2 },
    { name: 'Dashboard', path: '/dashboard', icon: User },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // Show "Add Property" for landlords and agents
  const canAddProperty = user?.user_metadata?.role === 'landlord' || user?.user_metadata?.role === 'agent';

  const navLinks = user ? authenticatedLinks : guestLinks;

  return (
    <nav className="bg-surface border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-text">Pezani</span>
            </motion.div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={18} />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-text hover:text-primary transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}

            {canAddProperty && (
              <Link to="/properties/add">
                <Button size="sm" variant="outline">
                  <PlusCircle size={16} className="mr-1" />
                  Add Property
                </Button>
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/dashboard">
                  <Button size="sm" variant="ghost">
                    <User size={16} className="mr-1" />
                    {user.user_metadata?.full_name || 'Profile'}
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={handleSignOut}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button size="sm" variant="ghost">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={18} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-surface shadow-xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex items-center justify-between mb-8">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Building2 className="text-white" size={20} />
                      </div>
                      <span className="text-xl font-bold text-text">Pezani</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 mb-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <link.icon size={20} className="text-primary" />
                      <span className="font-medium text-text">{link.name}</span>
                    </Link>
                  ))}

                  {canAddProperty && (
                    <Link
                      to="/properties/add"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <PlusCircle size={20} className="text-primary" />
                      <span className="font-medium text-text">Add Property</span>
                    </Link>
                  )}
                </div>

                {/* Auth Buttons */}
                <div className="border-t border-gray-200 pt-6">
                  {user ? (
                    <div className="space-y-3">
                      <div className="px-4 py-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-text-light">Signed in as</p>
                        <p className="font-medium text-text">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                      </div>
                      <Button fullWidth variant="outline" onClick={handleSignOut}>
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button fullWidth variant="outline">
                          Login
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button fullWidth>
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

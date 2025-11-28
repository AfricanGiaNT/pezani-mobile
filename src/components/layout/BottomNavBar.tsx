import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const BottomNavBar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Only show bottom nav for authenticated users
  if (!user) return null;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Search', path: '/browse', icon: Search },
    { name: 'Dashboard', path: '/dashboard', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-30 shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center justify-center ${
                  isActive ? 'text-primary' : 'text-text-light'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{item.name}</span>
              </motion.div>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-0 right-0 h-1 bg-primary"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;

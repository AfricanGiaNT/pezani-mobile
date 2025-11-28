import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavBar from './BottomNavBar';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user } = useAuth();

  // Add padding for bottom nav on mobile when user is logged in
  const mainPaddingClass = user ? 'pb-20 md:pb-0' : '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex-grow ${mainPaddingClass}`}
      >
        {children}
      </motion.main>

      <Footer />
      <BottomNavBar />
    </div>
  );
};

export default Layout;

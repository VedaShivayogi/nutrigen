import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const MainLayout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <motion.main
        className="flex-grow"
        variants={pageVariants}
        initial="initial"
        animate="animate"
      >
        {children}
      </motion.main>
      {showFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
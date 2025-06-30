import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import BoltBadge from './BoltBadge';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Bolt.new Badge - Fixed Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <BoltBadge size="md" />
      </div>
      
      <motion.div
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <motion.h2
            className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p
              className="text-sm text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export default AuthLayout;
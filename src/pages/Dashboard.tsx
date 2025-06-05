import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Home, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHome from './DashboardHome';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Dashboard layout with sidebar navigation
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 right-0 m-4 z-20">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-lg transition-transform transform lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
            <h1 className="text-xl font-bold text-white">Hackathon Platform</h1>
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-1">
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.user_metadata?.username || user.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
            
            <nav className="mt-5 px-2 space-y-1">
              <a
                href="#"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-indigo-600 bg-indigo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a
                href="#"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </a>
              <button
                onClick={handleSignOut}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="*" element={<Navigate to="/dashboard\" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
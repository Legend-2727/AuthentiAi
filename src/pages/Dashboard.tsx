import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Home, Settings, Menu, X, Video, Plus, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHome from './DashboardHome';
import ProfileSettings from './ProfileSettings';
import CreateContent from './CreateContent';
import CreateVideo from './CreateVideo';
import CreateAudioPost from './CreateAudioPost';
import MyVideos from './MyVideos';
import MyAudioPosts from './MyAudioPosts';

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
            <h1 className="text-xl font-bold text-white">AuthentiAi</h1>
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
                href="/dashboard"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-indigo-600 bg-indigo-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a
                href="/dashboard/profile"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5" />
                Profile Settings
              </a>
              <a
                href="/dashboard/create"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="mr-3 h-5 w-5" />
                Create Content
              </a>
              <a
                href="/dashboard/my-videos"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Video className="mr-3 h-5 w-5" />
                My Videos
              </a>
              <a
                href="/dashboard/my-audio"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Mic className="mr-3 h-5 w-5" />
                My Audio Posts
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
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/create" element={<CreateContent />} />
              <Route path="/create/video" element={<CreateVideo />} />
              <Route path="/create-audio" element={<CreateAudioPost />} />
              <Route path="/my-videos" element={<MyVideos />} />
              <Route path="/my-audio" element={<MyAudioPosts />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
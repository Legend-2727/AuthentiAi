import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Home, Menu, X, Video, Plus, Mic, Users, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import UserAvatar from '../components/UserAvatar';
import DashboardHome from './DashboardHome';
import ProfileSettings from './ProfileSettings';
import CreateContent from './CreateContent';
import CreateVideo from './CreateVideo';
import CreateAudioPost from './CreateAudioPost';
import MyVideos from './MyVideos';
import MyAudioPosts from './MyAudioPosts';
import SocialFeed from './SocialFeed';
import OwnershipDemo from './OwnershipDemo';

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleMobileMenu}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <UserAvatar user={user} size="sm" />
            <span className="font-semibold text-gray-900 dark:text-white">Veridica</span>
          </button>
          <div className="lg:hidden">
            {isMobileMenuOpen ? <X size={24} className="text-gray-600 dark:text-gray-300" /> : <Menu size={24} className="text-gray-600 dark:text-gray-300" />}
          </div>
        </div>
      </div>

      {/* Mobile menu button - for larger screens */}
      <div className="hidden lg:block fixed top-0 right-0 m-4 z-20">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-5 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform transform lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600 dark:bg-indigo-700">
            <h1 className="text-xl font-bold text-white">Veridica</h1>
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-1">
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UserAvatar user={user} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.user_metadata?.username || user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
            
            <nav className="mt-5 px-2 space-y-1">
              <a
                href="/dashboard/feed"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="mr-3 h-5 w-5" />
                Social Feed
              </a>
              <a
                href="/dashboard/home"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a
                href="/dashboard/create"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="mr-3 h-5 w-5" />
                Create Content
              </a>
              <a
                href="/dashboard/my-audio"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Mic className="mr-3 h-5 w-5" />
                My Audio Posts
              </a>
              <a
                href="/dashboard/my-videos"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Video className="mr-3 h-5 w-5" />
                My Videos
              </a>
              <a
                href="/dashboard/profile"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5" />
                Profile Settings
              </a>
              <a
                href="/dashboard/ownership-demo"
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="mr-3 h-5 w-5" />
                Ownership Demo
              </a>
            </nav>
            
            {/* Theme toggle and sign out */}
            <div className="mt-auto px-2 pb-4 space-y-2">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <button
                onClick={handleSignOut}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-10 pt-20 lg:pt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard/feed" replace />} />
              <Route path="/home" element={<DashboardHome />} />
              <Route path="/feed" element={<SocialFeed />} />
              <Route path="/profile" element={<ProfileSettings />} />
              <Route path="/create" element={<CreateContent />} />
              <Route path="/create/video" element={<CreateVideo />} />
              <Route path="/create-audio" element={<CreateAudioPost />} />
              <Route path="/my-videos" element={<MyVideos />} />
              <Route path="/my-audio" element={<MyAudioPosts />} />
              <Route path="/ownership-demo" element={<OwnershipDemo />} />
              <Route path="*" element={<Navigate to="/dashboard/feed" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
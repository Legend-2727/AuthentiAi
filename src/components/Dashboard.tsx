import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Home, Menu, X, Video, Plus, Mic, Users, Shield, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import UserAvatar from '../components/UserAvatar';
import StarWallet from '../components/StarWallet';
import BuyStarsModal from '../components/BuyStarsModal';
import StarSystemDemo from '../components/StarSystemDemo';
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
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header Bar - Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={toggleMobileMenu}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <UserAvatar user={user} size="sm" />
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold font-['Abril_Fatface',_cursive] italic bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Veridica
                </span>
              </div>
            </div>
          </button>
          
          <div className="flex items-center space-x-2">
            <StarWallet onBuyStars={() => setShowBuyStarsModal(true)} />
            <div className="lg:hidden">
              {isMobileMenuOpen ? <X size={24} className="text-gray-600 dark:text-gray-300" /> : <Menu size={24} className="text-gray-600 dark:text-gray-300" />}
            </div>
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
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-transform transform lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={false}
      >
        <div className="h-full flex flex-col">
          {/* Elegant Header with Beautiful Branding */}
          <div className="flex items-center justify-center h-20 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-700/20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            
            {/* Logo and Brand */}
            <div className="relative flex items-center space-x-3 z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                <Shield className="w-6 h-6 text-white drop-shadow-sm" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-['Abril_Fatface',_cursive] italic text-white tracking-tight drop-shadow-sm">
                  Veridica
                </h1>
                <p className="text-xs text-white/80 font-medium tracking-wide">
                  BLOCKCHAIN VERIFIED
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-6 space-y-1">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex-shrink-0">
                  <UserAvatar user={user} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user.user_metadata?.username || user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
              
              {/* Star Wallet in Sidebar */}
              <div className="flex justify-center">
                <StarWallet onBuyStars={() => setShowBuyStarsModal(true)} />
              </div>
            </div>
            
            <nav className="mt-6 px-3 space-y-2">
              <a
                href="/dashboard/feed"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 shadow-sm transition-all duration-200 hover:shadow-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="mr-3 h-5 w-5" />
                Social Feed
              </a>
              <a
                href="/dashboard/home"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" />
                Dashboard
              </a>
              <a
                href="/dashboard/create"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="mr-3 h-5 w-5" />
                Create Content
              </a>
              <a
                href="/dashboard/my-audio"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Mic className="mr-3 h-5 w-5" />
                My Audio Posts
              </a>
              <a
                href="/dashboard/my-videos"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Video className="mr-3 h-5 w-5" />
                My Videos
              </a>
              <a
                href="/dashboard/profile"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5" />
                Profile Settings
              </a>
              <a
                href="/dashboard/star-demo"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Star className="mr-3 h-5 w-5" />
                Star System Demo
              </a>
              <a
                href="/dashboard/ownership-demo"
                className="group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="mr-3 h-5 w-5" />
                Ownership Demo
              </a>
            </nav>
            
            {/* Theme toggle and sign out */}
            <div className="mt-auto px-3 pb-6 space-y-3">
              <div className="flex justify-center">
                <ThemeToggle />
              </div>
              <button
                onClick={handleSignOut}
                className="w-full group flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 min-h-screen rounded-lg lg:rounded-none shadow-sm lg:shadow-none">
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
              <Route path="/star-demo" element={<StarSystemDemo />} />
              <Route path="/ownership-demo" element={<OwnershipDemo />} />
              <Route path="*" element={<Navigate to="/dashboard/feed" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Buy Stars Modal */}
      <BuyStarsModal 
        isOpen={showBuyStarsModal}
        onClose={() => setShowBuyStarsModal(false)}
      />
    </div>
  );
};

export default Dashboard;
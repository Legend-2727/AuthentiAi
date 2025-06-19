import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Video, User, Plus, TrendingUp } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name: string | null;
  profile_img_url: string | null;
  created_at: string;
  status: string;
}

interface DashboardStats {
  totalVideos: number;
  completedVideos: number;
  processingVideos: number;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    completedVideos: 0,
    processingVideos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else {
          setProfile(profileData);
        }

        // Fetch video statistics
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('status')
          .eq('user_id', user.id);

        if (videosError) {
          console.error('Error fetching videos:', videosError);
        } else {
          const totalVideos = videosData.length;
          const completedVideos = videosData.filter(v => v.status === 'completed').length;
          const processingVideos = videosData.filter(v => v.status === 'processing').length;
          
          setStats({
            totalVideos,
            completedVideos,
            processingVideos,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <img
              src={profile?.profile_img_url || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=random'}
              alt="Profile"
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.name || profile?.username || 'Creator'}!
              </h2>
              <p className="mt-1 text-gray-600">
                Ready to create amazing AI-powered content?
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Video className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Total Videos</h3>
                  <p className="text-3xl font-semibold text-blue-600">{stats.totalVideos}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Completed</h3>
                  <p className="text-3xl font-semibold text-green-600">{stats.completedVideos}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Processing</h3>
                  <p className="text-3xl font-semibold text-orange-600">{stats.processingVideos}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.a
              href="/dashboard/create"
              className="group block p-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white hover:from-purple-600 hover:to-indigo-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <Plus className="h-8 w-8 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold">Create New Content</h3>
                  <p className="text-purple-100 mt-1">Start creating videos and audio content</p>
                </div>
              </div>
            </motion.a>

            <motion.a
              href="/dashboard/my-videos"
              className="group block p-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg text-white hover:from-teal-600 hover:to-cyan-700 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <Video className="h-8 w-8 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold">View My Videos</h3>
                  <p className="text-teal-100 mt-1">Manage and download your created videos</p>
                </div>
              </div>
            </motion.a>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {profile?.status || 'Active'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Display Name</p>
                <p className="font-medium text-gray-900">{profile?.name || 'Not set'}</p>
              </div>
            </div>
            <div className="mt-4">
              <a
                href="/dashboard/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
              >
                Update Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
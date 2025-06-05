import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  created_at: string;
  status: string;
}

const DashboardHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
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
        <div className="px-6 py-8 border-b border-gray-200 bg-indigo-50">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.username || user?.user_metadata?.username || 'Hacker'}!
          </h2>
          <p className="mt-1 text-gray-600">
            Your hackathon dashboard is ready.
          </p>
        </div>
        
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Account Status</h3>
              <div className="mt-2 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Account Created</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-700">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Email</h3>
              <p className="mt-2 text-gray-700 truncate">{profile?.email || user?.email}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Complete your profile information</li>
                <li>Join or create a team for the upcoming hackathon</li>
                <li>Browse available challenges and resources</li>
                <li>Submit your project before the deadline</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;
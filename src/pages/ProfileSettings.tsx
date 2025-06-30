import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CreatorWallet from '../components/CreatorWallet';

interface ProfileFormData {
  name: string;
  profileImage: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  profile_img_url: string | null;
}

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const watchedImage = watch('profileImage');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (watchedImage) {
      setImagePreview(watchedImage);
    }
  }, [watchedImage]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, profile_img_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setValue('name', data.name || '');
      setValue('profileImage', data.profile_img_url || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=random');
      setImagePreview(data.profile_img_url || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=random');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newImageUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomSeed}`;
    setValue('profileImage', newImageUrl);
    setImagePreview(newImageUrl);
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: data.name,
          profile_img_url: data.profileImage,
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to update profile');
        console.error('Error updating profile:', error);
        return;
      }

      toast.success('Profile updated successfully!');
      fetchProfile(); // Refresh profile data
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
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
      className="space-y-8"
    >
      {/* Profile Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 bg-indigo-50">
          <h2 className="text-3xl font-['Abril_Fatface',_cursive] italic text-gray-900">Profile Settings</h2>
          <p className="mt-1 text-gray-600">
            Manage your account information and preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={generateRandomAvatar}
                className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                {...register('profileImage', {
                  required: 'Profile image URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL',
                  },
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
              {errors.profileImage && (
                <p className="mt-1 text-sm text-red-600">{errors.profileImage.message}</p>
              )}
              <button
                type="button"
                onClick={generateRandomAvatar}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                Generate Random Avatar
              </button>
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email address cannot be changed
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Display name is required',
                minLength: {
                  value: 2,
                  message: 'Display name must be at least 2 characters',
                },
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your display name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Creator Wallet Section */}
      <CreatorWallet />
    </motion.div>
  );
};

export default ProfileSettings;
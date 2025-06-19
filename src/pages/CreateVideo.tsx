import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface VideoFormData {
  title: string;
  script: string;
}

const CreateVideo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VideoFormData>();

  const onSubmit = async (data: VideoFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      // First, save the video request to our database
      const { data: videoRecord, error: dbError } = await supabase
        .from('videos')
        .insert([
          {
            user_id: user.id,
            title: data.title,
            script: data.script,
            status: 'processing',
          },
        ])
        .select()
        .single();

      if (dbError) {
        toast.error('Failed to save video request');
        console.error('Database error:', dbError);
        return;
      }

      // Make API request to Tavus
      const response = await fetch('https://api.tavus.io/v1/videos', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer a04908616a2c4a56b2676dec9e888a5e',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_template_id: 'YOUR_TEMPLATE_ID_HERE',
          video_title: data.title,
          video_script: data.script,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Update the video record with the API response
      await supabase
        .from('videos')
        .update({
          status: 'completed',
          video_url: result.video_url || result.download_url || '',
        })
        .eq('id', videoRecord.id);

      toast.success('Video generation request submitted successfully!');
      navigate('/dashboard/my-videos');
    } catch (error) {
      console.error('Error creating video:', error);
      toast.error('Failed to create video. Please try again.');
      
      // Update status to failed if we have a video record
      if (user) {
        await supabase
          .from('videos')
          .update({ status: 'failed' })
          .eq('user_id', user.id)
          .eq('title', data.title);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/create')}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <Video className="h-8 w-8 mr-3 text-purple-600" />
                Create Video
              </h2>
              <p className="mt-1 text-gray-600">
                Generate an AI-powered video with your custom script.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-8 space-y-6">
          {/* Video Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Title *
            </label>
            <input
              type="text"
              {...register('title', {
                required: 'Video title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
                maxLength: {
                  value: 100,
                  message: 'Title must be less than 100 characters',
                },
              })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your video title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Video Script */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Script *
            </label>
            <textarea
              {...register('script', {
                required: 'Video script is required',
                minLength: {
                  value: 10,
                  message: 'Script must be at least 10 characters',
                },
                maxLength: {
                  value: 5000,
                  message: 'Script must be less than 5000 characters',
                },
              })}
              rows={8}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Write your video script here. Be descriptive and engaging..."
            />
            {errors.script && (
              <p className="mt-1 text-sm text-red-600">{errors.script.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Tip: Write a clear, engaging script. The AI will use this to generate your video content.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/create')}
              className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Creating Video...' : 'Create Video'}
            </motion.button>
          </div>
        </form>

        {/* Info Section */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-blue-100 rounded-full p-2">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">How it works</h4>
              <p className="text-sm text-gray-600 mt-1">
                Your video will be generated using AI technology. Processing typically takes 2-5 minutes. 
                You'll be able to view and download your video from the "My Videos" section once it's ready.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateVideo;
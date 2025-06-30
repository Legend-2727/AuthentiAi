import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Video, Calendar, Download, Eye, Trash2, Tag, User, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

interface VideoRecord {
  id: string;
  title: string;
  description?: string;
  script: string;
  video_url: string | null;
  status: string;
  generation_type?: string;
  replica_id?: string;
  replica_type?: string;
  tags?: string[];
  created_at: string;
}

const MyVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user, fetchVideos]);

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        toast.error('Failed to delete video');
        return;
      }

      toast.success('Video deleted successfully');
      fetchVideos(); // Refresh the list
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing' },
      generating: { color: 'bg-purple-100 text-purple-800', text: 'Generating' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

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
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Video className="h-8 w-8 mr-3 text-indigo-600" />
            My Videos
          </h2>
          <p className="mt-1 text-gray-600">
            View and manage all your generated videos.
          </p>
        </div>

        <div className="px-6 py-6">
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't created any videos yet. Start by creating your first video!
              </p>
              <a
                href="/dashboard/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Your First Video
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {videos.map((video) => (
                <motion.div
                  key={video.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
                        {getStatusBadge(video.status)}
                        {video.generation_type && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            video.generation_type === 'personal_replica' ? 'bg-purple-100 text-purple-800' :
                            video.generation_type === 'stock_replica' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {video.generation_type === 'personal_replica' && <User className="h-3 w-3 mr-1" />}
                            {video.generation_type === 'stock_replica' && <Users className="h-3 w-3 mr-1" />}
                            {video.generation_type === 'personal_replica' && 'Personal Replica'}
                            {video.generation_type === 'stock_replica' && 'Stock Replica'}
                            {video.generation_type === 'upload' && 'Uploaded'}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {video.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(video.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      {video.description && (
                        <p className="text-gray-600 text-sm mb-2 font-medium">
                          {video.description}
                        </p>
                      )}

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {video.script}
                      </p>

                      {video.video_url && video.status === 'completed' && (
                        <div className="mb-4">
                          <video
                            controls
                            className="w-full max-w-md rounded-lg"
                            poster="/api/placeholder/400/225"
                          >
                            <source src={video.video_url} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}

                      {video.status === 'processing' && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                            <span className="text-sm text-blue-700">Video is being processed...</span>
                          </div>
                        </div>
                      )}

                      {video.status === 'failed' && (
                        <div className="mb-4 p-4 bg-red-50 rounded-lg">
                          <span className="text-sm text-red-700">
                            Video generation failed. Please try creating a new video.
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {video.video_url && video.status === 'completed' && (
                        <>
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="View video"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <a
                            href={video.video_url}
                            download
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Download video"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </>
                      )}
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyVideos;
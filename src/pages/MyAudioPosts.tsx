import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Calendar, Download, Eye, Trash2, Hash } from 'lucide-react';
import { useAudioPosts } from '../hooks/useAudioPosts';
import { toast } from 'react-toastify';
import AudioPlayer from '../components/AudioPlayer';
import AudioPostInteractions from '../components/AudioPostInteractions';

const MyAudioPosts = () => {
  const { audioPosts, loading, deleteAudioPost } = useAudioPosts();
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this audio post?')) return;

    try {
      await deleteAudioPost(postId);
      toast.success('Audio post deleted successfully');
    } catch (error) {
      console.error('Error deleting audio post:', error);
      toast.error('Failed to delete audio post');
    }
  };

  const downloadAudio = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getGenerationTypeBadge = (type: 'ai' | 'upload') => {
    return type === 'ai' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        AI Generated
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Uploaded
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
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Mic className="h-8 w-8 mr-3 text-purple-600 dark:text-purple-400" />
            My Audio Posts
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            View and manage all your audio content and podcasts.
          </p>
        </div>

        <div className="px-6 py-6">
          {audioPosts.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No audio posts yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You haven't created any audio content yet. Start by creating your first audio post!
              </p>
              <a
                href="/dashboard/create-audio"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
              >
                Create Your First Audio Post
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {audioPosts.map((post) => (
                <motion.div
                  key={post.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{post.title}</h3>
                        {getGenerationTypeBadge(post.generation_type)}
                        <span className="text-sm text-gray-500 dark:text-gray-400">v{post.version}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      {post.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{post.description}</p>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {post.script && (
                        <details className="mb-4">
                          <summary className="cursor-pointer text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                            View Script
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.script}</p>
                          </div>
                        </details>
                      )}

                      {/* Content Hash for Authenticity */}
                      <div className="flex items-center space-x-2 mb-4">
                        <Hash className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Content Hash: {btoa(post.id + post.created_at).substring(0, 16)}
                        </span>
                      </div>

                      {/* Interaction Stats */}
                      <AudioPostInteractions audioPostId={post.id} className="mb-4" />
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                        title="Toggle audio player"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => downloadAudio(post.audio_url, post.title)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        title="Download audio"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete audio post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Audio Player */}
                  {selectedPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AudioPlayer
                        src={post.audio_url}
                        title={post.title}
                        onDownload={() => downloadAudio(post.audio_url, post.title)}
                      />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyAudioPosts;
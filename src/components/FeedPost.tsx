import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Share2, 
  Star,
  Clock,
  Eye,
  Copy,
  ExternalLink,
  Code
} from 'lucide-react';
import { FeedPost as FeedPostType, PostStats } from '../types/feed';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import GiveStarButton from './GiveStarButton';

interface FeedPostProps {
  post: FeedPostType;
  stats: PostStats;
  onReaction: (postId: string, type: '❤️' | '👏' | '🔥' | '🎵') => void;
  onStarDonation: (postId: string, starCount: number, message?: string) => void;
  onComment: () => void;
}

const FeedPost = ({ post, stats, onReaction, onStarDonation, onComment }: FeedPostProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showStarModal, setShowStarModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [starCount, setStarCount] = useState(10);
  const [starMessage, setStarMessage] = useState('');

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleShare = (type: 'copy' | 'external' | 'embed') => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    switch (type) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
      case 'external':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`, '_blank');
        break;
      case 'embed': {
        const embedCode = `<iframe src="${url}/embed" width="400" height="300" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        toast.success('Embed code copied to clipboard!');
        break;
      }
    }
    setShowShareModal(false);
  };

  const handleStarDonation = () => {
    if (starCount < 10) {
      toast.error('Minimum donation is 10 stars');
      return;
    }
    onStarDonation(post.id, starCount, starMessage);
    setShowStarModal(false);
    setStarMessage('');
    toast.success(`Sent ${starCount} stars to ${post.creator.display_name}!`);
  };

  const reactionEmojis = ['❤️', '👏', '🔥', '🎵'] as const;

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={post.creator.profile_img_url}
              alt={post.creator.display_name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{post.creator.display_name}</h3>
                {post.creator.verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{post.creator.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{post.title}</h2>
        {post.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">{post.description}</p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full border border-indigo-200 dark:border-indigo-700 hover:shadow-sm transition-shadow cursor-default"
                title={`Tag: ${tag}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media Player */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
          {post.type === 'video' ? (
            <div className="aspect-video">
              <video
                className="w-full h-full object-cover"
                poster={post.thumbnail_url}
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={post.content_url} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className="p-6 flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <div className="flex justify-between text-white text-sm">
                  <span>1:23</span>
                  <span>{formatDuration(post.duration)}</span>
                </div>
              </div>
              <audio src={post.content_url} controls className="hidden" />
            </div>
          )}
          
          {/* Duration and Type Badge */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {formatDuration(post.duration)}
          </div>
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs capitalize">
            {post.type}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(post.view_count)} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{stats.star_count} stars (${stats.star_value.toFixed(2)})</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-6">
            {/* Reactions */}
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className={`flex items-center space-x-2 transition-colors ${
                  stats.user_reaction 
                    ? 'text-red-500' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                }`}
              >
                {stats.user_reaction ? (
                  <span className="text-lg">{stats.user_reaction}</span>
                ) : (
                  <Heart className="w-5 h-5" />
                )}
                <span>{Object.values(stats.reaction_counts).reduce((a, b) => a + b, 0)}</span>
              </button>
              
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex space-x-2"
                  >
                    {reactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReaction(post.id, emoji);
                          setShowReactions(false);
                        }}
                        className={`text-2xl hover:scale-125 transition-transform ${
                          stats.user_reaction === emoji 
                            ? 'bg-blue-100 dark:bg-blue-900 rounded-lg p-1' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-1'
                        }`}
                      >
                        {emoji}
                        <span className="text-xs block text-gray-500 dark:text-gray-400">
                          {stats.reaction_counts[emoji]}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Comments */}
            <button
              onClick={onComment}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{stats.comment_count}</span>
            </button>

            {/* Share */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Give Star Button */}
          <GiveStarButton 
            creatorId={post.creator.id}
            contentId={post.id}
            onStarGiven={(success) => {
              if (success) {
                toast.success(`Star sent to ${post.creator.display_name}!`);
              }
            }}
            variant="default"
          />
        </div>
      </div>

      {/* Star Donation Modal */}
      <AnimatePresence>
        {showStarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowStarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Send Stars to {post.creator.display_name}</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Stars (min: 10)
                </label>
                <input
                  type="number"
                  min="10"
                  value={starCount}
                  onChange={(e) => setStarCount(parseInt(e.target.value) || 10)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter number of stars (minimum 10)"
                  title="Number of stars to send"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total: ${(starCount * 0.01).toFixed(2)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message (optional)
                </label>
                <textarea
                  value={starMessage}
                  onChange={(e) => setStarMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  placeholder="Leave a message for the creator..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStarModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStarDonation}
                  className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                >
                  Send Stars
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Share this post</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span>Copy link</span>
                </button>
                
                <button
                  onClick={() => handleShare('external')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 text-gray-600" />
                  <span>Share to Twitter</span>
                </button>
                
                <button
                  onClick={() => handleShare('embed')}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Code className="w-5 h-5 text-gray-600" />
                  <span>Copy embed code</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeedPost;
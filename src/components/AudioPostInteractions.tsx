import React, { useState } from 'react';
import { Heart, MessageCircle, Smile, Frown, Eye, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPostInteractions, AudioPostReaction } from '../hooks/useAudioPostInteractions';

interface AudioPostInteractionsProps {
  audioPostId: string;
  className?: string;
}

const reactionEmojis: Record<AudioPostReaction['reaction_type'], { emoji: string; icon: React.ReactNode; color: string }> = {
  like: { emoji: '👍', icon: <ThumbsUp className="h-4 w-4" />, color: 'text-blue-500' },
  love: { emoji: '❤️', icon: <Heart className="h-4 w-4" />, color: 'text-red-500' },
  laugh: { emoji: '😂', icon: <Smile className="h-4 w-4" />, color: 'text-yellow-500' },
  wow: { emoji: '😮', icon: <Eye className="h-4 w-4" />, color: 'text-purple-500' },
  sad: { emoji: '😢', icon: <Frown className="h-4 w-4" />, color: 'text-blue-600' },
  angry: { emoji: '😠', icon: <Frown className="h-4 w-4" />, color: 'text-red-600' }
};

const AudioPostInteractions: React.FC<AudioPostInteractionsProps> = ({ audioPostId, className = '' }) => {
  const { stats, comments, loading, addReaction, addComment } = useAudioPostInteractions(audioPostId);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleReaction = async (reactionType: AudioPostReaction['reaction_type']) => {
    await addReaction(reactionType);
    setShowReactions(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await addComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Stats Display */}
      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
        {/* Reactions */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Heart className="h-4 w-4" />
              <span>{stats.totalReactions}</span>
            </button>

            {/* Reaction Picker */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10"
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                >
                  <div className="flex space-x-2">
                    {Object.entries(reactionEmojis).map(([type, config]) => (
                      <button
                        key={type}
                        onClick={() => handleReaction(type as AudioPostReaction['reaction_type'])}
                        className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors ${
                          stats.userReaction === type ? config.color : ''
                        }`}
                        title={type}
                      >
                        <span className="text-lg">{config.emoji}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Show reaction breakdown if there are reactions */}
          {stats.totalReactions > 0 && (
            <div className="flex items-center space-x-1">
              {Object.entries(stats.reactions).map(([type, count]) => (
                <span key={type} className="text-xs">
                  {reactionEmojis[type as AudioPostReaction['reaction_type']]?.emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comments */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{stats.commentsCount} comments</span>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-3"
          >
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmittingComment}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {comment.user?.name || comment.user?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioPostInteractions;

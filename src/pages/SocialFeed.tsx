import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Heart, Users, Filter } from 'lucide-react';
import { useFeed } from '../hooks/useFeed';
import { SortOption } from '../types/feed';
import FeedPost from '../components/FeedPost';
import CommentSection from '../components/CommentSection';
import { toast } from 'react-toastify';

const SocialFeed = () => {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const { posts, postStats, loading, addReaction, sendStarDonation } = useFeed(sortBy);

  const sortOptions = [
    { value: 'recent' as SortOption, label: 'Most Recent', icon: Clock },
    { value: 'popular' as SortOption, label: 'Most Popular', icon: Heart },
    { value: 'trending' as SortOption, label: 'Trending', icon: TrendingUp },
    { value: 'following' as SortOption, label: 'Following', icon: Users },
  ];

  const handleReaction = async (postId: string, type: '❤️' | '👏' | '🔥' | '🎵') => {
    try {
      await addReaction(postId, type);
      toast.success(`Reacted with ${type}!`);
    } catch (error) {
      toast.error('Failed to add reaction');
    }
  };

  const handleStarDonation = async (postId: string, starCount: number, message?: string) => {
    try {
      await sendStarDonation(postId, starCount, message);
    } catch (error) {
      toast.error('Failed to send star donation');
    }
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
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Creator Feed</h1>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-500">Sort by:</span>
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  sortBy === option.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No posts found</h3>
              <p>Be the first to share some amazing content!</p>
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <FeedPost
              key={post.id}
              post={post}
              stats={postStats[post.id] || {
                reaction_counts: { '❤️': 0, '👏': 0, '🔥': 0, '🎵': 0 },
                comment_count: 0,
                star_count: 0,
                star_value: 0,
              }}
              onReaction={handleReaction}
              onStarDonation={handleStarDonation}
              onComment={() => setSelectedPostForComments(post.id)}
            />
          ))
        )}
      </div>

      {/* Comment Section Modal */}
      {selectedPostForComments && (
        <CommentSection
          postId={selectedPostForComments}
          isOpen={true}
          onClose={() => setSelectedPostForComments(null)}
        />
      )}
    </motion.div>
  );
};

export default SocialFeed;
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Heart, Users, Filter, Search, X, Tag, Lock, Star, Share2 } from 'lucide-react';
import { useFeed } from '../hooks/useFeed';
import { SortOption, FeedPost as FeedPostType } from '../types/feed';
import FeedPost from '../components/FeedPost';
import CommentSection from '../components/CommentSection';
import { toast } from 'react-toastify';
import BuyStarsModal from '../components/BuyStarsModal';
import { useAuth } from '../contexts/AuthContext';
import { processStarTransaction } from '../lib/revenuecat';

const SocialFeed = () => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showPremiumContent, setShowPremiumContent] = useState(false);
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPostForSharing, setSelectedPostForSharing] = useState<FeedPostType | null>(null);
  
  const { posts, postStats, loading, addReaction, sendStarDonation, getAllTags } = useFeed(sortBy, searchTags);

  // Generate some premium content
  const premiumPosts = posts.slice(0, 3).map(post => ({
    ...post,
    isPremium: true,
    unlockPrice: Math.floor(Math.random() * 20) + 10, // 10-30 stars
    isUnlocked: false
  }));

  // Generate some shared posts (with original creators)
  const sharedPosts = posts.slice(3, 6).map(post => {
    // Create a different creator as the "original" creator
    const randomIndex = Math.floor(Math.random() * posts.length);
    const originalCreator = posts[randomIndex].creator;
    
    return {
      post,
      originalCreator: {
        id: originalCreator.id,
        username: originalCreator.username,
        displayName: originalCreator.display_name
      }
    };
  });

  useEffect(() => {
    if (getAllTags) {
      setAvailableTags(getAllTags());
    }
  }, [getAllTags]);

  const sortOptions = [
    { value: 'recent' as SortOption, label: 'Most Recent', icon: Clock },
    { value: 'popular' as SortOption, label: 'Most Popular', icon: Heart },
    { value: 'trending' as SortOption, label: 'Trending', icon: TrendingUp },
    { value: 'following' as SortOption, label: 'Following', icon: Users },
  ];

  const handleAddTag = (tag: string) => {
    if (tag && !searchTags.includes(tag)) {
      setSearchTags([...searchTags, tag]);
    }
    setSearchInput('');
    setShowTagSearch(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setShowTagSearch(value.length > 0);
  };

  const filteredAvailableTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchInput.toLowerCase()) &&
    !searchTags.includes(tag)
  );

  const handleReaction = async (postId: string, type: '❤️' | '👏' | '🔥' | '🎵') => {
    try {
      await addReaction(postId, type);
      toast.success(`Reacted with ${type}!`);
    } catch {
      toast.error('Failed to add reaction');
    }
  };

  const handleStarDonation = async (postId: string, starCount: number, message?: string) => {
    try {
      await sendStarDonation(postId, starCount, message);
    } catch {
      toast.error('Failed to send star donation');
    }
  };

  const unlockPremiumContent = async (postId: string, price: number) => {
    if (!user) {
      toast.error('You must be logged in to unlock premium content');
      return;
    }
    
    try {
      // Find the post and its creator
      const post = premiumPosts.find(p => p.id === postId);
      if (!post) {
        toast.error('Content not found');
        return;
      }
      
      // Process the transaction
      const result = await processStarTransaction(
        user.id,
        post.creator.id,
        price,
        postId,
        post.type,
        'Premium content unlock'
      );
      
      if (result.success) {
        toast.success(`Unlocked premium content for ${price} stars!`);
        
        // Update the premium posts to mark this one as unlocked
        premiumPosts.forEach(post => {
          if (post.id === postId) {
            post.isUnlocked = true;
          }
        });
      } else {
        toast.error(result.error || 'Failed to unlock content');
      }
    } catch (error) {
      console.error('Error unlocking premium content:', error);
      toast.error('An error occurred while unlocking content');
    }
  };

  const handleSharePost = (post: FeedPostType) => {
    setSelectedPostForSharing(post);
    setShowShareModal(true);
  };

  const sharePost = async () => {
    if (!user || !selectedPostForSharing) return;
    
    try {
      // In a real app, this would create a new shared post in the database
      // For now, we'll just show a success message
      toast.success(`Post shared to your feed! You'll earn 20% of all stars it receives.`);
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error('Failed to share post');
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-['Abril_Fatface',_cursive] italic text-gray-900 dark:text-white">Creator Feed</h1>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Filters:</span>
          </div>
        </div>
        
        {/* Tag Search Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Search by Tags:</span>
          </div>
          
          {/* Selected Tags */}
          {searchTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {searchTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                    title={`Remove ${tag} tag`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {/* Tag Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tags (e.g., AI, Music, Education)..."
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Tag Suggestions */}
            <AnimatePresence>
              {showTagSearch && filteredAvailableTags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  {filteredAvailableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <span className="font-medium">{tag}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
        </div>
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
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Premium Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-['Abril_Fatface',_cursive] italic text-gray-900 dark:text-white">Premium Content</h2>
          <button
            onClick={() => setShowPremiumContent(!showPremiumContent)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-600 transition-colors"
          >
            {showPremiumContent ? 'Hide Premium' : 'Show Premium'}
          </button>
        </div>
        
        <AnimatePresence>
          {showPremiumContent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {premiumPosts.map((post) => (
                <div key={post.id} className="relative rounded-lg overflow-hidden border border-yellow-300 dark:border-yellow-700">
                  {/* Blurred Content */}
                  <div className={`relative ${post.isUnlocked ? '' : 'filter blur-lg'}`}>
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                      <img 
                        src={post.thumbnail_url || 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-2">{post.description}</p>
                    </div>
                  </div>
                  
                  {/* Unlock Overlay */}
                  {!post.isUnlocked && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
                      <Lock className="w-12 h-12 text-yellow-400 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
                      <p className="text-gray-300 mb-4">Unlock this exclusive content to view it in full quality</p>
                      <button
                        onClick={() => unlockPremiumContent(post.id, post.unlockPrice)}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-colors"
                      >
                        <Star className="w-5 h-5 mr-2 fill-current" />
                        Unlock for {post.unlockPrice} Stars
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-['Abril_Fatface',_cursive] italic text-gray-900 dark:text-white">Shared Content</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
            80/20 Star Split
          </div>
        </div>
        
        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
          <p className="text-sm text-indigo-800 dark:text-indigo-200">
            <strong>How shared content works:</strong> When you give stars to shared content, 80% goes to the original creator and 20% goes to the person who shared it. This rewards both original creation and content curation.
          </p>
        </div>
        
        <div className="space-y-6">
          {sharedPosts.map(({ post, originalCreator }) => (
            <FeedPost
              key={`shared-${post.id}`}
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
              isShared={true}
              originalCreator={originalCreator}
            />
          ))}
        </div>
      </div>

      {/* Regular Feed */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
            <div className="text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                {searchTags.length > 0 ? 'No posts found with selected tags' : 'No posts found'}
              </h3>
              <p>
                {searchTags.length > 0 
                  ? 'Try removing some tags or searching for different ones.' 
                  : 'Be the first to share some amazing content!'
                }
              </p>
              {searchTags.length > 0 && (
                <button
                  onClick={() => setSearchTags([])}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear all tags
                </button>
              )}
            </div>
          </div>
        ) : (
          posts.slice(0, 3).map((post) => (
            <div key={post.id} className="relative">
              <FeedPost
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
              
              {/* Share Button (Floating) */}
              <button
                onClick={() => handleSharePost(post)}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Share this post (earn 20% of stars)"
              >
                <Share2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
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

      {/* Buy Stars Modal */}
      <BuyStarsModal 
        isOpen={showBuyStarsModal}
        onClose={() => setShowBuyStarsModal(false)}
      />
      
      {/* Share Post Modal */}
      <AnimatePresence>
        {showShareModal && selectedPostForSharing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share this post</h3>
              
              <div className="mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/50 mb-4">
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    <strong>Earn stars by sharing!</strong> When you share content, you'll receive 20% of all stars given to this post, while the original creator gets 80%.
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={selectedPostForSharing.thumbnail_url || 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'}
                    alt={selectedPostForSharing.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{selectedPostForSharing.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      By {selectedPostForSharing.creator.display_name}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={sharePost}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share to My Feed</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/post/${selectedPostForSharing.id}`);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                By sharing, you help creators reach a wider audience while earning stars yourself!
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SocialFeed;
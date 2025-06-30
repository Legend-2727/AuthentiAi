import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Heart, Users, Filter, Search, X, Tag, Lock, Star } from 'lucide-react';
import { useFeed } from '../hooks/useFeed';
import { SortOption } from '../types/feed';
import FeedPost from '../components/FeedPost';
import CommentSection from '../components/CommentSection';
import { toast } from 'react-toastify';
import BuyStarsModal from '../components/BuyStarsModal';

const SocialFeed = () => {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showPremiumContent, setShowPremiumContent] = useState(false);
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false);
  
  const { posts, postStats, loading, addReaction, sendStarDonation, getAllTags } = useFeed(sortBy, searchTags);

  // Generate some premium content
  const premiumPosts = posts.slice(0, 3).map(post => ({
    ...post,
    isPremium: true,
    unlockPrice: Math.floor(Math.random() * 20) + 10, // 10-30 stars
    isUnlocked: false
  }));

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

  const unlockPremiumContent = (postId: string, price: number) => {
    // In a real app, this would make a backend call to process the payment
    // For now, we'll just simulate it
    toast.success(`Unlocked premium content for ${price} stars!`);
    
    // Update the premium posts to mark this one as unlocked
    premiumPosts.forEach(post => {
      if (post.id === postId) {
        post.isUnlocked = true;
      }
    });
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

      {/* Buy Stars Modal */}
      <BuyStarsModal 
        isOpen={showBuyStarsModal}
        onClose={() => setShowBuyStarsModal(false)}
      />
    </motion.div>
  );
};

// Custom blockchain shield logo component with cursive X
const BlockchainShieldLogo: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const mainColor = isDark ? '#fff' : '#000';
  const accentColor = isDark ? '#818cf8' : '#4f46e5';
  
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield Base */}
      <path 
        d="M20 3L5 9V20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20V9L20 3Z" 
        stroke={mainColor} 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Blockchain Nodes */}
      <circle cx="14" cy="16" r="2" fill={accentColor} />
      <circle cx="20" cy="22" r="2" fill={accentColor} />
      <circle cx="26" cy="16" r="2" fill={accentColor} />
      <circle cx="14" cy="28" r="2" fill={accentColor} />
      <circle cx="26" cy="28" r="2" fill={accentColor} />
      
      {/* Blockchain Connections */}
      <line x1="14" y1="16" x2="20" y2="22" stroke={accentColor} strokeWidth="1" />
      <line x1="20" y1="22" x2="26" y2="16" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="16" x2="26" y2="16" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="28" x2="20" y2="22" stroke={accentColor} strokeWidth="1" />
      <line x1="20" y1="22" x2="26" y2="28" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="28" x2="26" y2="28" stroke={accentColor} strokeWidth="1" />
      
      {/* Cursive X in the center */}
      <path 
        d="M17 19C18 20 19 21 20 22C21 21 22 20 23 19" 
        stroke={mainColor} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        fill="none"
      />
      <path 
        d="M23 25C22 24 21 23 20 22C19 23 18 24 17 25" 
        stroke={mainColor} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        fill="none"
      />
    </svg>
  );
};

export default SocialFeed;
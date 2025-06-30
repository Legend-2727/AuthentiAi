import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Filter, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PremiumContentCard from '../components/PremiumContentCard';
import BuyStarsModal from '../components/BuyStarsModal';
import { getStarBalance } from '../lib/revenuecat';

// Sample premium content data
const samplePremiumContent = [
  {
    id: 'premium-1',
    title: 'Advanced AI Voice Techniques',
    description: 'Exclusive tutorial on creating ultra-realistic AI voices with advanced ElevenLabs techniques',
    thumbnailUrl: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    contentUrl: '#',
    contentType: 'video' as const,
    creatorName: 'Voice Master',
    creatorId: 'creator-1',
    unlockPrice: 25
  },
  {
    id: 'premium-2',
    title: 'Blockchain Authentication Masterclass',
    description: 'Learn how to implement blockchain verification for your own content platform',
    thumbnailUrl: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    contentUrl: '#',
    contentType: 'video' as const,
    creatorName: 'Crypto Expert',
    creatorId: 'creator-2',
    unlockPrice: 30
  },
  {
    id: 'premium-3',
    title: 'Exclusive Podcast: Future of AI Content',
    description: 'Interview with leading AI researchers discussing the future of content creation',
    thumbnailUrl: 'https://images.pexels.com/photos/3771074/pexels-photo-3771074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    contentUrl: '#',
    contentType: 'audio' as const,
    creatorName: 'Tech Insights',
    creatorId: 'creator-3',
    unlockPrice: 15
  },
  {
    id: 'premium-4',
    title: 'Professional Video Editing Techniques',
    description: 'Learn how to edit AI-generated videos to achieve professional quality results',
    thumbnailUrl: 'https://images.pexels.com/photos/2773498/pexels-photo-2773498.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    contentUrl: '#',
    contentType: 'video' as const,
    creatorName: 'Video Pro',
    creatorId: 'creator-4',
    unlockPrice: 20
  },
  {
    id: 'premium-5',
    title: 'Exclusive Music Production Tutorial',
    description: 'Create professional soundtracks for your videos with this comprehensive guide',
    thumbnailUrl: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    contentUrl: '#',
    contentType: 'audio' as const,
    creatorName: 'Audio Master',
    creatorId: 'creator-5',
    unlockPrice: 18
  }
];

const PremiumContent = () => {
  const { user } = useAuth();
  const [premiumContent, setPremiumContent] = useState(samplePremiumContent);
  const [filteredContent, setFilteredContent] = useState(samplePremiumContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'none'>('none');
  const [starBalance, setStarBalance] = useState(0);
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false);

  useEffect(() => {
    // Get initial star balance
    setStarBalance(getStarBalance());
    
    // Listen for balance updates
    const handleBalanceUpdate = () => {
      setStarBalance(getStarBalance());
    };
    
    window.addEventListener('starsBalanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('starsBalanceUpdated', handleBalanceUpdate);
    };
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...premiumContent];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => item.title.toLowerCase().includes(query) || 
                item.description.toLowerCase().includes(query) ||
                item.creatorName.toLowerCase().includes(query)
      );
    }
    
    // Filter by content type
    if (contentTypeFilter !== 'all') {
      result = result.filter(item => item.contentType === contentTypeFilter);
    }
    
    // Apply price sorting
    if (priceSort === 'asc') {
      result.sort((a, b) => a.unlockPrice - b.unlockPrice);
    } else if (priceSort === 'desc') {
      result.sort((a, b) => b.unlockPrice - a.unlockPrice);
    }
    
    setFilteredContent(result);
  }, [premiumContent, searchQuery, contentTypeFilter, priceSort]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-['Abril_Fatface',_cursive] italic text-gray-900 dark:text-white mb-2">Premium Content</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Exclusive content available for star purchases
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {starBalance}
              </span>
            </div>
            
            <button
              onClick={() => setShowBuyStarsModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              Buy Stars
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search premium content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Content Type Filter */}
          <div>
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as 'all' | 'video' | 'audio')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="video">Videos Only</option>
              <option value="audio">Audio Only</option>
            </select>
          </div>
          
          {/* Price Sort */}
          <div>
            <select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value as 'asc' | 'desc' | 'none')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="none">Sort by Price</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Content Grid */}
      {filteredContent.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-12 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No premium content found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your filters or search query
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setContentTypeFilter('all');
              setPriceSort('none');
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <PremiumContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              thumbnailUrl={item.thumbnailUrl}
              contentUrl={item.contentUrl}
              contentType={item.contentType}
              creatorName={item.creatorName}
              creatorId={item.creatorId}
              unlockPrice={item.unlockPrice}
            />
          ))}
        </div>
      )}
      
      {/* Buy Stars Modal */}
      <BuyStarsModal 
        isOpen={showBuyStarsModal}
        onClose={() => setShowBuyStarsModal(false)}
      />
    </motion.div>
  );
};

export default PremiumContent;
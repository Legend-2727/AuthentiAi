import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Eye, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { getStarBalance, processStarTransaction } from '../lib/revenuecat';
import BuyStarsModal from './BuyStarsModal';
import { useAuth } from '../contexts/AuthContext';

interface PremiumContentCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  contentType: 'video' | 'audio';
  creatorName: string;
  creatorId: string;
  unlockPrice: number;
}

const PremiumContentCard: React.FC<PremiumContentCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  contentUrl,
  contentType,
  creatorName,
  creatorId,
  unlockPrice
}) => {
  const { user } = useAuth();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false);

  // Check if this content is already unlocked
  React.useEffect(() => {
    const unlockedContent = localStorage.getItem(`unlocked_content_${id}`);
    if (unlockedContent === 'true') {
      setIsUnlocked(true);
    }
  }, [id]);

  const handleUnlock = async () => {
    if (!user) {
      toast.error('You must be logged in to unlock premium content');
      return;
    }
    
    setIsUnlocking(true);
    
    try {
      const currentBalance = getStarBalance();
      
      if (currentBalance < unlockPrice) {
        toast.error(`Insufficient stars! You need ${unlockPrice} stars but only have ${currentBalance}.`);
        setShowBuyStarsModal(true);
        return;
      }
      
      // Process the transaction
      const success = await processStarTransaction({
        fromUserId: user.id,
        toUserId: creatorId,
        amount: unlockPrice,
        type: 'content_unlock',
        metadata: {
          contentId: id,
          contentTitle: title,
          contentType
        }
      });
      
      if (success) {
        setIsUnlocked(true);
        localStorage.setItem(`unlocked_content_${id}`, 'true');
        toast.success(`Content unlocked! ${unlockPrice} stars sent to ${creatorName}`);
      } else {
        toast.error('Failed to unlock content. Please try again.');
      }
    } catch (error) {
      console.error('Error unlocking content:', error);
      toast.error('An error occurred while unlocking content');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Content Preview */}
      <div className="relative">
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img 
            src={thumbnailUrl || 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              !isUnlocked ? 'blur-lg scale-105' : 'blur-0 scale-100'
            }`}
          />
          
          {/* Content Type Badge */}
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs uppercase">
            {contentType}
          </div>
        </div>
        
        {/* Premium Unlock Overlay - Only visible when locked */}
        {!isUnlocked && (
          <motion.div 
            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Lock className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
            <p className="text-gray-300 mb-4">Unlock this exclusive content to view it in full quality</p>
            <button
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-colors disabled:opacity-50"
            >
              {isUnlocking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Unlocking...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 mr-2 fill-current" />
                  Unlock for {unlockPrice} Stars
                </>
              )}
            </button>
          </motion.div>
        )}
        
        {/* Success Message - Shows briefly after unlock */}
        {isUnlocked && (
          <motion.div 
            className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            ✓ Unlocked!
          </motion.div>
        )}
      </div>
      
      {/* Content Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            By <span className="font-medium text-indigo-600 dark:text-indigo-400">{creatorName}</span>
          </div>
          
          {isUnlocked && (
            <div className="flex space-x-2">
              <a
                href={contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                title="View content"
              >
                <Eye className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Buy Stars Modal */}
      <BuyStarsModal 
        isOpen={showBuyStarsModal}
        onClose={() => setShowBuyStarsModal(false)}
      />
    </motion.div>
  );
};

export default PremiumContentCard;

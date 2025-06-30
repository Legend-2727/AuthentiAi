import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Eye, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { getStarBalance, spendStar } from '../lib/revenuecat';
import BuyStarsModal from './BuyStarsModal';

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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showBuyStarsModal, setShowBuyStarsModal] = useState(false);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    
    try {
      // Check if user has enough stars
      const currentBalance = getStarBalance();
      
      if (currentBalance < unlockPrice) {
        toast.error(`Not enough stars. You need ${unlockPrice} stars to unlock this content.`);
        setShowBuyStarsModal(true);
        return;
      }
      
      // Simulate backend transaction
      // In a real app, this would be a call to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Spend stars
      for (let i = 0; i < unlockPrice; i++) {
        spendStar();
      }
      
      // Mark as unlocked
      setIsUnlocked(true);
      toast.success(`Content unlocked! ${unlockPrice} stars sent to ${creatorName}.`);
      
      // In a real app, you would also record this transaction in your database
      console.log(`Transaction: ${unlockPrice} stars from user to ${creatorId} for content ${id}`);
      
    } catch (error) {
      console.error('Error unlocking content:', error);
      toast.error('Failed to unlock content. Please try again.');
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
        <div className={`aspect-video bg-gray-200 dark:bg-gray-700 ${!isUnlocked ? 'filter blur-md' : ''}`}>
          <img 
            src={thumbnailUrl || 'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'} 
            alt={title}
            className="w-full h-full object-cover"
          />
          
          {/* Content Type Badge */}
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs uppercase">
            {contentType}
          </div>
        </div>
        
        {/* Lock Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Premium Content</h3>
            <p className="text-gray-300 mb-4">Unlock this exclusive content for {unlockPrice} stars</p>
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
                  Unlock Now
                </>
              )}
            </button>
          </div>
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
              <a
                href={contentUrl}
                download
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                title="Download content"
              >
                <Download className="h-4 w-4" />
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
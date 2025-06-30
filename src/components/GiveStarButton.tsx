import { useState } from 'react';
import { Star } from 'lucide-react';
import { spendStar, getStarBalance } from '../lib/revenuecat';
import BuyStarsModal from './BuyStarsModal';

interface GiveStarButtonProps {
  creatorId?: string;
  contentId?: string;
  onStarGiven?: (success: boolean) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
}

const GiveStarButton = ({ 
  creatorId, 
  contentId, 
  onStarGiven, 
  className = '',
  variant = 'default'
}: GiveStarButtonProps) => {
  const [isGiving, setIsGiving] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleGiveStar = async () => {
    try {
      setIsGiving(true);
      
      // Check if user has stars
      const currentBalance = getStarBalance();
      
      if (currentBalance === 0) {
        // Show buy stars modal
        setShowBuyModal(true);
        onStarGiven?.(false);
        return;
      }

      // Spend a star
      const success = spendStar();
      
      if (success) {
        console.log(`Star given to creator ${creatorId} for content ${contentId}`);
        
        // Here you would normally send the star to the backend/creator
        // For now, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onStarGiven?.(true);
      } else {
        // Shouldn't happen if we checked balance, but just in case
        setShowBuyModal(true);
        onStarGiven?.(false);
      }
    } catch (error) {
      console.error('Failed to give star:', error);
      onStarGiven?.(false);
    } finally {
      setIsGiving(false);
    }
  };

  // Variant styles
  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500";
    
    switch (variant) {
      case 'compact':
        return `${baseStyles} px-3 py-1.5 text-sm rounded-full space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-sm hover:shadow-md`;
      
      case 'icon-only':
        return `${baseStyles} p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-sm hover:shadow-md`;
      
      default:
        return `${baseStyles} px-4 py-2 text-sm rounded-xl space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-md hover:shadow-lg`;
    }
  };

  const getStarIconSize = () => {
    switch (variant) {
      case 'compact':
      case 'icon-only':
        return "w-4 h-4";
      default:
        return "w-5 h-5";
    }
  };

  return (
    <>
      <button
        onClick={handleGiveStar}
        disabled={isGiving}
        className={`${getButtonStyles()} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Give a star to this creator"
      >
        {isGiving ? (
          <>
            <Star className={`${getStarIconSize()} animate-pulse`} />
            {variant !== 'icon-only' && <span>Giving...</span>}
          </>
        ) : (
          <>
            <Star className={`${getStarIconSize()} fill-current`} />
            {variant === 'default' && <span>Give Star</span>}
            {variant === 'compact' && <span>Star</span>}
          </>
        )}
      </button>

      <BuyStarsModal 
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
      />
    </>
  );
};

export default GiveStarButton;

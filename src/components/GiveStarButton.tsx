import { useState } from 'react';
import { Star } from 'lucide-react';
import { spendStar, getStarBalance, processStarTransaction } from '../lib/revenuecat';
import BuyStarsModal from './BuyStarsModal';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface GiveStarButtonProps {
  creatorId?: string;
  contentId?: string;
  contentType?: string;
  onStarGiven?: (success: boolean) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  isSharedContent?: boolean;
  originalCreatorId?: string;
}

const GiveStarButton = ({ 
  creatorId, 
  contentId, 
  contentType = 'post',
  onStarGiven, 
  className = '',
  variant = 'default',
  isSharedContent = false,
  originalCreatorId
}: GiveStarButtonProps) => {
  const { user } = useAuth();
  const [isGiving, setIsGiving] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const handleGiveStar = async () => {
    if (!user) {
      toast.error('You must be logged in to give stars');
      onStarGiven?.(false);
      return;
    }
    
    if (!creatorId) {
      toast.error('Creator information is missing');
      onStarGiven?.(false);
      return;
    }
    
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

      // Process the star transaction with 80/20 split if shared content
      if (isSharedContent && originalCreatorId) {
        const result = await processStarTransaction(
          user.id,
          creatorId,
          1, // Just 1 star for the simple button
          contentId,
          contentType,
          undefined, // No message for simple button
          true,
          originalCreatorId
        );
        
        if (result.success) {
          onStarGiven?.(true);
        } else {
          toast.error(result.error || 'Failed to give star');
          onStarGiven?.(false);
        }
      } else {
        // Regular star transaction (no split)
        const result = await processStarTransaction(
          user.id,
          creatorId,
          1,
          contentId,
          contentType
        );
        
        if (result.success) {
          onStarGiven?.(true);
        } else {
          toast.error(result.error || 'Failed to give star');
          onStarGiven?.(false);
        }
      }
    } catch (error) {
      console.error('Failed to give star:', error);
      toast.error('An error occurred while giving star');
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
        title={isSharedContent && originalCreatorId 
          ? "Give a star (80% to original creator, 20% to sharer)" 
          : "Give a star to this creator"}
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
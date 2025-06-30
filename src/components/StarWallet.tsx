import { useState, useEffect } from 'react';
import { Star, Plus } from 'lucide-react';
import { getStarBalance } from '../lib/revenuecat';

interface StarWalletProps {
  onBuyStars?: () => void;
  className?: string;
}

const StarWallet = ({ onBuyStars, className = '' }: StarWalletProps) => {
  const [starBalance, setStarBalance] = useState(0);

  useEffect(() => {
    // Initial balance load
    setStarBalance(getStarBalance());

    // Listen for balance updates
    const handleBalanceUpdate = (event: CustomEvent) => {
      setStarBalance(event.detail || getStarBalance());
    };

    window.addEventListener('starsBalanceUpdated', handleBalanceUpdate as EventListener);

    return () => {
      window.removeEventListener('starsBalanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, []);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-700">
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {starBalance.toLocaleString()}
        </span>
      </div>
      
      {onBuyStars && (
        <button
          onClick={onBuyStars}
          className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-full text-white text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          title="Buy more stars"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Buy Stars</span>
        </button>
      )}
    </div>
  );
};

export default StarWallet;

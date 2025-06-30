import React from 'react';
import { useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import StarWallet from './StarWallet';
import BuyStarsModal from './BuyStarsModal';
import BoltBadge from './BoltBadge';
import UserAvatar from './UserAvatar';
import { useAuth } from '../contexts/AuthContext';

const TopBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [showBuyStarsModal, setShowBuyStarsModal] = React.useState(false);
  
  // Don't show on login page
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      {/* Bolt.new Badge - Fixed Top Right Corner */}
      <div className="absolute top-2 right-2 z-50">
        <BoltBadge size="lg" />
      </div>
      
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left side - User Profile Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0 max-w-xs md:max-w-sm">
          {user && (
            <>
              <UserAvatar user={user} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user.user_metadata?.username || user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                  {user.email}
                </p>
              </div>
            </>
          )}
        </div>
        
        {/* Center logo */}
        <div className="flex items-center flex-shrink-0 mx-2 md:mx-4">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
            <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <span className="text-lg md:text-xl font-['Abril_Fatface',_cursive] italic bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursive-flow">
            Veridica
          </span>
        </div>
        
        {/* Right side with star wallet - positioned to avoid badge */}
        <div className="flex-1 flex justify-end items-center pr-12 md:pr-16 min-w-0 max-w-xs md:max-w-sm">
          <StarWallet onBuyStars={() => setShowBuyStarsModal(true)} />
        </div>
      </div>
      
      {/* Buy Stars Modal */}
      <BuyStarsModal 
        isOpen={showBuyStarsModal}
        onClose={() => setShowBuyStarsModal(false)}
      />
    </div>
  );
};

export default TopBar;
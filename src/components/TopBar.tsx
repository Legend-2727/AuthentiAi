import React from 'react';
import { useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import StarWallet from './StarWallet';
import BuyStarsModal from './BuyStarsModal';

const TopBar: React.FC = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  const [showBuyStarsModal, setShowBuyStarsModal] = React.useState(false);
  
  // Don't show on login page
  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/forgot-password') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex-1"></div> {/* Left spacer */}
        
        {/* Center logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-['Abril_Fatface',_cursive] italic bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursive-flow">
            Veridica
          </span>
        </div>
        
        {/* Right side with star wallet */}
        <div className="flex-1 flex justify-end">
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
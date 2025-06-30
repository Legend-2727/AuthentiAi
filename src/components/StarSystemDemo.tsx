import { useState, useEffect } from 'react';
import { Star, Gift, Coins, CreditCard, CheckCircle, Bug } from 'lucide-react';
import { getStarBalance, setStarBalance, debugRevenueCat } from '../lib/revenuecat';
import StarWallet from '../components/StarWallet';
import GiveStarButton from '../components/GiveStarButton';
import BuyStarsModal from '../components/BuyStarsModal';

const StarSystemDemo = () => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [demoStarCount, setDemoStarCount] = useState(0);

  useEffect(() => {
    setDemoStarCount(getStarBalance());
    
    const handleBalanceUpdate = () => {
      setDemoStarCount(getStarBalance());
    };

    window.addEventListener('starsBalanceUpdated', handleBalanceUpdate);
    return () => window.removeEventListener('starsBalanceUpdated', handleBalanceUpdate);
  }, []);

  const addDemoStars = (amount: number) => {
    const current = getStarBalance();
    setStarBalance(current + amount);
  };

  // Debug function to check environment variables
  const checkEnvironment = () => {
    console.log('=== ENVIRONMENT DEBUG ===');
    console.log('VITE_REVENUECAT_PUBLIC_KEY:', import.meta.env.VITE_REVENUECAT_PUBLIC_KEY);
    console.log('All VITE env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    console.log('Raw import.meta.env:', import.meta.env);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Star className="w-7 h-7 text-white fill-current" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Veridica Star System
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Support creators with RevenueCat-powered star purchases
        </p>
      </div>

      {/* Current Star Balance */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Your Star Wallet
            </h2>
            <StarWallet onBuyStars={() => setShowBuyModal(true)} />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
              {demoStarCount}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Stars Available
            </div>
          </div>
        </div>
      </div>

      {/* Demo Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Give Star Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-500" />
            Give Stars to Creators
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try giving a star to a demo creator. If you have 0 stars, you'll be prompted to buy more.
          </p>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                DC
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Demo Creator</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">@democreator</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              "Amazing AI-generated audio content with blockchain verification!"
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Demo Content</span>
              <GiveStarButton 
                creatorId="demo-creator-1"
                contentId="demo-content-1"
                onStarGiven={(success) => {
                  if (success) {
                    console.log('Star given successfully!');
                  }
                }}
                variant="compact"
              />
            </div>
          </div>
        </div>

        {/* Buy Stars Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-green-500" />
            Purchase Star Packages
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Buy star packages using RevenueCat and Stripe integration.
          </p>
          
          <button
            onClick={() => setShowBuyModal(true)}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Open Star Store
          </button>
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            <p>• Real Stripe payments (when configured)</p>
            <p>• Mock purchases for development</p>
            <p>• Instant balance updates</p>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-blue-500" />
          Demo Controls
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          For testing purposes, you can manually add stars to your wallet:
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => addDemoStars(10)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            +10 Stars
          </button>
          <button
            onClick={() => addDemoStars(50)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            +50 Stars
          </button>
          <button
            onClick={() => setStarBalance(0)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Reset to 0
          </button>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Integration Complete!
          </h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Implemented Features:</h4>
            <ul className="text-green-700 dark:text-green-300 space-y-1">
              <li>• RevenueCat Web SDK integration</li>
              <li>• Star wallet with real-time balance</li>
              <li>• Give star functionality</li>
              <li>• Buy stars modal with packages</li>
              <li>• Mock mode for development</li>
              <li>• Mobile responsive design</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">🔧 Ready for Production:</h4>
            <ul className="text-green-700 dark:text-green-300 space-y-1">
              <li>• Add RevenueCat API key to .env</li>
              <li>• Configure Stripe products</li>
              <li>• Set up RevenueCat dashboard</li>
              <li>• Test real payments</li>
              <li>• Deploy to production</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Debug Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bug className="w-5 h-5 mr-2 text-blue-500" />
          RevenueCat Debug Info
        </h3>
        <button
          onClick={() => {
            checkEnvironment();
            const debug = debugRevenueCat();
            console.log('RevenueCat Debug Info:', debug);
            alert(`Check console for debug info. Key: ${debug.apiKey ? debug.apiKey.substring(0, 10) + '...' : 'Not set'}`);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Bug className="w-4 h-4" />
          <span>Debug RevenueCat</span>
        </button>
      </div>

      <BuyStarsModal 
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
      />
    </div>
  );
};

export default StarSystemDemo;

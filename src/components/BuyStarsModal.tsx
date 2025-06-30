import { useState, useEffect } from 'react';
import { X, Star, CreditCard, Check, Loader2 } from 'lucide-react';
import { getStarPackages, purchaseStarPackage, type StarPackage, type PurchaseResult } from '../lib/revenuecat';

interface BuyStarsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BuyStarsModal = ({ isOpen, onClose }: BuyStarsModalProps) => {
  const [packages, setPackages] = useState<StarPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStarPackages();
    }
  }, [isOpen]);

  const loadStarPackages = async () => {
    try {
      setLoading(true);
      
      // Debug environment
      console.log('=== PURCHASE DEBUG ===');
      console.log('Environment check:', import.meta.env.VITE_REVENUECAT_PUBLIC_KEY);
      console.log('Environment type:', typeof import.meta.env.VITE_REVENUECAT_PUBLIC_KEY);
      console.log('Environment length:', import.meta.env.VITE_REVENUECAT_PUBLIC_KEY?.length);
      
      // Check exact values
      const key = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
      console.log('Exact key match check:');
      console.log('- Is production key?:', key === 'rcb_nxFaEtdIxcXFtxLKnIAUHGfwVyOq');
      console.log('- Is sandbox key?:', key === 'rcb_sb_tnaXRWTYEDSfqrrioYhfzRKVU');
      console.log('- Is old placeholder?:', key === 'your_actual_revenuecat_web_api_key_here');
      console.log('- Raw key value:', JSON.stringify(key));
      
      console.log('BuyStarsModal: Loading star packages...');
      const starPackages = await getStarPackages();
      console.log('BuyStarsModal: Loaded packages:', starPackages);
      console.log('Package count:', starPackages.length);
      console.log('First package:', starPackages[0]);
      
      setPackages(starPackages);
    } catch (error) {
      console.error('Failed to load star packages:', error);
      setErrorMessage('Failed to load star packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasing(packageId);
      setErrorMessage(null);
      setSuccessMessage(null);

      const result: PurchaseResult = await purchaseStarPackage(packageId);
      
      if (result.success) {
        const pkg = packages.find(p => p.identifier === packageId);
        const starCount = pkg?.product.title.match(/\d+/)?.[0] || '0';
        setSuccessMessage(`Successfully purchased ${starCount} stars!`);
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          setSuccessMessage(null);
        }, 2000);
      } else if (result.cancelled) {
        // User cancelled, don't show error
        console.log('Purchase cancelled by user');
      } else {
        setErrorMessage('Purchase failed. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setErrorMessage('Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const getStarCountFromPackage = (packageId: string): number => {
    return parseInt(packageId.replace('stars_', '')) || 0;
  };

  const getBestValuePackage = (): string | null => {
    if (packages.length === 0) return null;
    
    // Calculate value (stars per dollar) for each package
    const values = packages.map(pkg => ({
      identifier: pkg.identifier,
      value: getStarCountFromPackage(pkg.identifier) / pkg.product.price
    }));
    
    // Find the package with the highest value
    const bestValue = values.reduce((best, current) => 
      current.value > best.value ? current : best
    );
    
    return bestValue.identifier;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buy Stars</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Support creators with stars</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                {successMessage}
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl">
              <span className="text-red-800 dark:text-red-200 text-sm font-medium">
                {errorMessage}
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            /* Package Options */
            <div className="space-y-3">
              {packages.map((pkg) => {
                const bestValue = getBestValuePackage();
                const isBestValue = pkg.identifier === bestValue;
                const starCount = getStarCountFromPackage(pkg.identifier);
                const isPurchasing = purchasing === pkg.identifier;

                return (
                  <div
                    key={pkg.identifier}
                    className={`relative p-4 border-2 rounded-xl transition-all duration-200 ${
                      isBestValue
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {/* Best Value Badge */}
                    {isBestValue && (
                      <div className="absolute -top-2 left-4 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        BEST VALUE
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-bold text-lg text-gray-900 dark:text-white">
                            {starCount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {pkg.product.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {pkg.product.priceString}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ${(pkg.product.price / starCount).toFixed(3)} per star
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg.identifier)}
                      disabled={isPurchasing || purchasing !== null}
                      className={`mt-3 w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        isBestValue
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Purchase {starCount} Stars</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              How Stars Work:
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Give stars to creators to show appreciation</li>
              <li>• Each star = 1 tip to a creator</li>
              <li>• Stars are stored in your Veridica wallet</li>
              <li>• Support the creator economy</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyStarsModal;

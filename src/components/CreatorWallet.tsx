import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, DollarSign, CreditCard, ArrowDown, ArrowUp, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getStarEarnings, 
  getStarBalance, 
  getUserTransactionHistory, 
  calculateCashoutAmount,
  cashoutStars,
  StarTransaction
} from '../lib/revenuecat';
import { toast } from 'react-toastify';

interface CreatorWalletProps {
  className?: string;
}

const CreatorWallet: React.FC<CreatorWalletProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'earnings' | 'transactions'>('earnings');
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    pendingPayout: 0,
    totalPaidOut: 0,
    dollarValue: 0
  });
  const [transactions, setTransactions] = useState<StarTransaction[]>([]);
  const [starBalance, setStarBalance] = useState(0);
  const [cashoutAmount, setCashoutAmount] = useState(0);
  const [isProcessingCashout, setIsProcessingCashout] = useState(false);
  const [showCashoutModal, setShowCashoutModal] = useState(false);

  useEffect(() => {
    if (user) {
      // Load initial data
      loadWalletData();
      
      // Set up event listeners for updates
      window.addEventListener('starsBalanceUpdated', loadWalletData);
      window.addEventListener('starTransactionAdded', loadWalletData);
      
      return () => {
        window.removeEventListener('starsBalanceUpdated', loadWalletData);
        window.removeEventListener('starTransactionAdded', loadWalletData);
      };
    }
  }, [user]);

  const loadWalletData = () => {
    if (!user) return;
    
    // Get star balance
    const balance = getStarBalance();
    setStarBalance(balance);
    
    // Get earnings
    const userEarnings = getStarEarnings(user.id);
    setEarnings({
      totalEarned: userEarnings.totalEarned,
      pendingPayout: userEarnings.pendingPayout,
      totalPaidOut: userEarnings.totalPaidOut,
      dollarValue: userEarnings.dollarValue
    });
    
    // Get transactions
    const userTransactions = getUserTransactionHistory(user.id);
    setTransactions(userTransactions);
    
    // Calculate cashout amount
    const availableCashout = calculateCashoutAmount(user.id);
    setCashoutAmount(availableCashout);
  };

  const handleCashout = async () => {
    if (!user) return;
    
    setIsProcessingCashout(true);
    try {
      // Process the cashout
      const result = await cashoutStars(user.id, earnings.pendingPayout);
      
      if (result.success) {
        toast.success(`Successfully cashed out $${result.amount.toFixed(2)}!`);
        loadWalletData(); // Refresh data
        setShowCashoutModal(false);
      } else {
        toast.error(result.error || 'Failed to process cashout');
      }
    } catch (error) {
      console.error('Error processing cashout:', error);
      toast.error('An error occurred while processing your cashout');
    } finally {
      setIsProcessingCashout(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-['Abril_Fatface',_cursive] italic text-gray-900 dark:text-white">Creator Wallet</h2>
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-4 py-2 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {starBalance}
            </span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-4 px-6 text-center font-medium ${
            activeTab === 'earnings'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('earnings')}
        >
          Earnings
        </button>
        <button
          className={`flex-1 py-4 px-6 text-center font-medium ${
            activeTab === 'transactions'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'earnings' ? (
          <div>
            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earned</h3>
                  <Star className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{earnings.totalEarned}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">stars</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ≈ ${earnings.dollarValue.toFixed(2)} USD
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available for Cashout</h3>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{earnings.pendingPayout}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">stars</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ≈ ${(earnings.pendingPayout * 0.01).toFixed(2)} USD
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid Out</h3>
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{earnings.totalPaidOut}</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">stars</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ≈ ${(earnings.totalPaidOut * 0.01).toFixed(2)} USD
                </div>
              </div>
            </div>
            
            {/* Cashout Section */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cash Out Earnings</h3>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available for cashout:</p>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-current mr-2" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{earnings.pendingPayout}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">stars</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated payout:</p>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">${(earnings.pendingPayout * 0.01).toFixed(2)}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">USD</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowCashoutModal(true)}
                disabled={earnings.pendingPayout < 100}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {earnings.pendingPayout < 100 
                  ? `Need ${100 - earnings.pendingPayout} more stars to cash out` 
                  : 'Cash Out Now'}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Minimum 100 stars required for cashout. Each star = $0.01 USD.
              </p>
            </div>
            
            {/* Earnings Info */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">How Earnings Work</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• You earn stars when users tip your content</li>
                <li>• For shared content, original creators receive 80% of stars</li>
                <li>• Content sharers receive 20% of stars</li>
                <li>• Each star is worth $0.01 USD when cashed out</li>
                <li>• Minimum cashout amount is 100 stars ($1.00 USD)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            {/* Transactions List */}
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Your transaction history will appear here once you start receiving or sending stars.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.toUserId === user?.id
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.toUserId === user?.id ? (
                            <ArrowDown className="w-5 h-5" />
                          ) : (
                            <ArrowUp className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {transaction.toUserId === user?.id ? 'Received Stars' : 'Sent Stars'}
                            {transaction.isSharedContent && ' (Shared Content)'}
                          </h4>
                          
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {transaction.starsGiven}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              stars
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              (${(transaction.starsGiven * 0.01).toFixed(2)} USD)
                            </span>
                          </div>
                          
                          {transaction.message && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              "{transaction.message}"
                            </p>
                          )}
                          
                          {transaction.contentId && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Content: {transaction.contentType} #{transaction.contentId.substring(0, 8)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(transaction.timestamp)}
                        </div>
                        
                        {transaction.isSharedContent && (
                          <span className="inline-block mt-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                            {transaction.toUserId === user?.id && transaction.message?.includes('80%')
                              ? 'Creator Share (80%)'
                              : transaction.toUserId === user?.id && transaction.message?.includes('20%')
                              ? 'Sharer Bonus (20%)'
                              : 'Shared Content'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Cashout Confirmation Modal */}
      {showCashoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Confirm Cashout</h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Stars to cash out:</span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-bold text-gray-900 dark:text-white">{earnings.pendingPayout}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Exchange rate:</span>
                <span className="text-gray-900 dark:text-white">$0.01 per star</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 my-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">Total payout:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ${(earnings.pendingPayout * 0.01).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCashoutModal(false)}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCashout}
                disabled={isProcessingCashout}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingCashout ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Confirm Cashout'
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Payouts are typically processed within 3-5 business days.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CreatorWallet;
// RevenueCat Web SDK integration for Veridica star purchase system
// This uses the CDN version for simplicity

// Types for RevenueCat
interface CustomerInfo {
  entitlements: {
    active: Record<string, EntitlementInfo>;
  };
  allPurchaseDatesByProduct: Record<string, Date | null>;
  allExpirationDatesByProduct: Record<string, Date | null>;
  activeSubscriptions: string[];
  nonSubscriptionTransactions: unknown[];
}

interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: Date;
  expirationDate: Date | null;
}

export interface StarPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

export interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  customerInfo?: CustomerInfo;
  productIdentifier?: string;
}

// RevenueCat Web SDK global
declare global {
  interface Window {
    RCPurchases: {
      configure: (config: { publicApiKey: string; appUserId?: string }) => Promise<RevenueCatInstance>;
    };
  }
}

interface RevenueCatInstance {
  addCustomerInfoUpdateListener?: (callback: (customerInfo: CustomerInfo) => void) => void;
  getOfferings: () => Promise<{ current?: { availablePackages: RevenueCatPackage[] } }>;
  purchasePackage: (pkg: RevenueCatPackage) => Promise<{ customerInfo: CustomerInfo; productIdentifier: string }>;
  restorePurchases: () => Promise<CustomerInfo>;
  getCustomerInfo: () => Promise<CustomerInfo>;
}

interface RevenueCatPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price: number;
    priceString: string;
    currencyCode: string;
  };
}

// RevenueCat configuration
let isConfigured = false;
let rcInstance: RevenueCatInstance | null = null;
let scriptLoadFailed = false;
let scriptLoadAttempted = false;

export const debugRevenueCat = () => {
  const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
  console.log('=== REVENUECAT FULL DEBUG ===');
  console.log('DEBUG - Raw API Key:', apiKey);
  console.log('DEBUG - Key length:', apiKey ? apiKey.length : 'undefined');
  console.log('DEBUG - Key starts with:', apiKey ? apiKey.substring(0, 10) : 'undefined');
  console.log('DEBUG - isConfigured:', isConfigured);
  console.log('DEBUG - rcInstance:', !!rcInstance);
  console.log('DEBUG - scriptLoadFailed:', scriptLoadFailed);
  console.log('DEBUG - scriptLoadAttempted:', scriptLoadAttempted);
  console.log('DEBUG - Window RCPurchases:', !!window.RCPurchases);
  console.log('DEBUG - All env vars:', import.meta.env);
  
  // Force check if the key is exactly what we expect
  console.log('DEBUG - Is production key?:', apiKey === 'rcb_nxFaEtdIxcXFtxLKnIAUHGfwVyOq');
  console.log('DEBUG - Is sandbox key?:', apiKey === 'rcb_sb_tnaXRWTYEDSfqrrioYhfzRKVU');
  
  return { apiKey, isConfigured, hasInstance: !!rcInstance, scriptLoadFailed, scriptLoadAttempted };
};

export const initRevenueCat = async (userId: string | null = null) => {
  // Don't attempt multiple times if already failed
  if (scriptLoadFailed) {
    console.log('RevenueCat script loading previously failed, using mock system');
    return;
  }

  if (isConfigured) {
    console.log('RevenueCat already configured');
    return;
  }

  try {
    const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
    console.log('initRevenueCat called with apiKey:', apiKey);
    
    if (!apiKey || apiKey === 'your_revenuecat_web_api_key_here' || apiKey === 'your_actual_revenuecat_web_api_key_here') {
      console.warn('RevenueCat API key not configured. Star purchases will use mock system.');
      console.warn('Current API key value:', apiKey);
      scriptLoadFailed = true;
      return;
    }

    console.log('RevenueCat API key detected:', apiKey.substring(0, 10) + '...');

    console.log('Loading RevenueCat Web SDK...');
    // Load RevenueCat Web SDK script if not already loaded
    if (!window.RCPurchases && !scriptLoadAttempted) {
      try {
        await loadRevenueCatScript();
      } catch (error) {
        console.warn('RevenueCat script failed to load, falling back to mock system:', error);
        scriptLoadFailed = true;
        return;
      }
    }

    // If script loading was attempted but failed, don't try to configure
    if (scriptLoadFailed || !window.RCPurchases) {
      console.warn('RevenueCat not available, using mock system');
      return;
    }

    console.log('Configuring RevenueCat with API key:', apiKey.substring(0, 10) + '...');
    // Configure RevenueCat
    rcInstance = await window.RCPurchases.configure({
      publicApiKey: apiKey,
      appUserId: userId || undefined,
    });

    isConfigured = true;
    console.log('RevenueCat configured successfully with instance:', !!rcInstance);

    // Add listener for customer info updates
    if (rcInstance.addCustomerInfoUpdateListener) {
      rcInstance.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
        console.log('Customer info updated:', customerInfo);
        handleCustomerInfoUpdate(customerInfo);
      });
    }

  } catch (error) {
    console.warn('Failed to configure RevenueCat, falling back to mock system:', error);
    scriptLoadFailed = true;
  }
};

const loadRevenueCatScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    scriptLoadAttempted = true;

    if (window.RCPurchases) {
      console.log('RevenueCat script already loaded');
      resolve();
      return;
    }

    console.log('Loading RevenueCat script...');
    const script = document.createElement('script');
    script.src = 'https://js.revenuecat.com/revenuecat-web-js/1.7.0/revenuecat-web-js.min.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('RevenueCat script load timeout - this may be due to network issues, ad blockers, or CDN unavailability');
      script.remove();
      scriptLoadFailed = true;
      reject(new Error('Script load timeout'));
    }, 15000); // 15 second timeout

    script.onload = () => {
      clearTimeout(timeout);
      console.log('RevenueCat script loaded successfully');
      // Wait a bit for the script to initialize
      setTimeout(() => {
        if (window.RCPurchases) {
          console.log('RCPurchases is available');
          resolve();
        } else {
          console.warn('RCPurchases not available after script load, falling back to mock system');
          scriptLoadFailed = true;
          reject(new Error('RCPurchases not available after script load'));
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      clearTimeout(timeout);
      console.warn('Failed to load RevenueCat script - this may be due to network issues, ad blockers, or CDN unavailability. Falling back to mock system.');
      console.warn('Error details:', error);
      script.remove();
      scriptLoadFailed = true;
      // Don't throw error, just mark as failed and continue with mock system
      reject(new Error('Failed to load RevenueCat script'));
    };
    
    // Add the script to head
    try {
      document.head.appendChild(script);
    } catch (error) {
      clearTimeout(timeout);
      console.warn('Failed to append RevenueCat script to document head:', error);
      scriptLoadFailed = true;
      reject(error);
    }
  });
};

export const handleCustomerInfoUpdate = async (customerInfo: CustomerInfo) => {
  // Check if user has active star entitlements
  const starsEntitlement = customerInfo.entitlements.active['stars_entitlement'];
  
  if (starsEntitlement) {
    console.log('User has active stars entitlement:', starsEntitlement);
    
    // Sync star balance with backend
    await syncStarBalanceWithBackend();
    
    // Trigger star balance refresh in the app
    window.dispatchEvent(new CustomEvent('starsBalanceUpdated'));
  }
};

export const getStarPackages = async (): Promise<StarPackage[]> => {
  try {
    console.log('getStarPackages called - isConfigured:', isConfigured, 'rcInstance:', !!rcInstance, 'scriptLoadFailed:', scriptLoadFailed);
    
    if (!isConfigured || !rcInstance || scriptLoadFailed) {
      console.log('RevenueCat not available, returning mock star packages. Reasons:', {
        isConfigured,
        hasInstance: !!rcInstance,
        scriptLoadFailed
      });
      return getMockStarPackages();
    }

    console.log('Fetching offerings from RevenueCat...');
    const offerings = await rcInstance.getOfferings();
    console.log('RevenueCat offerings received:', offerings);
    
    if (!offerings.current) {
      console.warn('No current offerings found, returning mock packages');
      return getMockStarPackages();
    }

    console.log('Using real RevenueCat packages:', offerings.current.availablePackages);
    return offerings.current.availablePackages.map((pkg: RevenueCatPackage) => ({
      identifier: pkg.identifier,
      packageType: pkg.packageType,
      product: {
        identifier: pkg.product.identifier,
        title: pkg.product.title,
        description: pkg.product.description,
        price: pkg.product.price,
        priceString: pkg.product.priceString,
        currencyCode: pkg.product.currencyCode,
      }
    }));
  } catch (error) {
    console.error('Failed to get star packages:', error);
    return getMockStarPackages();
  }
};

// Mock star packages for development/demo
const getMockStarPackages = (): StarPackage[] => [
  {
    identifier: 'stars_100',
    packageType: 'custom',
    product: {
      identifier: 'stars_100',
      title: '100 Stars',
      description: 'Support creators with 100 stars',
      price: 4.99,
      priceString: '$4.99',
      currencyCode: 'USD',
    }
  },
  {
    identifier: 'stars_250',
    packageType: 'custom',
    product: {
      identifier: 'stars_250',
      title: '250 Stars',
      description: 'Support creators with 250 stars',
      price: 9.99,
      priceString: '$9.99',
      currencyCode: 'USD',
    }
  },
  {
    identifier: 'stars_500',
    packageType: 'custom',
    product: {
      identifier: 'stars_500',
      title: '500 Stars',
      description: 'Support creators with 500 stars',
      price: 19.99,
      priceString: '$19.99',
      currencyCode: 'USD',
    }
  },
  {
    identifier: 'stars_1000',
    packageType: 'custom',
    product: {
      identifier: 'stars_1000',
      title: '1000 Stars',
      description: 'Support creators with 1000 stars',
      price: 34.99,
      priceString: '$34.99',
      currencyCode: 'USD',
    }
  }
];

export const purchaseStarPackage = async (packageIdentifier: string): Promise<PurchaseResult> => {
  try {
    if (!isConfigured || !rcInstance || scriptLoadFailed) {
      console.log('RevenueCat not available, using mock purchase system');
      return simulatePurchase(packageIdentifier);
    }

    const offerings = await rcInstance.getOfferings();
    const packageToBuy = offerings.current?.availablePackages.find(
      (pkg: RevenueCatPackage) => pkg.identifier === packageIdentifier
    );

    if (!packageToBuy) {
      throw new Error(`Package ${packageIdentifier} not found`);
    }

    console.log('Attempting real RevenueCat purchase:', packageToBuy);
    const result = await rcInstance.purchasePackage(packageToBuy);
    
    console.log('RevenueCat purchase result:', result);
    
    // Extract star count from package identifier
    const starCount = parseInt(packageIdentifier.replace('stars_', ''));
    
    // Handle the purchase completion with backend
    const backendResult = await handleRevenueCatPurchaseComplete(
      result.productIdentifier, // Use as transaction ID for now
      packageIdentifier,
      starCount,
      packageToBuy.product.price,
      result
    );
    
    if (backendResult.success) {
      console.log('Star package purchased and processed successfully');
      return {
        success: true,
        customerInfo: result.customerInfo,
        productIdentifier: result.productIdentifier,
      };
    } else {
      console.error('Purchase completed but backend processing failed:', backendResult.error);
      // Still return success since the purchase went through
      return {
        success: true,
        customerInfo: result.customerInfo,
        productIdentifier: result.productIdentifier,
      };
    }
  } catch (error: unknown) {
    console.error('Failed to purchase star package:', error);
    
    // Check if user cancelled the purchase
    if (error && typeof error === 'object' && 'userCancelled' in error) {
      return { success: false, cancelled: true };
    }
    
    // Fallback to simulation for demo
    console.log('Falling back to simulated purchase for demo');
    return simulatePurchase(packageIdentifier);
  }
};

// Simulate purchase for demo purposes
const simulatePurchase = (packageIdentifier: string): PurchaseResult => {
  const packages = getMockStarPackages();
  const pkg = packages.find(p => p.identifier === packageIdentifier);
  
  if (!pkg) {
    throw new Error(`Package ${packageIdentifier} not found`);
  }

  // Extract number of stars from package identifier
  const starCount = parseInt(packageIdentifier.replace('stars_', ''));
  
  // Add stars to user's balance
  const currentBalance = getStarBalance();
  setStarBalance(currentBalance + starCount);
  
  console.log(`Simulated purchase: Added ${starCount} stars to user balance`);
  
  return {
    success: true,
    productIdentifier: packageIdentifier,
  };
};

export const restorePurchases = async () => {
  try {
    if (!isConfigured || !rcInstance || scriptLoadFailed) {
      console.log('RevenueCat not available, cannot restore purchases');
      return null;
    }

    const customerInfo = await rcInstance.restorePurchases();
    console.log('Purchases restored:', customerInfo);
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

export const getCustomerInfo = async () => {
  try {
    if (!isConfigured || !rcInstance || scriptLoadFailed) {
      console.log('RevenueCat not available, cannot get customer info');
      return null;
    }

    return await rcInstance.getCustomerInfo();
  } catch (error) {
    console.error('Failed to get customer info:', error);
    throw error;
  }
};

// Helper function to check if RevenueCat is available
export const isRevenueCatAvailable = () => {
  const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
  return apiKey && apiKey !== 'your_revenuecat_web_api_key_here' && !scriptLoadFailed && isConfigured;
};

// Helper function to get star balance from local storage
export const getStarBalance = (): number => {
  const balance = localStorage.getItem('veridica_star_balance');
  return balance ? parseInt(balance, 10) : 0;
};

// Helper function to set star balance
export const setStarBalance = (balance: number): void => {
  localStorage.setItem('veridica_star_balance', balance.toString());
  // Trigger event for UI updates
  window.dispatchEvent(new CustomEvent('starsBalanceUpdated', { detail: balance }));
};

// Helper function to spend a star
export const spendStar = (): boolean => {
  const currentBalance = getStarBalance();
  if (currentBalance > 0) {
    setStarBalance(currentBalance - 1);
    return true;
  }
  return false;
};

// Backend integration functions (simplified for now until types are regenerated)

// Get user's star balance from backend (fallback to localStorage for now)
export const getStarBalanceFromBackend = async (): Promise<number> => {
  try {
    // TODO: Implement after regenerating database types
    console.log('Backend star balance fetch not yet implemented');
    return getStarBalance();
  } catch (error) {
    console.error('Failed to get star balance from backend:', error);
    return getStarBalance();
  }
};

// Sync local star balance with backend
export const syncStarBalanceWithBackend = async (): Promise<number> => {
  try {
    // TODO: Implement after regenerating database types
    const currentBalance = getStarBalance();
    return currentBalance;
  } catch (error) {
    console.error('Failed to sync star balance:', error);
    return getStarBalance();
  }
};

// Process star transaction in backend (simplified for now)
export const processStarTransactionInBackend = async (
  toUserId: string,
  starsGiven: number = 1,
  contentId?: string,
  contentType?: string,
  message?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // For now, just update local storage
    // TODO: Implement backend call after regenerating database types
    const currentBalance = getStarBalance();
    if (currentBalance >= starsGiven) {
      setStarBalance(currentBalance - starsGiven);
      console.log(`Simulated star transaction: ${starsGiven} stars to ${toUserId}`, {
        contentId, contentType, message
      });
      return { success: true };
    } else {
      return { success: false, error: 'Insufficient star balance' };
    }
  } catch (error) {
    console.error('Failed to process star transaction:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Handle RevenueCat purchase completion (simplified for now)
export const handleRevenueCatPurchaseComplete = async (
  transactionId: string,
  packageIdentifier: string,
  starsToAdd: number,
  amountUsd: number,
  revenueCatData?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Processing RevenueCat purchase:', {
      transactionId,
      packageIdentifier,
      starsToAdd,
      amountUsd,
      revenueCatData
    });
    
    // For now, just add stars to local balance
    // TODO: Implement backend call after regenerating database types
    const currentBalance = getStarBalance();
    setStarBalance(currentBalance + starsToAdd);
    
    console.log(`Added ${starsToAdd} stars to user balance (now ${currentBalance + starsToAdd})`);
    return { success: true };
  } catch (error) {
    console.error('Failed to handle RevenueCat purchase:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
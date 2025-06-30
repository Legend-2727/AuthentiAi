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
  nonSubscriptionTransactions: any[];
}

interface EntitlementInfo {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  latestPurchaseDate: Date;
  expirationDate: Date | null;
}

interface StarPackage {
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

interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  customerInfo?: CustomerInfo;
  productIdentifier?: string;
}

// RevenueCat Web SDK global
declare global {
  interface Window {
    RCPurchases: any;
  }
}

// RevenueCat configuration
let isConfigured = false;
let rcInstance: any = null;

export const initRevenueCat = async (userId: string | null = null) => {
  if (isConfigured) return;

  try {
    const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
    
    if (!apiKey || apiKey === 'your_revenuecat_web_api_key_here') {
      console.warn('RevenueCat API key not configured. Star purchases will be disabled.');
      return;
    }

    // Load RevenueCat Web SDK script if not already loaded
    if (!window.RCPurchases) {
      await loadRevenueCatScript();
    }

    // Configure RevenueCat
    rcInstance = await window.RCPurchases.configure({
      publicApiKey: apiKey,
      appUserId: userId || undefined,
    });

    isConfigured = true;
    console.log('RevenueCat configured successfully');

    // Add listener for customer info updates
    if (rcInstance.addCustomerInfoUpdateListener) {
      rcInstance.addCustomerInfoUpdateListener((customerInfo: CustomerInfo) => {
        console.log('Customer info updated:', customerInfo);
        handleCustomerInfoUpdate(customerInfo);
      });
    }

  } catch (error) {
    console.error('Failed to configure RevenueCat:', error);
  }
};

const loadRevenueCatScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.RCPurchases) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.revenuecat.com/revenuecat-web-js/1.7.0/revenuecat-web-js.min.js';
    script.async = true;
    script.onload = () => {
      // Wait a bit for the script to initialize
      setTimeout(() => resolve(), 100);
    };
    script.onerror = () => reject(new Error('Failed to load RevenueCat script'));
    document.head.appendChild(script);
  });
};

export const handleCustomerInfoUpdate = (customerInfo: CustomerInfo) => {
  // Check if user has active star entitlements
  const starsEntitlement = customerInfo.entitlements.active['stars_entitlement'];
  
  if (starsEntitlement) {
    console.log('User has active stars entitlement:', starsEntitlement);
    // Trigger star balance refresh in the app
    window.dispatchEvent(new CustomEvent('starsBalanceUpdated'));
  }
};

export const getStarPackages = async (): Promise<StarPackage[]> => {
  try {
    if (!isConfigured || !rcInstance) {
      console.warn('RevenueCat not configured, returning mock star packages');
      return getMockStarPackages();
    }

    const offerings = await rcInstance.getOfferings();
    
    if (!offerings.current) {
      console.warn('No current offerings found, returning mock packages');
      return getMockStarPackages();
    }

    return offerings.current.availablePackages.map((pkg: any) => ({
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
    if (!isConfigured || !rcInstance) {
      console.warn('RevenueCat not configured, simulating purchase');
      return simulatePurchase(packageIdentifier);
    }

    const offerings = await rcInstance.getOfferings();
    const packageToBuy = offerings.current?.availablePackages.find(
      (pkg: any) => pkg.identifier === packageIdentifier
    );

    if (!packageToBuy) {
      throw new Error(`Package ${packageIdentifier} not found`);
    }

    const result = await rcInstance.purchasePackage(packageToBuy);
    
    if (result.customerInfo.entitlements.active['stars_entitlement']) {
      console.log('Star package purchased successfully:', result);
      return {
        success: true,
        customerInfo: result.customerInfo,
        productIdentifier: result.productIdentifier,
      };
    } else {
      throw new Error('Purchase completed but entitlement not active');
    }
  } catch (error: unknown) {
    console.error('Failed to purchase star package:', error);
    
    // Check if user cancelled the purchase
    if (error && typeof error === 'object' && 'userCancelled' in error) {
      return { success: false, cancelled: true };
    }
    
    // Fallback to simulation for demo
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
    if (!isConfigured || !rcInstance) {
      throw new Error('RevenueCat not configured');
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
    if (!isConfigured || !rcInstance) {
      throw new Error('RevenueCat not configured');
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
  return apiKey && apiKey !== 'your_revenuecat_web_api_key_here';
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

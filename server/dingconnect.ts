/**
 * DingConnect API Integration for Mobile Top-Up
 * Documentation: https://www.dingconnect.com/Api/Description
 */

const DINGCONNECT_API_KEY = process.env.DINGCONNECT_API_KEY || '';

// Base URL for DingConnect API
const BASE_URL = 'https://api.dingconnect.com/api/V1';

// Enable simulation mode if API key is not configured
const SIMULATION_MODE = !DINGCONNECT_API_KEY;

/**
 * DingConnect Product Interface
 */
export interface DingConnectProduct {
  ProviderCode: string;
  SkuCode: string;
  LocalizationKey: string;
  SettingDefinitions?: any[];
  Maximum: {
    CustomerFee: number;
    DistributorFee: number;
    ReceiveValue: number;
    ReceiveCurrencyIso: string;
    ReceiveValueExcludingTax: number;
    TaxRate: number;
    SendValue: number;
    SendCurrencyIso: string;
  };
  Minimum: {
    CustomerFee: number;
    DistributorFee: number;
    ReceiveValue: number;
    ReceiveCurrencyIso: string;
    ReceiveValueExcludingTax: number;
    TaxRate: number;
    SendValue: number;
    SendCurrencyIso: string;
  };
  CommissionRate: number;
  ProcessingMode: string; // "Instant", "Deferred"
  RedemptionMechanism: string; // "Immediate"
  Benefits: string[]; // ["Mobile", "Minutes", "Data"]
  ValidityPeriodIso: string;
  UatNumber: string;
  DefaultDisplayText: string;
  RegionCode: string;
  PaymentTypes: string[];
  LookupBillsRequired: boolean;
}

/**
 * DingConnect Transaction Response
 */
export interface DingConnectTransaction {
  TransferRecord: {
    TransferId: {
      TransferRef: string;
      DistributorRef: string;
    };
    SkuCode: string;
    Price: {
      CustomerFee: number;
      DistributorFee: number;
      ReceiveValue: number;
      ReceiveCurrencyIso: string;
      ReceiveValueExcludingTax: number;
      TaxRate: number;
      TaxName: string | null;
      TaxCalculation: string | null;
      SendValue: number;
      SendCurrencyIso: string;
    };
    CommissionApplied: number;
    StartedUtc: string;
    CompletedUtc: string;
    ProcessingState: string; // "Complete", "Submitted", "InProgress", "Failed"
    ReceiptText: string | null;
    ReceiptParams: any;
    AccountNumber: string;
  };
  ResultCode: number; // 1 = success
  ErrorCodes: Array<{
    Code: string;
    Context: string;
  }>;
}

/**
 * Check if product is AIRTIME only (not data/bundles/pin)
 * USER REQUIREMENT: Filter AIRTIME only, exclude DATA/GB/MB/PIN/vouchers
 */
function isAirtimeProduct(product: DingConnectProduct): boolean {
  const displayText = product.DefaultDisplayText?.toLowerCase() || '';
  const benefits = product.Benefits?.map(b => b.toLowerCase()) || [];
  
  // EXCLUDE products that contain data indicators
  const hasDataIndicators = 
    displayText.includes('gb') ||
    displayText.includes('mb') ||
    displayText.includes('data') ||
    displayText.includes('internet') ||
    displayText.includes('plan') ||
    displayText.includes('bundle') ||
    displayText.includes('package') ||
    displayText.includes('forfait') ||
    displayText.includes('pin') ||
    displayText.includes('voucher'); 
  
  // EXCLUDE products that have 'Data' in Benefits but not 'Minutes' or 'Mobile'
  const isDataOnly = benefits.includes('data') && !benefits.includes('minutes') && !benefits.includes('mobile');
  
  // INCLUDE only products that are pure airtime/minutes
  const isAirtime = 
    (benefits.includes('mobile') || benefits.includes('minutes')) &&
    !hasDataIndicators &&
    !isDataOnly;
  
  return isAirtime;
}

// ✅ SIMPLE CACHE IMPLEMENTATION
const PRODUCT_CACHE: Record<string, { timestamp: number; data: DingConnectProduct[] }> = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

/**
 * Fetch available products for a country
 * Products are filtered by region code and operator is detected during SendTransfer
 */
export async function getProductsByRegion(regionCode: string): Promise<DingConnectProduct[]> {
  // SIMULATION MODE: Return mock data for testing
  if (SIMULATION_MODE) {
    console.log('[DingConnect] SIMULATION MODE - Returning mock products for', regionCode);
    
    const mockProducts: DingConnectProduct[] = [
      {
        ProviderCode: 'MOCK',
        SkuCode: 'MOCK_AIRTIME_5',
        LocalizationKey: 'MOCK_AIRTIME_5',
        SettingDefinitions: [],
        Maximum: {
          CustomerFee: 0,
          DistributorFee: 0,
          ReceiveValue: 5,
          ReceiveCurrencyIso: 'USD',
          ReceiveValueExcludingTax: 5,
          TaxRate: 0,
          SendValue: 5,
          SendCurrencyIso: 'USD'
        },
        Minimum: {
          CustomerFee: 0,
          DistributorFee: 0,
          ReceiveValue: 5,
          ReceiveCurrencyIso: 'USD',
          ReceiveValueExcludingTax: 5,
          TaxRate: 0,
          SendValue: 5,
          SendCurrencyIso: 'USD'
        },
        CommissionRate: 0.09,
        ProcessingMode: 'Instant',
        RedemptionMechanism: 'Immediate',
        Benefits: ['Mobile', 'Minutes'],
        ValidityPeriodIso: '',
        UatNumber: '1234567890',
        DefaultDisplayText: 'Mobile Recharge $5',
        RegionCode: regionCode,
        PaymentTypes: ['Prepaid'],
        LookupBillsRequired: false
      },
      {
        ProviderCode: 'MOCK',
        SkuCode: 'MOCK_AIRTIME_10',
        LocalizationKey: 'MOCK_AIRTIME_10',
        SettingDefinitions: [],
        Maximum: {
          CustomerFee: 0,
          DistributorFee: 0,
          ReceiveValue: 10,
          ReceiveCurrencyIso: 'USD',
          ReceiveValueExcludingTax: 10,
          TaxRate: 0,
          SendValue: 10,
          SendCurrencyIso: 'USD'
        },
        Minimum: {
          CustomerFee: 0,
          DistributorFee: 0,
          ReceiveValue: 10,
          ReceiveCurrencyIso: 'USD',
          ReceiveValueExcludingTax: 10,
          TaxRate: 0,
          SendValue: 10,
          SendCurrencyIso: 'USD'
        },
        CommissionRate: 0.09,
        ProcessingMode: 'Instant',
        RedemptionMechanism: 'Immediate',
        Benefits: ['Mobile', 'Minutes'],
        ValidityPeriodIso: '',
        UatNumber: '1234567890',
        DefaultDisplayText: 'Mobile Recharge $10',
        RegionCode: regionCode,
        PaymentTypes: ['Prepaid'],
        LookupBillsRequired: false
      }
    ];

    return mockProducts;
  }

  // ✅ 1. CHECK CACHE FIRST
  const now = Date.now();
  if (PRODUCT_CACHE[regionCode] && (now - PRODUCT_CACHE[regionCode].timestamp < CACHE_DURATION)) {
    console.log(`[DingConnect] ⚡ Returning cached products for ${regionCode}`);
    return PRODUCT_CACHE[regionCode].data;
  }

  try {
    console.log('[DingConnect] Fetching products for region:', regionCode);

    const response = await fetch(`${BASE_URL}/GetProducts?RegionCodes=${regionCode}`, {
      method: 'GET',
      headers: {
        'api_key': DINGCONNECT_API_KEY,
      },
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const error = await response.json();
        console.error('[DingConnect] GetProducts failed:', error);
        errorMessage = error.ErrorCodes?.[0]?.Code || errorMessage;
      } catch (jsonError) {
        console.error('[DingConnect] GetProducts failed with status:', response.status, response.statusText);
      }
      throw new Error(`DingConnect GetProducts failed (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    const allProducts: DingConnectProduct[] = data.Items || [];
    
    // Filter to keep ONLY airtime products (user requirement)
    const airtimeProducts = allProducts.filter(isAirtimeProduct);
    
    console.log('[DingConnect] Products fetched:', {
      total: allProducts.length,
      airtime: airtimeProducts.length,
      filtered: allProducts.length - airtimeProducts.length,
    });

    // ✅ 2. SAVE TO CACHE
    if (airtimeProducts.length > 0) {
      PRODUCT_CACHE[regionCode] = {
        timestamp: now,
        data: airtimeProducts
      };
    }

    return airtimeProducts;
  } catch (error) {
    console.error('[DingConnect] GetProducts error:', error);
    throw error;
  }
}

/**
 * Find best matching product for amount
 * DingConnect products can be flexible (min-max range) or fixed
 */
export function findBestProduct(
  products: DingConnectProduct[], 
  targetAmountUSD: number
): DingConnectProduct | null {
  if (!products || products.length === 0) {
    return null;
  }

  console.log('[DingConnect] Finding best product for amount:', targetAmountUSD);

  // Filter for USD products only to avoid currency mismatches
  const validProducts = products.filter(p => p.Maximum.SendCurrencyIso === 'USD');

  if (validProducts.length === 0) {
    console.warn('[DingConnect] No USD products found. Available currencies:', products.map(p => p.Maximum.SendCurrencyIso));
  }

  const productsToSearch = validProducts.length > 0 ? validProducts : products;

  // Sort products by price difference
  const sortedProducts = productsToSearch
    .map(product => {
      const minAmount = product.Minimum.SendValue;
      const maxAmount = product.Maximum.SendValue;
      
      // Check if amount is within range
      const withinRange = targetAmountUSD >= minAmount && targetAmountUSD <= maxAmount;
      
      // Calculate price difference (prefer exact match or closest)
      let priceDiff: number;
      if (withinRange) {
        priceDiff = 0; // Perfect match
      } else if (targetAmountUSD < minAmount) {
        priceDiff = minAmount - targetAmountUSD;
      } else {
        priceDiff = targetAmountUSD - maxAmount;
      }
      
      return {
        product,
        minAmount,
        maxAmount,
        withinRange,
        priceDiff,
      };
    })
    .sort((a, b) => {
      // Prioritize products within range
      if (a.withinRange && !b.withinRange) return -1;
      if (!a.withinRange && b.withinRange) return 1;
      
      // Then sort by price difference
      if (a.priceDiff !== b.priceDiff) {
        return a.priceDiff - b.priceDiff;
      }

      // Tie-Breaker - Prefer higher commission if everything else is equal
      return b.product.CommissionRate - a.product.CommissionRate;
    });

  const best = sortedProducts[0];
  
  if (best) {
    console.log('[DingConnect] Best product found:', {
      SkuCode: best.product.SkuCode,
      DisplayText: best.product.DefaultDisplayText,
      MinAmount: best.minAmount,
      MaxAmount: best.maxAmount,
      TargetAmount: targetAmountUSD,
      WithinRange: best.withinRange,
      Commission: best.product.CommissionRate
    });
  }

  return best?.product || null;
}

/**
 * Send mobile top-up via DingConnect API
 * * @param phoneNumber - International format phone number (e.g., +50937001234)
 * @param amountUSD - Amount in USD to send
 * @param distributorRef - Your unique transaction ID for idempotency
 * @param regionCode - Country code (e.g., 'HT' for Haiti)
 * @returns DingConnect transaction object
 */
export async function sendRecharge(
  phoneNumber: string,
  amountUSD: number,
  distributorRef: string,
  regionCode: string
): Promise<DingConnectTransaction> {
  try {
    const mode = SIMULATION_MODE ? 'SIMULATION' : 'PRODUCTION';
    
    console.log('[DingConnect] Initiating recharge:', {
      phoneNumber,
      amountUSD,
      distributorRef,
      regionCode,
      mode,
    });

    // Step 1: Get available products for this region (Cached!)
    const products = await getProductsByRegion(regionCode);
    
    if (!products || products.length === 0) {
      throw new Error(`No DingConnect airtime products available for region ${regionCode}`);
    }

    // Step 2: Find best matching product for the amount
    const product = findBestProduct(products, amountUSD);
    
    if (!product) {
      throw new Error(`No suitable airtime product found for amount ${amountUSD} USD in region ${regionCode}`);
    }

    console.log('[DingConnect] Selected product:', {
      SkuCode: product.SkuCode,
      DisplayText: product.DefaultDisplayText,
      MinSendValue: product.Minimum.SendValue,
      MaxSendValue: product.Maximum.SendValue,
      Commission: (product.CommissionRate * 100).toFixed(1) + '%',
    });

    // SIMULATION MODE: Return mock transaction
    if (SIMULATION_MODE) {
      const mockTransaction: DingConnectTransaction = {
        TransferRecord: {
          TransferId: {
            TransferRef: Math.floor(Math.random() * 1000000).toString(),
            DistributorRef: distributorRef,
          },
          SkuCode: product.SkuCode,
          Price: {
            CustomerFee: 0,
            DistributorFee: 0,
            ReceiveValue: amountUSD,
            ReceiveCurrencyIso: 'USD',
            ReceiveValueExcludingTax: amountUSD,
            TaxRate: 0,
            TaxName: null,
            TaxCalculation: null,
            SendValue: amountUSD,
            SendCurrencyIso: 'USD',
          },
          CommissionApplied: amountUSD * product.CommissionRate,
          StartedUtc: new Date().toISOString(),
          CompletedUtc: new Date().toISOString(),
          ProcessingState: 'Complete',
          ReceiptText: null,
          ReceiptParams: null,
          AccountNumber: phoneNumber,
        },
        ResultCode: 1,
        ErrorCodes: [],
      };

      console.log('[DingConnect] SIMULATION - Mock transaction created:', {
        TransferRef: mockTransaction.TransferRecord.TransferId.TransferRef,
        DistributorRef: mockTransaction.TransferRecord.TransferId.DistributorRef,
        ProcessingState: mockTransaction.TransferRecord.ProcessingState,
      });

      return mockTransaction;
    }

    // Step 3: Send transfer using DingConnect API
    const response = await fetch(`${BASE_URL}/SendTransfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': DINGCONNECT_API_KEY,
      },
      body: JSON.stringify({
        SkuCode: product.SkuCode,
        SendValue: amountUSD,
        AccountNumber: phoneNumber,
        DistributorRef: distributorRef,
        ValidateOnly: false,
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const error = await response.json();
        console.error('[DingConnect] SendTransfer failed:', error);
        errorMessage = error.ErrorCodes?.[0]?.Code || errorMessage;
      } catch (jsonError) {
        console.error('[DingConnect] SendTransfer failed with status:', response.status);
      }
      throw new Error(`DingConnect transaction failed (${response.status}): ${errorMessage}`);
    }

    const transaction: DingConnectTransaction = await response.json();
    
    console.log('[DingConnect] Transaction successful:', {
      TransferRef: transaction.TransferRecord.TransferId.TransferRef,
      DistributorRef: transaction.TransferRecord.TransferId.DistributorRef,
      ProcessingState: transaction.TransferRecord.ProcessingState,
      ReceiveValue: transaction.TransferRecord.Price.ReceiveValue,
      ReceiveCurrency: transaction.TransferRecord.Price.ReceiveCurrencyIso,
    });

    return transaction;
  } catch (error) {
    console.error('[DingConnect] Recharge error:', error);
    throw error;
  }
}

/**
 * Validate DingConnect configuration
 */
export function isDingConnectConfigured(): boolean {
  return !!DINGCONNECT_API_KEY;
}

/**
 * Test DingConnect connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!isDingConnectConfigured()) {
      console.warn('[DingConnect] API key not configured');
      return false;
    }

    // Try to fetch products for Haiti (test region)
    const products = await getProductsByRegion('HT');
    console.log('[DingConnect] Connection test successful:', {
      productsFound: products.length,
    });
    return true;
  } catch (error) {
    console.error('[DingConnect] Connection test failed:', error);
    return false;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(): Promise<{
  Balance: number;
  CurrencyIso: string;
}> {
  if (SIMULATION_MODE) {
    return {
      Balance: 1000,
      CurrencyIso: 'USD',
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/GetBalance`, {
      method: 'GET',
      headers: {
        'api_key': DINGCONNECT_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get balance: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[DingConnect] GetBalance error:', error);
    throw error;
  }
}

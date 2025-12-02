/**
 * DTone API Integration for Mobile Top-Up
 * Documentation: https://dvs-api-doc.dtone.com/
 */

const DTONE_API_KEY = process.env.DTONE_API_KEY || '';
const DTONE_API_SECRET = process.env.DTONE_API_SECRET || '';

// Support custom base URL (preprod, sandbox, or production)
const BASE_URL = process.env.DTONE_BASE_URL || 
  (process.env.DTONE_USE_SANDBOX === 'true' 
    ? 'https://sandbox-dvs-api.dtone.com/v1'
    : 'https://dvs-api.dtone.com/v1');

// Enable simulation mode if explicitly enabled or if DTone is not configured
const SIMULATION_MODE = process.env.DTONE_SIMULATION === 'true' || 
  (!DTONE_API_KEY || !DTONE_API_SECRET);

/**
 * DTone Product Interface
 */
interface DToneProduct {
  id: number;
  name: string;
  destination: {
    amount: number;
    unit: string;
  };
  prices: {
    retail: {
      amount: number;
      currency: string;
    };
    wholesale: {
      amount: number;
      currency: string;
    };
  };
  operator: {
    id: number;
    name: string;
  };
  regions: Array<{
    code: string;
    name: string;
  }>;
}

/**
 * DTone Transaction Status
 */
interface DToneTransactionStatus {
  class: {
    id: number;
    message: string; // CREATED, CONFIRMED, SUBMITTED, COMPLETED, REJECTED, DECLINED, CANCELLED, REVERSED
  };
  id: number;
  message: string;
}

/**
 * DTone Transaction Response
 */
interface DToneTransaction {
  id: number;
  external_id: string;
  creation_date: string;
  status: DToneTransactionStatus;
  product: {
    id: number;
    name: string;
  };
  prices: {
    retail: {
      amount: number;
      currency: string;
    };
    wholesale: {
      amount: number;
      currency: string;
    };
  };
  credit_party_identifier: {
    mobile_number: string;
  };
}

/**
 * Create HTTP Basic Auth header
 */
function createAuthHeader(): string {
  const credentials = `${DTONE_API_KEY}:${DTONE_API_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Lookup available products for a mobile number
 */
export async function lookupMobileNumber(phoneNumber: string): Promise<{
  operator: any;
  products: DToneProduct[];
}> {
  // SIMULATION MODE: Return mock data for testing
  if (SIMULATION_MODE) {
    console.log('[DTone] SIMULATION MODE - Returning mock products for', phoneNumber);
    
    const mockProducts: DToneProduct[] = [
      {
        id: 1001,
        name: 'Mobile Recharge $5',
        destination: { amount: 5, unit: 'USD' },
        prices: {
          retail: { amount: 5, currency: 'USD' },
          wholesale: { amount: 4.85, currency: 'USD' }
        },
        operator: { id: 501, name: 'Local Operator' },
        regions: [{ code: 'HT', name: 'Haiti' }]
      },
      {
        id: 1002,
        name: 'Mobile Recharge $10',
        destination: { amount: 10, unit: 'USD' },
        prices: {
          retail: { amount: 10, currency: 'USD' },
          wholesale: { amount: 9.70, currency: 'USD' }
        },
        operator: { id: 501, name: 'Local Operator' },
        regions: [{ code: 'HT', name: 'Haiti' }]
      },
      {
        id: 1003,
        name: 'Mobile Recharge $20',
        destination: { amount: 20, unit: 'USD' },
        prices: {
          retail: { amount: 20, currency: 'USD' },
          wholesale: { amount: 19.40, currency: 'USD' }
        },
        operator: { id: 501, name: 'Local Operator' },
        regions: [{ code: 'HT', name: 'Haiti' }]
      }
    ];

    return {
      operator: { id: 501, name: 'Local Operator' },
      products: mockProducts
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/lookup/mobile-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': createAuthHeader(),
      },
      body: JSON.stringify({
        mobile_number: phoneNumber,
        page: 1,
        per_page: 50,
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const error = await response.json();
        console.error('[DTone] Lookup failed:', error);
        errorMessage = error.message || errorMessage;
      } catch (jsonError) {
        // Response body is empty or not JSON
        console.error('[DTone] Lookup failed with status:', response.status, response.statusText);
      }
      throw new Error(`DTone lookup failed (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    
    // DTone preprod returns an array of operators, not an object
    // Structure: [{ id, name, country, identified }, ...]
    const operators = Array.isArray(data) ? data : [];
    const primaryOperator = operators.find(op => op.identified) || operators[0] || null;
    
    console.log('[DTone] Lookup successful:', {
      operator: primaryOperator?.name,
      operatorsCount: operators.length,
    });

    // Fetch products for this operator
    let products: DToneProduct[] = [];
    
    if (primaryOperator && primaryOperator.id) {
      try {
        const productsResponse = await fetch(
          `${BASE_URL}/products?operator.id=${primaryOperator.id}&page=1&per_page=50`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': createAuthHeader(),
            },
          }
        );

        if (productsResponse.ok) {
          products = await productsResponse.json();
          console.log('[DTone] Fetched products:', {
            count: products.length,
            operator: primaryOperator.name,
          });
        } else {
          console.warn('[DTone] Failed to fetch products:', productsResponse.status);
        }
      } catch (productError) {
        console.warn('[DTone] Error fetching products:', productError);
        // Continue with empty products array
      }
    }
    
    return {
      operator: primaryOperator,
      products: products,
    };
  } catch (error) {
    console.error('[DTone] Lookup error:', error);
    throw error;
  }
}

/**
 * Find best matching product for amount
 * DTone products have fixed denominations, we find the closest match
 * PRIORITIZE AIRTIME products over DATA/BUNDLE products for better compatibility
 */
export function findBestProduct(products: DToneProduct[], targetAmount: number): DToneProduct | null {
  if (!products || products.length === 0) {
    return null;
  }

  // First, try to find AIRTIME products only (better compatibility with all numbers)
  const airtimeProducts = products.filter(p => {
    const type = (p as any).type?.toLowerCase() || '';
    const name = p.name?.toLowerCase() || '';
    const benefitType = (p as any).benefits?.[0]?.type?.toLowerCase() || '';
    
    // Exclude products that require account_number instead of mobile_number
    // These are typically PINs, vouchers, etc.
    const requiresAccountNumber = name.includes('pin') || 
                                   name.includes('voucher') || 
                                   name.includes('pln') ||
                                   name.includes('idr') ||
                                   name.includes('pulsa');
    
    // Check if it's an AIRTIME product (not data/bundle/pin)
    const isAirtime = (type === 'airtime' || 
                      type === 'mobile_airtime' ||
                      benefitType === 'airtime' ||
                      benefitType === 'voice') &&
                     !requiresAccountNumber &&
                     !type.includes('data') && 
                     !type.includes('bundle') && 
                     !name.includes('gb') && 
                     !name.includes('mb') &&
                     !name.includes('data') &&
                     !name.includes('internet') &&
                     !name.includes('sms');
    
    return isAirtime;
  });

  // Use airtime products if available, otherwise fall back to all products
  const productsToSearch = airtimeProducts.length > 0 ? airtimeProducts : products;
  
  console.log('[DTone] Product filtering:', {
    total: products.length,
    airtime: airtimeProducts.length,
    using: productsToSearch === airtimeProducts ? 'AIRTIME only' : 'ALL products'
  });

  // Filter and sort products by price difference
  // DTone preprod may have retail=null, so use wholesale or destination/source amount
  const sortedProducts = productsToSearch
    .map(product => {
      // Get product price - try retail first, then wholesale, then destination
      let productPrice = 0;
      
      if (product.prices?.retail?.amount) {
        productPrice = product.prices.retail.amount;
      } else if (product.prices?.wholesale?.amount) {
        productPrice = product.prices.wholesale.amount;
      } else if ((product as any).destination?.amount) {
        productPrice = (product as any).destination.amount;
      } else if ((product as any).source?.amount) {
        productPrice = (product as any).source.amount;
      }
      
      return {
        product,
        productPrice,
        priceDiff: Math.abs(productPrice - targetAmount),
      };
    })
    .filter(item => item.productPrice > 0) // Filter out products with no valid price
    .sort((a, b) => a.priceDiff - b.priceDiff);

  // Return the closest match
  return sortedProducts[0]?.product || null;
}

/**
 * Send mobile top-up via DTone API
 * 
 * @param phoneNumber - International format phone number (e.g., +50937001234)
 * @param amountUSD - Amount in USD to send
 * @param externalId - Your unique transaction ID for idempotency
 * @returns DTone transaction object
 */
export async function sendRecharge(
  phoneNumber: string,
  amountUSD: number,
  externalId: string
): Promise<DToneTransaction> {
  try {
    const mode = SIMULATION_MODE ? 'SIMULATION' :
                 BASE_URL.includes('sandbox') ? 'SANDBOX' : 
                 BASE_URL.includes('preprod') ? 'PREPROD' : 'PRODUCTION';
    
    console.log('[DTone] Initiating recharge:', {
      phoneNumber,
      amountUSD,
      externalId,
      mode,
      baseUrl: SIMULATION_MODE ? 'SIMULATION' : BASE_URL,
    });

    // Step 1: Lookup available products for this number
    const lookup = await lookupMobileNumber(phoneNumber);
    
    if (!lookup.products || lookup.products.length === 0) {
      throw new Error(`No DTone products available for ${phoneNumber}`);
    }

    // Step 2: Find best matching product for the amount
    const product = findBestProduct(lookup.products, amountUSD);
    
    if (!product) {
      throw new Error(`No suitable product found for amount ${amountUSD} USD`);
    }

    // Get product price for logging
    const productPrice = product.prices?.retail?.amount || 
                        product.prices?.wholesale?.amount ||
                        (product as any).destination?.amount ||
                        (product as any).source?.amount ||
                        0;
    
    console.log('[DTone] Selected product:', {
      id: product.id,
      name: product.name,
      amount: productPrice,
      currency: (product.prices?.retail as any)?.currency || 
               (product.prices?.wholesale as any)?.unit || 
               'USD',
    });

    // SIMULATION MODE: Return mock transaction
    if (SIMULATION_MODE) {
      const mockTransaction: DToneTransaction = {
        id: Math.floor(Math.random() * 1000000),
        external_id: externalId,
        creation_date: new Date().toISOString(),
        status: {
          class: { id: 7, message: 'COMPLETED' },
          id: 701,
          message: 'Transaction completed successfully (SIMULATED)'
        },
        product: {
          id: product.id,
          name: product.name
        },
        prices: {
          retail: product.prices.retail,
          wholesale: product.prices.wholesale
        },
        credit_party_identifier: {
          mobile_number: phoneNumber
        }
      };

      console.log('[DTone] SIMULATION - Mock transaction created:', {
        id: mockTransaction.id,
        external_id: mockTransaction.external_id,
        status: mockTransaction.status.class.message,
      });

      return mockTransaction;
    }

    // Step 3: Create transaction (sync mode with auto_confirm)
    const response = await fetch(`${BASE_URL}/sync/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': createAuthHeader(),
      },
      body: JSON.stringify({
        external_id: externalId,
        product_id: product.id,
        auto_confirm: true, // Automatically confirm the transaction
        credit_party_identifier: {
          mobile_number: phoneNumber,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[DTone] Transaction failed:', error);
      throw new Error(`DTone transaction failed: ${error.message || response.statusText}`);
    }

    const transaction: DToneTransaction = await response.json();
    
    console.log('[DTone] Transaction successful:', {
      id: transaction.id,
      external_id: transaction.external_id,
      status: transaction.status.class.message,
      operator: lookup.operator?.name,
    });

    return transaction;
  } catch (error) {
    console.error('[DTone] Recharge error:', error);
    throw error;
  }
}

/**
 * Check transaction status
 */
export async function getTransactionStatus(transactionId: number): Promise<DToneTransaction> {
  try {
    const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': createAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get transaction status: ${error.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[DTone] Status check error:', error);
    throw error;
  }
}

/**
 * Validate DTone configuration
 */
export function isDToneConfigured(): boolean {
  return !!(DTONE_API_KEY && DTONE_API_SECRET);
}

/**
 * Test DTone connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!isDToneConfigured()) {
      console.warn('[DTone] API credentials not configured');
      return false;
    }

    // Try a simple lookup with a test number
    const isSandbox = BASE_URL.includes('sandbox');
    const testNumber = isSandbox ? '+12345678001' : '+50937001234'; // Sandbox or Haiti test
    await lookupMobileNumber(testNumber);
    return true;
  } catch (error) {
    console.error('[DTone] Connection test failed:', error);
    return false;
  }
}

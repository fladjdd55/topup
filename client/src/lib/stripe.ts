import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;
let publishableKey: string | null = null;

async function fetchPublishableKey(): Promise<string | null> {
  if (publishableKey) {
    return publishableKey;
  }
  
  const response = await fetch('/api/config/stripe-key');
  const data = await response.json();
  publishableKey = data.publishableKey || null;
  return publishableKey;
}

export const getStripe = async (): Promise<Stripe | null> => {
  if (!stripePromise) {
    try {
      const key = await fetchPublishableKey();
      
      if (!key) {
        console.error('Stripe publishable key is not configured');
        return null;
      }
      
      stripePromise = loadStripe(key);
    } catch (error) {
      console.error('Failed to fetch Stripe publishable key:', error);
      return null;
    }
  }
  
  return stripePromise;
};

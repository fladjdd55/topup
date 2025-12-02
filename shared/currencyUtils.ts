/**
 * DEPRECATED: Ce fichier réexporte maintenant les fonctions de currencyRates.ts
 * pour assurer la compatibilité avec le code existant.
 * Utilisez directement @shared/currencyRates pour les nouveaux développements.
 */

import { convertFromUSD, convertToUSD } from './currencyRates';

export { 
  convertToUSD, 
  convertFromUSD, 
  CURRENCY_TO_USD_RATES as EXCHANGE_RATES,
  formatCurrency,
  CURRENCY_NAMES
} from './currencyRates';

/**
 * Retourne la limite de $300 USD convertie dans la devise spécifiée
 * @param currency - Devise cible
 * @returns Limite convertie
 */
export function getGuestLimit(currency: string): number {
  const USD_LIMIT = 300;
  return convertFromUSD(USD_LIMIT, currency);
}

/**
 * Vérifie si un montant dépasse la limite pour invités
 * @param amount - Montant à vérifier
 * @param currency - Devise du montant
 * @returns true si le montant dépasse la limite
 */
export function exceedsGuestLimit(amount: number, currency: string): boolean {
  const limit = getGuestLimit(currency);
  return amount > limit;
}

// Taux de change vers USD (mis à jour: Octobre 2025)
// Base: 1 USD = X unités de devise locale

export const CURRENCY_TO_USD_RATES: Record<string, number> = {
  // USD est la base
  USD: 1.00,
  
  // Amériques
  HTG: 0.0076,    // 1 HTG = 0.0076 USD (132 HTG = 1 USD)
  CAD: 0.74,      // 1 CAD = 0.74 USD
  DOP: 0.017,     // 1 DOP = 0.017 USD (59 DOP = 1 USD)
  JMD: 0.0064,    // 1 JMD = 0.0064 USD (156 JMD = 1 USD)
  MXN: 0.059,     // 1 MXN = 0.059 USD (17 MXN = 1 USD)
  BRL: 0.20,      // 1 BRL = 0.20 USD (5 BRL = 1 USD)
  COP: 0.00025,   // 1 COP = 0.00025 USD (4000 COP = 1 USD)
  PEN: 0.27,      // 1 PEN = 0.27 USD (3.7 PEN = 1 USD)
  CLP: 0.0011,    // 1 CLP = 0.0011 USD (900 CLP = 1 USD)
  ARS: 0.0010,    // 1 ARS = 0.001 USD (1000 ARS = 1 USD)
  VES: 0.028,     // 1 VES = 0.028 USD (36 VES = 1 USD)
  BOB: 0.14,      // 1 BOB = 0.14 USD (7 BOB = 1 USD)
  GTQ: 0.13,      // 1 GTQ = 0.13 USD (7.7 GTQ = 1 USD)
  HNL: 0.040,     // 1 HNL = 0.040 USD (25 HNL = 1 USD)
  NIO: 0.027,     // 1 NIO = 0.027 USD (37 NIO = 1 USD)
  CRC: 0.0019,    // 1 CRC = 0.0019 USD (520 CRC = 1 USD)
  PAB: 1.00,      // 1 PAB = 1.00 USD (parité)
  
  // Europe
  EUR: 1.08,      // 1 EUR = 1.08 USD
  GBP: 1.27,      // 1 GBP = 1.27 USD
  CHF: 1.12,      // 1 CHF = 1.12 USD
  PLN: 0.25,      // 1 PLN = 0.25 USD (4 PLN = 1 USD)
  RON: 0.22,      // 1 RON = 0.22 USD (4.5 RON = 1 USD)
  CZK: 0.044,     // 1 CZK = 0.044 USD (23 CZK = 1 USD)
  HUF: 0.0028,    // 1 HUF = 0.0028 USD (360 HUF = 1 USD)
  SEK: 0.096,     // 1 SEK = 0.096 USD (10.4 SEK = 1 USD)
  NOK: 0.092,     // 1 NOK = 0.092 USD (11 NOK = 1 USD)
  DKK: 0.14,      // 1 DKK = 0.14 USD (7 DKK = 1 USD)
  UAH: 0.024,     // 1 UAH = 0.024 USD (41 UAH = 1 USD)
  
  // Afrique
  NGN: 0.00063,   // 1 NGN = 0.00063 USD (1600 NGN = 1 USD)
  GHS: 0.063,     // 1 GHS = 0.063 USD (16 GHS = 1 USD)
  KES: 0.0077,    // 1 KES = 0.0077 USD (130 KES = 1 USD)
  XOF: 0.0016,    // 1 XOF = 0.0016 USD (620 XOF = 1 USD) - Franc CFA (Sénégal, CI, Bénin, Togo, Mali, Burkina Faso)
  XAF: 0.0016,    // 1 XAF = 0.0016 USD (620 XAF = 1 USD) - Franc CFA (Cameroun)
  TZS: 0.00037,   // 1 TZS = 0.00037 USD (2700 TZS = 1 USD)
  UGX: 0.00027,   // 1 UGX = 0.00027 USD (3700 UGX = 1 USD)
  ZAR: 0.055,     // 1 ZAR = 0.055 USD (18 ZAR = 1 USD)
  EGP: 0.020,     // 1 EGP = 0.020 USD (50 EGP = 1 USD)
  MAD: 0.10,      // 1 MAD = 0.10 USD (10 MAD = 1 USD)
  TND: 0.32,      // 1 TND = 0.32 USD (3.1 TND = 1 USD)
  DZD: 0.0074,    // 1 DZD = 0.0074 USD (135 DZD = 1 USD)
  ETB: 0.0081,    // 1 ETB = 0.0081 USD (123 ETB = 1 USD)
  RWF: 0.00073,   // 1 RWF = 0.00073 USD (1370 RWF = 1 USD)
  ZMW: 0.037,     // 1 ZMW = 0.037 USD (27 ZMW = 1 USD)
  
  // Asie
  PHP: 0.017,     // 1 PHP = 0.017 USD (58 PHP = 1 USD)
  INR: 0.012,     // 1 INR = 0.012 USD (83 INR = 1 USD)
  PKR: 0.0036,    // 1 PKR = 0.0036 USD (280 PKR = 1 USD)
  BDT: 0.0084,    // 1 BDT = 0.0084 USD (120 BDT = 1 USD)
  VND: 0.000040,  // 1 VND = 0.000040 USD (25000 VND = 1 USD)
  IDR: 0.000063,  // 1 IDR = 0.000063 USD (16000 IDR = 1 USD)
  THB: 0.028,     // 1 THB = 0.028 USD (36 THB = 1 USD)
  MYR: 0.22,      // 1 MYR = 0.22 USD (4.6 MYR = 1 USD)
  SGD: 0.74,      // 1 SGD = 0.74 USD
  LKR: 0.0031,    // 1 LKR = 0.0031 USD (325 LKR = 1 USD)
  NPR: 0.0075,    // 1 NPR = 0.0075 USD (133 NPR = 1 USD)
  MMK: 0.00048,   // 1 MMK = 0.00048 USD (2100 MMK = 1 USD)
  KHR: 0.00024,   // 1 KHR = 0.00024 USD (4100 KHR = 1 USD)
  CNY: 0.14,      // 1 CNY = 0.14 USD (7.2 CNY = 1 USD)
  JPY: 0.0067,    // 1 JPY = 0.0067 USD (150 JPY = 1 USD)
  KRW: 0.00073,   // 1 KRW = 0.00073 USD (1370 KRW = 1 USD)
  
  // Moyen-Orient
  LBP: 0.000011,  // 1 LBP = 0.000011 USD (89500 LBP = 1 USD)
  JOD: 1.41,      // 1 JOD = 1.41 USD
  SAR: 0.27,      // 1 SAR = 0.27 USD (3.75 SAR = 1 USD)
  AED: 0.27,      // 1 AED = 0.27 USD (3.67 AED = 1 USD)
  KWD: 3.25,      // 1 KWD = 3.25 USD
  QAR: 0.27,      // 1 QAR = 0.27 USD (3.64 QAR = 1 USD)
  OMR: 2.60,      // 1 OMR = 2.60 USD
  BHD: 2.65,      // 1 BHD = 2.65 USD
  IQD: 0.00076,   // 1 IQD = 0.00076 USD (1310 IQD = 1 USD)
  YER: 0.0040,    // 1 YER = 0.0040 USD (250 YER = 1 USD)
  TRY: 0.029,     // 1 TRY = 0.029 USD (34 TRY = 1 USD)
  ILS: 0.27,      // 1 ILS = 0.27 USD (3.7 ILS = 1 USD)
  
  // Océanie
  AUD: 0.65,      // 1 AUD = 0.65 USD
  NZD: 0.60,      // 1 NZD = 0.60 USD
};

/**
 * Noms complets des devises pour affichage dans l'interface
 */
export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'Dollar américain',
  HTG: 'Gourde haïtienne',
  CAD: 'Dollar canadien',
  DOP: 'Peso dominicain',
  JMD: 'Dollar jamaïcain',
  MXN: 'Peso mexicain',
  BRL: 'Real brésilien',
  COP: 'Peso colombien',
  PEN: 'Sol péruvien',
  CLP: 'Peso chilien',
  ARS: 'Peso argentin',
  VES: 'Bolivar vénézuélien',
  BOB: 'Boliviano',
  GTQ: 'Quetzal guatémaltèque',
  HNL: 'Lempira hondurien',
  NIO: 'Córdoba nicaraguayen',
  CRC: 'Colón costaricien',
  PAB: 'Balboa panaméen',
  EUR: 'Euro',
  GBP: 'Livre sterling',
  CHF: 'Franc suisse',
  PLN: 'Złoty polonais',
  RON: 'Leu roumain',
  CZK: 'Couronne tchèque',
  HUF: 'Forint hongrois',
  SEK: 'Couronne suédoise',
  NOK: 'Couronne norvégienne',
  DKK: 'Couronne danoise',
  UAH: 'Hryvnia ukrainienne',
  NGN: 'Naira nigérian',
  GHS: 'Cedi ghanéen',
  KES: 'Shilling kenyan',
  XOF: 'Franc CFA (BCEAO)',
  XAF: 'Franc CFA (BEAC)',
  TZS: 'Shilling tanzanien',
  UGX: 'Shilling ougandais',
  ZAR: 'Rand sud-africain',
  EGP: 'Livre égyptienne',
  MAD: 'Dirham marocain',
  TND: 'Dinar tunisien',
  DZD: 'Dinar algérien',
  ETB: 'Birr éthiopien',
  RWF: 'Franc rwandais',
  ZMW: 'Kwacha zambien',
  PHP: 'Peso philippin',
  INR: 'Roupie indienne',
  PKR: 'Roupie pakistanaise',
  BDT: 'Taka bangladais',
  VND: 'Dong vietnamien',
  IDR: 'Roupie indonésienne',
  THB: 'Baht thaïlandais',
  MYR: 'Ringgit malaisien',
  SGD: 'Dollar singapourien',
  LKR: 'Roupie sri-lankaise',
  NPR: 'Roupie népalaise',
  MMK: 'Kyat birman',
  KHR: 'Riel cambodgien',
  CNY: 'Yuan chinois',
  JPY: 'Yen japonais',
  KRW: 'Won sud-coréen',
  LBP: 'Livre libanaise',
  JOD: 'Dinar jordanien',
  SAR: 'Riyal saoudien',
  AED: 'Dirham émirati',
  KWD: 'Dinar koweïtien',
  QAR: 'Riyal qatari',
  OMR: 'Rial omanais',
  BHD: 'Dinar bahreïni',
  IQD: 'Dinar irakien',
  YER: 'Rial yéménite',
  TRY: 'Livre turque',
  ILS: 'Shekel israélien',
  AUD: 'Dollar australien',
  NZD: 'Dollar néo-zélandais',
};

/**
 * Convertit un montant d'une devise locale vers USD
 * @param amount Montant dans la devise locale
 * @param currency Code de la devise (HTG, EUR, NGN, etc.)
 * @returns Montant converti en USD
 */
export function convertToUSD(amount: number, currency: string): number {
  if (currency === 'USD') return amount;
  
  const rate = CURRENCY_TO_USD_RATES[currency];
  if (!rate) {
    console.warn(`Taux de change non trouvé pour ${currency}, utilisation de 1:1`);
    return amount;
  }
  
  // Conversion: montant_local * taux = montant_USD
  const usdAmount = amount * rate;
  return parseFloat(usdAmount.toFixed(2));
}

/**
 * Convertit un montant USD vers une devise locale
 * @param usdAmount Montant en USD
 * @param currency Code de la devise cible
 * @returns Montant converti dans la devise locale
 */
export function convertFromUSD(usdAmount: number, currency: string): number {
  if (currency === 'USD') return usdAmount;
  
  const rate = CURRENCY_TO_USD_RATES[currency];
  if (!rate) {
    console.warn(`Taux de change non trouvé pour ${currency}, utilisation de 1:1`);
    return usdAmount;
  }
  
  // Conversion inverse: montant_USD / taux = montant_local
  const localAmount = usdAmount / rate;
  return parseFloat(localAmount.toFixed(2));
}

/**
 * Formate un montant avec sa devise
 * @param amount Montant
 * @param currency Code de la devise
 * @returns Montant formaté (ex: "50.00 EUR", "$50.00")
 */
export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Minimum requis pour les recharges en USD
 */
const MINIMUM_RECHARGE_USD = 5.00;

/**
 * Calcule le montant minimum requis dans une devise locale
 * pour respecter le minimum de $5.00 USD
 * @param currency Code de la devise
 * @returns Montant minimum dans la devise locale
 */
export function getMinimumAmount(currency: string): number {
  if (currency === 'USD') return MINIMUM_RECHARGE_USD;
  
  // Convertir $5.00 USD vers la devise locale
  const minimumLocal = convertFromUSD(MINIMUM_RECHARGE_USD, currency);
  // Arrondir au chiffre supérieur pour être sûr
  return Math.ceil(minimumLocal);
}

/**
 * Valide si un montant dans une devise locale respecte le minimum de $5 USD
 * @param amount Montant dans la devise locale
 * @param currency Code de la devise
 * @returns true si valide, false sinon
 */
export function isAmountValid(amount: number, currency: string): boolean {
  const usdAmount = convertToUSD(amount, currency);
  return usdAmount >= MINIMUM_RECHARGE_USD;
}

/**
 * Récupère le message d'erreur pour montant trop petit
 * @param currency Code de la devise
 * @returns Message d'erreur avec montant minimum requis
 */
export function getMinimumAmountMessage(currency: string): string {
  const minimum = getMinimumAmount(currency);
  if (currency === 'USD') {
    return `Le montant minimum est de $${minimum.toFixed(2)} USD`;
  }
  return `Le montant minimum est de ${minimum} ${currency} (équivalent à $${MINIMUM_RECHARGE_USD.toFixed(2)} USD)`;
}

/**
 * Génère des montants rapides selon la devise
 * Basé sur $5, $10, $20, $50, $100 USD
 * @param currency Code de la devise
 * @returns Tableau de montants formatés pour la devise
 */
export function getQuickAmounts(currency: string): string[] {
  const usdAmounts = [5, 10, 20, 50, 100];
  
  if (currency === 'USD') {
    return usdAmounts.map(a => a.toString());
  }
  
  // Convertir chaque montant USD vers la devise locale
  return usdAmounts.map(usdAmount => {
    const localAmount = convertFromUSD(usdAmount, currency);
    // Arrondir pour avoir des chiffres ronds
    return Math.ceil(localAmount).toString();
  });
}

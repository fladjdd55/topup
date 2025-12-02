import { sendWhatsAppMetaMessage } from './whatsappMeta';
import { validatePhoneNumber } from '@shared/phoneValidation';

// Types
interface UserSession {
  phoneNumber: string;
  language: 'fr' | 'en' | 'ht' | 'es';
  state: 'menu' | 'recharge' | 'support' | 'tracking';
  lastInteraction: Date;
  context?: any;
}

// In-memory session storage (Note: In production, consider moving this to the database)
const userSessions = new Map<string, UserSession>();

// Translations
const botTranslations = {
  welcome: {
    fr: `👋 Bienvenue sur TapTopLoad !

Je suis votre assistant virtuel disponible 24/7.

*Menu principal :*
1️⃣ 📱 Faire une recharge
2️⃣ 📊 Vérifier une transaction
3️⃣ ❓ Questions fréquentes
4️⃣ 👤 Parler à un agent
5️⃣ 🌍 Changer de langue

Tapez le numéro de votre choix.`,
    en: `👋 Welcome to TapTopLoad!

I'm your virtual assistant available 24/7.

*Main Menu:*
1️⃣ 📱 Make a top-up
2️⃣ 📊 Check transaction
3️⃣ ❓ FAQs
4️⃣ 👤 Talk to an agent
5️⃣ 🌍 Change language

Type the number of your choice.`,
    ht: `👋 Byenveni nan TapTopLoad!

Mwen se asistan vityèl ou disponib 24/7.

*Meni prensipal:*
1️⃣ 📱 Fè yon rechaj
2️⃣ 📊 Verifye yon tranzaksyon
3️⃣ ❓ Kesyon yo poze souvan
4️⃣ 👤 Pale ak yon ajan
5️⃣ 🌍 Chanje lang

Tape nimewo chwa ou.`,
    es: `👋 ¡Bienvenido a TapTopLoad!

Soy tu asistente virtual disponible 24/7.

*Menú principal:*
1️⃣ 📱 Hacer una recarga
2️⃣ 📊 Verificar transacción
3️⃣ ❓ Preguntas frecuentes
4️⃣ 👤 Hablar con un agente
5️⃣ 🌍 Cambiar idioma

Escribe el número de tu elección.`
  },
  rechargeStart: {
    fr: `📱 *Nouvelle Recharge*

Pour effectuer une recharge, envoyez-moi :
• Le numéro à recharger (avec indicatif)
• Le montant

Exemple: +50938123456 500

Ou tapez 0 pour revenir au menu.`,
    en: `📱 *New Top-Up*

To make a top-up, send me:
• The number to top up (with country code)
• The amount

Example: +50938123456 500

Or type 0 to return to menu.`,
    ht: `📱 *Nouvo Rechaj*

Pou fè yon rechaj, voye m:
• Nimewo pou rechaje (ak endikasyon peyi)
• Montan an

Egzanp: +50938123456 500

Oswa tape 0 pou tounen nan meni.`,
    es: `📱 *Nueva Recarga*

Para hacer una recarga, envíame:
• El número a recargar (con código de país)
• El monto

Ejemplo: +50938123456 500

O escribe 0 para volver al menú.`
  },
  invalidNumber: {
    fr: `❌ Numéro invalide.

Veuillez vérifier le format (ex: +509...) et réessayer.`,
    en: `❌ Invalid number.

Please check the format (e.g. +509...) and try again.`,
    ht: `❌ Nimewo a pa bon.

Tanpri verifye fòma a (egz: +509...) epi eseye ankò.`,
    es: `❌ Número inválido.

Por favor verifica el formato (ej: +509...) e intenta de nuevo.`
  },
  faq: {
    fr: `❓ *Questions Fréquentes*

1️⃣ Comment faire une recharge ?
2️⃣ Quels pays sont supportés ?
3️⃣ Combien coûte le service ?
4️⃣ Combien de temps prend la recharge ?
5️⃣ Comment suivre ma transaction ?
0️⃣ Retour au menu principal

Tapez le numéro de votre question.`,
    en: `❓ *Frequently Asked Questions*

1️⃣ How to make a top-up?
2️⃣ Which countries are supported?
3️⃣ How much does the service cost?
4️⃣ How long does a top-up take?
5️⃣ How to track my transaction?
0️⃣ Back to main menu

Type the number of your question.`,
    ht: `❓ *Kesyon yo Poze Souvan*

1️⃣ Kijan pou fè yon rechaj?
2️⃣ Ki peyi yo sipòte?
3️⃣ Konbyen sèvis la koute?
4️⃣ Konbyen tan rechaj la pran?
5️⃣ Kijan pou swiv tranzaksyon mwen?
0️⃣ Retounen nan meni prensipal

Tape nimewo kesyon ou.`,
    es: `❓ *Preguntas Frecuentes*

1️⃣ ¿Cómo hacer una recarga?
2️⃣ ¿Qué países están soportados?
3️⃣ ¿Cuánto cuesta el servicio?
4️⃣ ¿Cuánto tarda una recarga?
5️⃣ ¿Cómo rastrear mi transacción?
0️⃣ Volver al menú principal

Escribe el número de tu pregunta.`
  },
  faq_answer1: {
    fr: `💡 *Comment faire une recharge ?*

C'est très simple :
1. Visitez notre site web taptopload.com
2. Entrez le numéro à recharger
3. Choisissez le montant
4. Payez en toute sécurité
5. Crédit livré instantanément !

Ou tapez 1 depuis notre menu WhatsApp.

Tapez 0 pour revenir au menu FAQ.`,
    en: `💡 *How to make a top-up?*

It's very simple:
1. Visit our website taptopload.com
2. Enter the number to top up
3. Choose the amount
4. Pay securely
5. Credit delivered instantly!

Or type 1 from our WhatsApp menu.

Type 0 to return to FAQ menu.`,
    ht: `💡 *Kijan pou fè yon rechaj?*

Li senp anpil:
1. Vizite sit nou taptopload.com
2. Antre nimewo pou rechaje
3. Chwazi montan an
4. Peye an sekirite
5. Kredi livre imedyatman!

Oswa tape 1 nan meni WhatsApp nou.

Tape 0 pou tounen nan meni FAQ.`,
    es: `💡 *¿Cómo hacer una recarga?*

Es muy simple:
1. Visita nuestro sitio web taptopload.com
2. Ingresa el número a recargar
3. Elige el monto
4. Paga de forma segura
5. ¡Crédito entregado al instante!

O escribe 1 desde nuestro menú WhatsApp.

Escribe 0 para volver al menú FAQ.`
  },
  faq_answer2: {
    fr: `🌍 *Pays supportés*

Nous couvrons 160+ pays dont :
• 🇭🇹 Haïti (Digicel, Natcom)
• 🇺🇸 États-Unis
• 🇨🇦 Canada
• 🇲🇽 Mexique
• 🇩🇴 République Dominicaine
• 🇯🇲 Jamaïque
• 🇫🇷 France
• Et bien plus !

Devises supportées : USD, EUR, CAD, GBP, HTG, DOP, JMD, MXN, BRL

Tapez 0 pour revenir au menu FAQ.`,
    en: `🌍 *Supported countries*

We cover 160+ countries including:
• 🇭🇹 Haiti (Digicel, Natcom)
• 🇺🇸 United States
• 🇨🇦 Canada
• 🇲🇽 Mexico
• 🇩🇴 Dominican Republic
• 🇯🇲 Jamaica
• 🇫🇷 France
• And many more!

Supported currencies: USD, EUR, CAD, GBP, HTG, DOP, JMD, MXN, BRL

Type 0 to return to FAQ menu.`,
    ht: `🌍 *Peyi yo sipòte*

Nou kouvri 160+ peyi tankou:
• 🇭🇹 Ayiti (Digicel, Natcom)
• 🇺🇸 Etazini
• 🇨🇦 Kanada
• 🇲🇽 Meksik
• 🇩🇴 Repiblik Dominikèn
• 🇯🇲 Jamayik
• 🇫🇷 Frans
• Epi plis ankò!

Lajan yo sipòte: USD, EUR, CAD, GBP, HTG, DOP, JMD, MXN, BRL

Tape 0 pou tounen nan meni FAQ.`,
    es: `🌍 *Países soportados*

Cubrimos más de 160 países incluyendo:
• 🇭🇹 Haití (Digicel, Natcom)
• 🇺🇸 Estados Unidos
• 🇨🇦 Canadá
• 🇲🇽 México
• 🇩🇴 República Dominicana
• 🇯🇲 Jamaica
• 🇫🇷 Francia
• ¡Y muchos más!

Monedas soportadas: USD, EUR, CAD, GBP, HTG, DOP, JMD, MXN, BRL

Escribe 0 para volver al menú FAQ.`
  },
  faq_answer3: {
    fr: `💰 *Coût du service*

Commission : 3% par transaction
Exemple : Pour une recharge de 100$, vous payez 103$

✨ *Programme de fidélité* :
• Bronze : 3% de remise
• Argent : 2.5% de remise
• Or : 2% de remise
• Platine : 1.5% de remise

1 point = 1$ dépensé

Tapez 0 pour revenir au menu FAQ.`,
    en: `💰 *Service cost*

Commission: 3% per transaction
Example: For a $100 top-up, you pay $103

✨ *Loyalty program*:
• Bronze: 3% discount
• Silver: 2.5% discount
• Gold: 2% discount
• Platinum: 1.5% discount

1 point = $1 spent

Type 0 to return to FAQ menu.`,
    ht: `💰 *Pri sèvis la*

Komisyon: 3% pa tranzaksyon
Egzanp: Pou yon rechaj 100$, ou peye 103$

✨ *Pwogram fidelite*:
• Bwonz: 3% reduksyon
• Ajan: 2.5% reduksyon
• Lò: 2% reduksyon
• Platin: 1.5% reduksyon

1 pwen = 1$ depanse

Tape 0 pou tounen nan meni FAQ.`,
    es: `💰 *Costo del servicio*

Comisión: 3% por transacción
Ejemplo: Para una recarga de $100, pagas $103

✨ *Programa de fidelidad*:
• Bronce: 3% de descuento
• Plata: 2.5% de descuento
• Oro: 2% de descuento
• Platino: 1.5% de descuento

1 punto = $1 gastado

Escribe 0 para volver al menú FAQ.`
  },
  faq_answer4: {
    fr: `⚡ *Délai de livraison*

Nos recharges sont instantanées !

⏱️ En général :
• 5-30 secondes pour la plupart des opérateurs
• Maximum 5 minutes dans de rares cas

Si votre crédit n'arrive pas après 10 minutes, contactez notre support.

Tapez 0 pour revenir au menu FAQ.`,
    en: `⚡ *Delivery time*

Our top-ups are instant!

⏱️ Generally:
• 5-30 seconds for most operators
• Maximum 5 minutes in rare cases

If your credit doesn't arrive after 10 minutes, contact our support.

Type 0 to return to FAQ menu.`,
    ht: `⚡ *Tan livrezon*

Rechaj nou yo instantane!

⏱️ An jeneral:
• 5-30 segond pou pifò operatè
• Maksimòm 5 minit nan ka ra

Si kredi ou pa rive apre 10 minit, kontakte sipò nou.

Tape 0 pou tounen nan meni FAQ.`,
    es: `⚡ *Tiempo de entrega*

¡Nuestras recargas son instantáneas!

⏱️ Generalmente:
• 5-30 segundos para la mayoría de operadores
• Máximo 5 minutos en casos raros

Si tu crédito no llega después de 10 minutos, contacta nuestro soporte.

Escribe 0 para volver al menú FAQ.`
  },
  faq_answer5: {
    fr: `🔍 *Suivre une transaction*

Vous pouvez suivre votre transaction :
1. Sur notre site web dans votre tableau de bord
2. Par email (confirmation automatique)
3. Tapez 2 dans notre menu WhatsApp

Vous aurez besoin :
• Votre numéro de transaction
• Ou le numéro rechargé

Tapez 0 pour revenir au menu FAQ.`,
    en: `🔍 *Track a transaction*

You can track your transaction:
1. On our website in your dashboard
2. By email (automatic confirmation)
3. Type 2 in our WhatsApp menu

You will need:
• Your transaction number
• Or the topped-up number

Type 0 to return to FAQ menu.`,
    ht: `🔍 *Swiv yon tranzaksyon*

Ou ka swiv tranzaksyon ou:
1. Sou sit wèb nou nan tablo bò ou
2. Pa imèl (konfimasyon otomatik)
3. Tape 2 nan meni WhatsApp nou

Ou ap bezwen:
• Nimewo tranzaksyon ou
• Oswa nimewo ki te rechaje

Tape 0 pou tounen nan meni FAQ.`,
    es: `🔍 *Rastrear una transacción*

Puedes rastrear tu transacción:
1. En nuestro sitio web en tu panel
2. Por correo electrónico (confirmación automática)
3. Escribe 2 en nuestro menú WhatsApp

Necesitarás:
• Tu número de transacción
• O el número recargado

Escribe 0 para volver al menú FAQ.`
  },
  languageMenu: {
    fr: `🌍 *Changer de langue*

Choisissez votre langue :
1️⃣ Français
2️⃣ English
3️⃣ Kreyòl Ayisyen
4️⃣ Español

Tapez le numéro correspondant.`,
    en: `🌍 *Change Language*

Choose your language:
1️⃣ Français
2️⃣ English
3️⃣ Kreyòl Ayisyen
4️⃣ Español

Type the corresponding number.`,
    ht: `🌍 *Chanje Lang*

Chwazi lang ou:
1️⃣ Français
2️⃣ English
3️⃣ Kreyòl Ayisyen
4️⃣ Español

Tape nimewo ki koresponn.`,
    es: `🌍 *Cambiar Idioma*

Elige tu idioma:
1️⃣ Français
2️⃣ English
3️⃣ Kreyòl Ayisyen
4️⃣ Español

Escribe el número correspondiente.`
  },
  languageChanged: {
    fr: `✅ Langue changée en Français`,
    en: `✅ Language changed to English`,
    ht: `✅ Lang chanje an Kreyòl Ayisyen`,
    es: `✅ Idioma cambiado a Español`
  },
  agentTransfer: {
    fr: `👤 *Transfert vers un agent*

Un de nos agents va vous contacter sous peu.

En attendant, vous pouvez :
• Tapez 0 pour revenir au menu
• Ou continuez la conversation ici

Heures d'ouverture : 8h-20h (GMT-5)`,
    en: `👤 *Transfer to agent*

One of our agents will contact you shortly.

In the meantime, you can:
• Type 0 to return to menu
• Or continue the conversation here

Business hours: 8am-8pm (GMT-5)`,
    ht: `👤 *Transfere bay yon ajan*

Youn nan ajan nou yo ap kontakte ou talè.

Pandan tan sa:
• Tape 0 pou tounen nan meni
• Oswa kontinye konvèsasyon an isit

Èdouvèti: 8è-20è (GMT-5)`,
    es: `👤 *Transferencia a agente*

Uno de nuestros agentes te contactará en breve.

Mientras tanto, puedes:
• Escribir 0 para volver al menú
• O continuar la conversación aquí

Horario: 8am-8pm (GMT-5)`
  },
  trackingPrompt: {
    fr: `📊 *Vérifier une transaction*

Envoyez-moi :
• Votre numéro de transaction
• Ou le numéro qui a été rechargé

Exemple: TRX123456
Ou: +50938123456

Tapez 0 pour revenir au menu.`,
    en: `📊 *Check transaction*

Send me:
• Your transaction number
• Or the number that was topped up

Example: TRX123456
Or: +50938123456

Type 0 to return to menu.`,
    ht: `📊 *Verifye yon tranzaksyon*

Voye m:
• Nimewo tranzaksyon ou
• Oswa nimewo ki te rechaje

Egzanp: TRX123456
Oswa: +50938123456

Tape 0 pou tounen nan meni.`,
    es: `📊 *Verificar transacción*

Envíame:
• Tu número de transacción
• O el número que fue recargado

Ejemplo: TRX123456
O: +50938123456

Escribe 0 para volver al menú.`
  },
  unknownCommand: {
    fr: `❌ Je n'ai pas compris votre message.

Tapez 0 pour revenir au menu principal.`,
    en: `❌ I didn't understand your message.

Type 0 to return to main menu.`,
    ht: `❌ Mwen pa konprann mesaj ou.

Tape 0 pou tounen nan meni prensipal.`,
    es: `❌ No entendí tu mensaje.

Escribe 0 para volver al menú principal.`
  },
  rechargeLink: {
    fr: (url: string) => `📱 *Continuer votre recharge*

Cliquez ici pour finaliser : ${url}

Ou visitez notre site : https://taptopload.com`,
    en: (url: string) => `📱 *Continue your top-up*

Click here to finalize: ${url}

Or visit our site: https://taptopload.com`,
    ht: (url: string) => `📱 *Kontinye rechaj ou*

Klike isit pou finalize: ${url}

Oswa vizite sit nou: https://taptopload.com`,
    es: (url: string) => `📱 *Continúa tu recarga*

Haz clic aquí para finalizar: ${url}

O visita nuestro sitio: https://taptopload.com`
  }
};

// Obtenir ou créer une session utilisateur
function getOrCreateSession(phoneNumber: string): UserSession {
  let session = userSessions.get(phoneNumber);
  
  if (!session || (Date.now() - session.lastInteraction.getTime() > 30 * 60 * 1000)) {
    // Session expirée ou nouvelle session
    session = {
      phoneNumber,
      language: 'fr', // Langue par défaut
      state: 'menu',
      lastInteraction: new Date()
    };
    userSessions.set(phoneNumber, session);
  } else {
    session.lastInteraction = new Date();
  }
  
  return session;
}

// Traduire un message
function t(key: string, lang: 'fr' | 'en' | 'ht' | 'es', ...args: any[]): string {
  const translation = (botTranslations as any)[key]?.[lang];
  if (typeof translation === 'function') {
    return translation(...args);
  }
  return translation || botTranslations.unknownCommand[lang];
}

// Gérer un message entrant
export async function handleIncomingWhatsAppMessage(
  from: string,
  body: string
): Promise<string> {
  const session = getOrCreateSession(from);
  const message = body.trim();
  
  // Commandes globales
  if (message === '0' || message.toLowerCase() === 'menu') {
    session.state = 'menu';
    return t('welcome', session.language);
  }
  
  // Menu principal
  if (session.state === 'menu') {
    switch (message) {
      case '1':
        session.state = 'recharge';
        return t('rechargeStart', session.language);
      case '2':
        session.state = 'tracking';
        return t('trackingPrompt', session.language);
      case '3':
        session.state = 'support';
        return t('faq', session.language);
      case '4':
        return t('agentTransfer', session.language);
      case '5':
        session.state = 'menu';
        return t('languageMenu', session.language);
      default:
        return t('welcome', session.language);
    }
  }
  
  // Gestion du menu de langue (depuis le menu principal avec l'option 5)
  if (message === '🌍' || message.toLowerCase().includes('langue') || 
      message.toLowerCase().includes('language') || message.toLowerCase().includes('lang')) {
    return t('languageMenu', session.language);
  }
  
  // Changer la langue
  if (['français', 'francais', 'french', 'fr', '1'].some(l => message.toLowerCase() === l)) {
    if (session.state === 'menu') { // Simplification: only in menu context for numbers
        session.language = 'fr';
        session.state = 'menu';
        return t('languageChanged', 'fr') + '\n\n' + t('welcome', 'fr');
    }
  }
  if (['english', 'anglais', 'en', '2'].some(l => message.toLowerCase() === l)) {
    if (session.state === 'menu') {
        session.language = 'en';
        session.state = 'menu';
        return t('languageChanged', 'en') + '\n\n' + t('welcome', 'en');
    }
  }
  if (['kreyol', 'creole', 'kreyòl', 'ht', '3'].some(l => message.toLowerCase() === l)) {
    if (session.state === 'menu') {
        session.language = 'ht';
        session.state = 'menu';
        return t('languageChanged', 'ht') + '\n\n' + t('welcome', 'ht');
    }
  }
  if (['español', 'espanol', 'spanish', 'es', '4'].some(l => message.toLowerCase() === l)) {
    if (session.state === 'menu') {
        session.language = 'es';
        session.state = 'menu';
        return t('languageChanged', 'es') + '\n\n' + t('welcome', 'es');
    }
  }
  
  // FAQ
  if (session.state === 'support') {
    switch (message) {
      case '1':
        return t('faq_answer1', session.language);
      case '2':
        return t('faq_answer2', session.language);
      case '3':
        return t('faq_answer3', session.language);
      case '4':
        return t('faq_answer4', session.language);
      case '5':
        return t('faq_answer5', session.language);
      default:
        return t('faq', session.language);
    }
  }
  
  // Processus de recharge
  if (session.state === 'recharge') {
    // Parser le message pour extraire numéro et montant
    const phoneMatch = message.match(/\+?[\d\s\-\(\)]+/);
    const amountMatch = message.match(/\d+(?:\.\d+)?/g);
    
    if (phoneMatch && amountMatch) {
      const rawPhone = phoneMatch[0].replace(/[\s\-\(\)]/g, '');
      const amount = amountMatch[amountMatch.length - 1];
      
      // 🛡️ VALIDATE PHONE NUMBER
      const validation = validatePhoneNumber(rawPhone);
      if (!validation.isValid) {
        return t('invalidNumber', session.language);
      }

      // Créer un lien de recharge pré-rempli avec le numéro validé
      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'https://taptopload.com';
      
      const rechargeUrl = `${baseUrl}/dashboard/recharge?phone=${encodeURIComponent(validation.fullNumber || rawPhone)}&amount=${amount}`;
      
      session.state = 'menu';
      return t('rechargeLink', session.language, rechargeUrl);
    }
    
    return t('rechargeStart', session.language);
  }
  
  // Tracking
  if (session.state === 'tracking') {
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'https://taptopload.com';
    
    session.state = 'menu';
    return session.language === 'fr'
      ? `Pour vérifier vos transactions, visitez : ${baseUrl}/dashboard/history\n\nTapez 0 pour revenir au menu.`
      : session.language === 'en'
      ? `To check your transactions, visit: ${baseUrl}/dashboard/history\n\nType 0 to return to menu.`
      : session.language === 'ht'
      ? `Pou verifye tranzaksyon ou yo, vizite: ${baseUrl}/dashboard/history\n\nTape 0 pou tounen nan meni.`
      : `Para verificar tus transacciones, visita: ${baseUrl}/dashboard/history\n\nEscribe 0 para volver al menú.`;
  }
  
  // Salutations et messages courants
  const greetings = ['bonjour', 'salut', 'hi', 'hello', 'hola', 'bonjou'];
  if (greetings.some(g => message.toLowerCase().includes(g))) {
    session.state = 'menu';
    return t('welcome', session.language);
  }
  
  // Message non reconnu
  return t('unknownCommand', session.language);
}

// 🔄 WRAPPER FOR META API (Replaces Twilio)
export async function sendWhatsAppMessage(to: string, message: string) {
  // Use Meta API directly
  return await sendWhatsAppMetaMessage(to, message);
}

// Notification automatique de transaction
export async function notifyTransactionStatus(
  phoneNumber: string,
  transactionId: string,
  status: 'success' | 'pending' | 'failed',
  amount: number,
  currency: string,
  operatorName?: string
) {
  const session = getOrCreateSession(phoneNumber);
  const lang = session.language;
  
  let message = '';
  
  if (status === 'success') {
    message = lang === 'fr'
      ? `✅ *Recharge réussie !*\n\nMontant : ${amount} ${currency}\nOpérateur : ${operatorName || 'N/A'}\nTransaction : ${transactionId}\n\nMerci d'utiliser TapTopLoad ! 🎉`
      : lang === 'en'
      ? `✅ *Top-up successful!*\n\nAmount: ${amount} ${currency}\nOperator: ${operatorName || 'N/A'}\nTransaction: ${transactionId}\n\nThank you for using TapTopLoad! 🎉`
      : lang === 'ht'
      ? `✅ *Rechaj reyisi!*\n\nMontan: ${amount} ${currency}\nOperatè: ${operatorName || 'N/A'}\nTranzaksyon: ${transactionId}\n\nMèsi pou itilize TapTopLoad! 🎉`
      : `✅ *¡Recarga exitosa!*\n\nMonto: ${amount} ${currency}\nOperador: ${operatorName || 'N/A'}\nTransacción: ${transactionId}\n\n¡Gracias por usar TapTopLoad! 🎉`;
  } else if (status === 'pending') {
    message = lang === 'fr'
      ? `⏳ *Recharge en cours...*\n\nMontant : ${amount} ${currency}\nTransaction : ${transactionId}\n\nNous vous informerons dès que c'est terminé.`
      : lang === 'en'
      ? `⏳ *Top-up in progress...*\n\nAmount: ${amount} ${currency}\nTransaction: ${transactionId}\n\nWe'll notify you when it's done.`
      : lang === 'ht'
      ? `⏳ *Rechaj ap fèt...*\n\nMontan: ${amount} ${currency}\nTranzaksyon: ${transactionId}\n\nNap enfòme w lè li fini.`
      : `⏳ *Recarga en proceso...*\n\nMonto: ${amount} ${currency}\nTransacción: ${transactionId}\n\nTe notificaremos cuando esté listo.`;
  } else {
    message = lang === 'fr'
      ? `❌ *Échec de la recharge*\n\nMontant : ${amount} ${currency}\nTransaction : ${transactionId}\n\nContactez notre support pour assistance.`
      : lang === 'en'
      ? `❌ *Top-up failed*\n\nAmount: ${amount} ${currency}\nTransaction: ${transactionId}\n\nContact our support for assistance.`
      : lang === 'ht'
      ? `❌ *Rechaj echwe*\n\nMontan: ${amount} ${currency}\nTranzaksyon: ${transactionId}\n\nKontakte sipò nou pou asistans.`
      : `❌ *Recarga fallida*\n\nMonto: ${amount} ${currency}\nTransacción: ${transactionId}\n\nContacta nuestro soporte para asistencia.`;
  }
  
  await sendWhatsAppMessage(phoneNumber, message);
}

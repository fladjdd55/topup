import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en' | 'ht' | 'es';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.login': {
    fr: 'Connexion',
    en: 'Login',
    ht: 'Koneksyon',
    es: 'Iniciar sesión'
  },
  'nav.register': {
    fr: 'Inscription',
    en: 'Sign Up',
    ht: 'Enskri',
    es: 'Registrarse'
  },
  'nav.dashboard': {
    fr: 'Tableau de bord',
    en: 'Dashboard',
    ht: 'Tablo bò',
    es: 'Panel'
  },
  'nav.hello': {
    fr: 'Bonjour',
    en: 'Hello',
    ht: 'Bonjou',
    es: 'Hola'
  },
  'nav.home': {
    fr: 'Accueil',
    en: 'Home',
    ht: 'Akèy',
    es: 'Inicio'
  },

  // Hero Section
  'hero.badge': {
    fr: 'Recharge mobile mondiale',
    en: 'Global mobile top-up',
    ht: 'Rechaj mobil mondyal',
    es: 'Recarga móvil global'
  },
  'hero.title': {
    fr: 'Rechargez votre mobile',
    en: 'Top up your mobile',
    ht: 'Rechaje telefòn ou',
    es: 'Recarga tu móvil'
  },
  'hero.title_highlight': {
    fr: 'en quelques secondes',
    en: 'in seconds',
    ht: 'an kèk segond',
    es: 'en segundos'
  },
  'hero.description': {
    fr: 'Plateforme sécurisée pour recharger tous les opérateurs mobiles. Simple, rapide et disponible 24h/24.',
    en: 'Secure platform to top up all mobile operators. Simple, fast and available 24/7.',
    ht: 'Platfòm sekirize pou rechaje tout operatè mobil. Senp, rapid epi disponib 24/7.',
    es: 'Plataforma segura para recargar todos los operadores móviles. Simple, rápida y disponible 24/7.'
  },
  'hero.operators': {
    fr: 'Opérateurs',
    en: 'Operators',
    ht: 'Operatè',
    es: 'Operadores'
  },
  'hero.service': {
    fr: 'Service',
    en: 'Service',
    ht: 'Sèvis',
    es: 'Servicio'
  },
  'hero.reliability': {
    fr: 'Fiabilité',
    en: 'Reliability',
    ht: 'Fyabilite',
    es: 'Fiabilidad'
  },
  'hero.start_now': {
    fr: 'Commencer maintenant',
    en: 'Start now',
    ht: 'Kòmanse kounye a',
    es: 'Comenzar ahora'
  },
  'hero.gift_recharge': {
    fr: 'Offrir une recharge',
    en: 'Gift a top-up',
    ht: 'Bay yon rechaj',
    es: 'Regalar una recarga'
  },

  // Status (✅ NEW)
  'status.pending': { fr: 'En attente', en: 'Pending', ht: 'An atant', es: 'Pendiente' },
  'status.accepted': { fr: 'Accepté', en: 'Accepted', ht: 'Aksepte', es: 'Aceptado' },
  'status.completed': { fr: 'Terminé', en: 'Completed', ht: 'Fini', es: 'Completado' },
  'status.declined': { fr: 'Refusée', en: 'Declined', ht: 'Refize', es: 'Rechazado' },
  'status.expired': { fr: 'Expirée', en: 'Expired', ht: 'Ekspire', es: 'Expirado' },
  'status.cancelled': { fr: 'Annulée', en: 'Cancelled', ht: 'Anile', es: 'Cancelado' },

  // Toasts (✅ NEW)
  'toast.request_sent': { fr: 'Demande envoyée', en: 'Request sent', ht: 'Demann voye', es: 'Solicitud enviada' },
  'toast.request_accepted': { fr: 'Demande acceptée', en: 'Request accepted', ht: 'Demann aksepte', es: 'Solicitud aceptada' },
  'toast.request_declined': { fr: 'Demande refusée', en: 'Request declined', ht: 'Demann refize', es: 'Solicitud rechazada' },
  'toast.request_cancelled': { fr: 'Demande annulée', en: 'Request cancelled', ht: 'Demann anile', es: 'Solicitud cancelada' },
  'toast.request_deleted': { fr: 'Demande supprimée', en: 'Request deleted', ht: 'Demann efase', es: 'Solicitud eliminada' },
  'toast.copied': { fr: 'Copié !', en: 'Copied!', ht: 'Kopye!', es: '¡Copiado!' },
  'toast.error': { fr: 'Erreur', en: 'Error', ht: 'Erè', es: 'Error' },
  'toast.too_fast': { fr: 'Trop rapide', en: 'Too fast', ht: 'Twò vit', es: 'Demasiado rápido' },

  // Validation (✅ NEW)
  'validation.phone_invalid': { fr: 'Numéro invalide', en: 'Invalid number', ht: 'Nimewo envalid', es: 'Número inválido' },
  'validation.amount_invalid': { fr: 'Montant invalide', en: 'Invalid amount', ht: 'Montan envalid', es: 'Monto inválido' },
  'validation.amount_positive': { fr: 'Le montant doit être positif', en: 'Amount must be positive', ht: 'Montan an dwe pozitif', es: 'El monto debe ser positivo' },
  'validation.self_request': { fr: 'Impossible d\'envoyer à soi-même', en: 'Cannot send to yourself', ht: 'Ou pa ka voye bay tèt ou', es: 'No se puede enviar a uno mismo' },

  // Features
  'feature.instant': {
    fr: 'Recharge instantanée',
    en: 'Instant top-up',
    ht: 'Rechaj instantane',
    es: 'Recarga instantánea'
  },
  'feature.secure': {
    fr: '100% sécurisé',
    en: '100% secure',
    ht: '100% sekirize',
    es: '100% seguro'
  },
  'feature.global': {
    fr: 'Couverture mondiale',
    en: 'Global coverage',
    ht: 'Kouvèti mondyal',
    es: 'Cobertura mundial'
  },
  'feature.instant_desc': {
    fr: 'Crédit livré en moins de 30 secondes',
    en: 'Credit delivered in less than 30 seconds',
    ht: 'Kredi livre nan mwens pase 30 segond',
    es: 'Crédito entregado en menos de 30 segundos'
  },
  'feature.secure_desc': {
    fr: 'Paiements protégés par SSL',
    en: 'SSL protected payments',
    ht: 'Peman pwoteje pa SSL',
    es: 'Pagos protegidos por SSL'
  },
  'feature.global_desc': {
    fr: 'Plus de 200 opérateurs dans 89 pays',
    en: 'Over 200 operators in 89 countries',
    ht: 'Plis pase 200 operatè nan 89 peyi',
    es: 'Más de 200 operadores en 89 países'
  },

  // Recharge Section
  'recharge.title': {
    fr: 'Recharge rapide',
    en: 'Quick top-up',
    ht: 'Rechaj rapid',
    es: 'Recarga rápida'
  },
  'recharge.description': {
    fr: 'Entrez votre numéro et sélectionnez le montant. Notre système détecte automatiquement votre opérateur.',
    en: 'Enter your number and select the amount. Our system automatically detects your operator.',
    ht: 'Antre nimewo ou epi chwazi montan an. Sistèm nou detekte otomatikman operatè ou.',
    es: 'Ingrese su número y seleccione el monto. Nuestro sistema detecta automáticamente su operador.'
  },
  'recharge.enter_number': {
    fr: 'Entrez le numéro de téléphone',
    en: 'Enter phone number',
    ht: 'Antre nimewo telefòn',
    es: 'Ingrese número de teléfono'
  },
  'recharge.placeholder': {
    fr: 'Entrez le numéro',
    en: 'Enter number',
    ht: 'Antre nimewo',
    es: 'Ingrese número'
  },
  'recharge.select_amount': {
    fr: 'Sélectionnez le montant (USD)',
    en: 'Select amount (USD)',
    ht: 'Chwazi montan (USD)',
    es: 'Seleccione monto (USD)'
  },
  'recharge.custom_amount': {
    fr: 'Montant personnalisé (min. $1)',
    en: 'Custom amount (min. $1)',
    ht: 'Montan pèsonalize (min. $1)',
    es: 'Monto personalizado (mín. $1)'
  },
  'recharge.account_required': {
    fr: 'Compte requis',
    en: 'Account required',
    ht: 'Kont obligatwa',
    es: 'Cuenta requerida'
  },
  'recharge.account_required_desc': {
    fr: 'Un compte est requis pour les montants supérieurs à $300.',
    en: 'An account is required for amounts over $300.',
    ht: 'Yon kont obligatwa pou montan ki siperyè a $300.',
    es: 'Se requiere una cuenta para montos superiores a $300.'
  },
  'recharge.sign_in': {
    fr: 'Se connecter',
    en: 'Sign In',
    ht: 'Konekte',
    es: 'Iniciar sesión'
  },
  'recharge.sign_up': {
    fr: 'S\'inscrire',
    en: 'Sign Up',
    ht: 'Enskri',
    es: 'Registrarse'
  },
  'recharge.start_topup': {
    fr: 'Démarrer la recharge',
    en: 'Start top-up',
    ht: 'Kòmanse rechaj',
    es: 'Iniciar recarga'
  },
  'recharge.enter_number_first': {
    fr: 'Entrez un numéro',
    en: 'Enter a number',
    ht: 'Antre yon nimewo',
    es: 'Ingrese un número'
  },
  'recharge.select_amount_first': {
    fr: 'Sélectionnez le montant',
    en: 'Select amount',
    ht: 'Chwazi montan',
    es: 'Seleccione monto'
  },
  'recharge.signin_required': {
    fr: 'Connexion requise',
    en: 'Sign in required',
    ht: 'Koneksyon obligatwa',
    es: 'Inicio de sesión requerido'
  },
  'recharge.secure_payment': {
    fr: 'Paiement sécurisé sur la page suivante',
    en: 'Secure payment on next page',
    ht: 'Peman sekirize sou paj swivan',
    es: 'Pago seguro en la siguiente página'
  },
  'recharge.enter_to_start': {
    fr: 'Entrez votre numéro pour commencer',
    en: 'Enter your number to get started',
    ht: 'Antre nimewo ou pou kòmanse',
    es: 'Ingrese su número para comenzar'
  },
  'recharge.auto_detection': {
    fr: 'Détection automatique de l\'opérateur',
    en: 'Automatic operator detection',
    ht: 'Deteksyon otomatik operatè',
    es: 'Detección automática del operador'
  },

  // Features Section
  'features.title': {
    fr: 'Une plateforme pensée pour vous',
    en: 'A platform designed for you',
    ht: 'Yon platfòm panse pou ou',
    es: 'Una plataforma diseñada para ti'
  },
  'features.description': {
    fr: 'Simplicité, sécurité et efficacité au cœur de chaque transaction',
    en: 'Simplicity, security and efficiency at the heart of every transaction',
    ht: 'Senplsite, sekirite ak efikasite nan kè chak tranzaksyon',
    es: 'Simplicidad, seguridad y eficiencia en el corazón de cada transacción'
  },
  'instant_topup': {
    fr: 'Recharge instantanée',
    en: 'Instant top-up',
    ht: 'Rechaj instantane',
    es: 'Recarga instantánea'
  },
  'instant_topup_desc': {
    fr: 'Rechargez votre mobile en moins de 30 secondes avec confirmation immédiate.',
    en: 'Top up your mobile in less than 30 seconds with instant confirmation.',
    ht: 'Rechaje telefòn ou nan mwens pase 30 segond ak konfirmasyon imedya.',
    es: 'Recarga tu móvil en menos de 30 segundos con confirmación instantánea.'
  },
  'secure_transactions': {
    fr: 'Transactions sécurisées',
    en: 'Secure transactions',
    ht: 'Tranzaksyon sekirize',
    es: 'Transacciones seguras'
  },
  'secure_transactions_desc': {
    fr: 'Vos paiements sont protégés par un chiffrement de niveau bancaire.',
    en: 'Your payments are protected by bank-level encryption.',
    ht: 'Peman ou pwoteje pa yon chifreman nivo bank.',
    es: 'Sus pagos están protegidos por cifrado de nivel bancario.'
  },
  'global_coverage': {
    fr: 'Couverture mondiale',
    en: 'Global coverage',
    ht: 'Kouvèti mondyal',
    es: 'Cobertura mundial'
  },
  'global_coverage_desc': {
    fr: 'Accédez à tous les principaux opérateurs mobiles dans le monde.',
    en: 'Access all major mobile operators worldwide.',
    ht: 'Aksè a tout gwo operatè mobil nan mond lan.',
    es: 'Acceda a todos los principales operadores móviles del mundo.'
  },
  'mobile_first': {
    fr: 'Mobile-first',
    en: 'Mobile-first',
    ht: 'Mobil dabò',
    es: 'Mobile-first'
  },
  'mobile_first_desc': {
    fr: 'Interface optimisée pour tous vos appareils mobiles et desktop.',
    en: 'Interface optimized for all your mobile and desktop devices.',
    ht: 'Entèfas optimize pou tout aparèy mobil ak desktop ou.',
    es: 'Interfaz optimizada para todos sus dispositivos móviles y de escritorio.'
  },
  'transaction_tracking': {
    fr: 'Suivi des transactions',
    en: 'Transaction tracking',
    ht: 'Suivi tranzaksyon',
    es: 'Seguimiento de transacciones'
  },
  'transaction_tracking_desc': {
    fr: 'Consultez l\'historique complet de toutes vos recharges.',
    en: 'View complete history of all your top-ups.',
    ht: 'Gade istwa konplè tout rechaj ou yo.',
    es: 'Vea el historial completo de todas sus recargas.'
  },
  'customer_support': {
    fr: 'Support client',
    en: 'Customer support',
    ht: 'Sipò kliyantèl',
    es: 'Soporte al cliente'
  },
  'customer_support_desc': {
    fr: 'Équipe de support disponible pour vous aider 24h/24.',
    en: 'Support team available to help you 24/7.',
    ht: 'Ekip sipò disponib pou ede w 24/7.',
    es: 'Equipo de soporte disponible para ayudarlo 24/7.'
  },

  // Testimonials
  'testimonials.title': {
    fr: 'Ils nous font confiance',
    en: 'They trust us',
    ht: 'Yo fè nou konfyans',
    es: 'Confían en nosotros'
  },
  'testimonials.description': {
    fr: 'Découvrez l\'expérience de nos utilisateurs',
    en: 'Discover the experience of our users',
    ht: 'Dekouvri eksperyans itilizatè nou yo',
    es: 'Descubra la experiencia de nuestros usuarios'
  },
  'testimonials.comment1': {
    fr: 'Interface très intuitive, mes recharges sont toujours rapides et fiables.',
    en: 'Very intuitive interface, my top-ups are always fast and reliable.',
    ht: 'Entèfas trè entwisyon, rechaj mwen yo toujou rapid e fyab.',
    es: 'Interfaz muy intuitiva, mis recargas siempre son rápidas y confiables.'
  },
  'testimonials.comment2': {
    fr: 'Parfait pour envoyer du crédit à ma famille. Service client excellent.',
    en: 'Perfect for sending credit to my family. Excellent customer service.',
    ht: 'Pafè pou voye kredi bay fanmi m. Sèvis kliyantèl ekselan.',
    es: 'Perfecto para enviar crédito a mi familia. Excelente servicio al cliente.'
  },
  'testimonials.comment3': {
    fr: 'La détection automatique de l\'opérateur fait gagner beaucoup de temps.',
    en: 'Automatic operator detection saves a lot of time.',
    ht: 'Deteksyon otomatik operatè a fè w ekonomize anpil tan.',
    es: 'La detección automática del operador ahorra mucho tiempo.'
  },

  // Footer
  'footer.description': {
    fr: 'La solution moderne pour toutes vos recharges mobiles. Simple, sécurisé et disponible partout.',
    en: 'The modern solution for all your mobile top-ups. Simple, secure and available everywhere.',
    ht: 'Solisyon modèn pou tout rechaj mobil ou. Senp, sekirize epi disponib toupatou.',
    es: 'La solución moderna para todas sus recargas móviles. Simple, segura y disponible en todas partes.'
  },
  'footer.services': {
    fr: 'Services',
    en: 'Services',
    ht: 'Sèvis',
    es: 'Servicios'
  },
  'footer.mobile_recharge': {
    fr: 'Recharge mobile',
    en: 'Mobile top-up',
    ht: 'Rechaj mobil',
    es: 'Recarga móvil'
  },
  'footer.credit_transfer': {
    fr: 'Transfert de crédit',
    en: 'Credit transfer',
    ht: 'Transfè kredi',
    es: 'Transferencia de crédito'
  },
  'footer.data_plans': {
    fr: 'Forfaits data',
    en: 'Data plans',
    ht: 'Plan done',
    es: 'Planes de datos'
  },
  'footer.support': {
    fr: 'Support',
    en: 'Support',
    ht: 'Sipò',
    es: 'Soporte'
  },
  'footer.help_center': {
    fr: 'Centre d\'aide',
    en: 'Help center',
    ht: 'Sant èd',
    es: 'Centro de ayuda'
  },
  'footer.contact': {
    fr: 'Contact',
    en: 'Contact',
    ht: 'Kontak',
    es: 'Contacto'
  },
  'footer.faq': {
    fr: 'FAQ',
    en: 'FAQ',
    ht: 'FAQ',
    es: 'FAQ'
  },
  'footer.rights': {
    fr: 'Tous droits réservés.',
    en: 'All rights reserved.',
    ht: 'Tout dwa rezève.',
    es: 'Todos los derechos reservados.'
  },
  'footer.privacy': {
    fr: 'Confidentialité',
    en: 'Privacy',
    ht: 'Konfidansyalite',
    es: 'Privacidad'
  },
  'footer.terms': {
    fr: 'Conditions',
    en: 'Terms',
    ht: 'Kondisyon',
    es: 'Términos'
  },
  'footer.security': {
    fr: 'Sécurité',
    en: 'Security',
    ht: 'Sekirite',
    es: 'Seguridad'
  },
  'footer.about': {
    fr: 'À propos',
    en: 'About us',
    ht: 'Konsènan nou',
    es: 'Acerca de'
  },

  // About Page
  'about.hero_title': {
    fr: 'À propos de TapTopLoad',
    en: 'About TapTopLoad',
    ht: 'Konsènan TapTopLoad',
    es: 'Acerca de TapTopLoad'
  },
  'about.hero_description': {
    fr: 'Nous connectons les familles à travers le monde grâce à des solutions de recharge mobile simples, rapides et sécurisées.',
    en: 'We connect families across the world through simple, fast and secure mobile top-up solutions.',
    ht: 'Nou konekte fanmi atravè mond lan gras a solisyon rechaj mobil senp, rapid e sekirize.',
    es: 'Conectamos familias en todo el mundo a través de soluciones de recarga móvil simples, rápidas y seguras.'
  },
  'about.mission_badge': {
    fr: 'Notre mission',
    en: 'Our mission',
    ht: 'Misyon nou',
    es: 'Nuestra misión'
  },
  'about.mission_title': {
    fr: 'Rapprocher les familles, un crédit à la fois',
    en: 'Bringing families closer, one top-up at a time',
    ht: 'Rapwoche fanmi yo, yon rechaj alafwa',
    es: 'Acercando familias, una recarga a la vez'
  },
  'about.mission_desc1': {
    fr: 'TapTopLoad est née de la volonté de simplifier les transferts de crédit mobile vers vos proches, où qu\'ils soient dans le monde. Nous comprenons l\'importance de rester connecté avec votre famille et vos amis.',
    en: 'TapTopLoad was born from the desire to simplify mobile credit transfers to your loved ones, wherever they are in the world. We understand the importance of staying connected with your family and friends.',
    ht: 'TapTopLoad te fèt nan volonte pou senplifye transfè kredi mobil bay moun ou renmen yo, kèlkeswa kote yo ye nan mond lan. Nou konprann enpòtans pou rete konekte ak fanmi ou ak zanmi ou.',
    es: 'TapTopLoad nació del deseo de simplificar las transferencias de crédito móvil a sus seres queridos, dondequiera que estén en el mundo. Entendemos la importancia de mantenerse conectado con su familia y amigos.'
  },
  'about.mission_desc2': {
    fr: 'Grâce à notre plateforme, envoyer du crédit mobile est aussi simple que d\'envoyer un message. Nous travaillons avec les meilleurs partenaires pour garantir que chaque transaction soit rapide, sécurisée et fiable.',
    en: 'Through our platform, sending mobile credit is as simple as sending a message. We work with the best partners to ensure every transaction is fast, secure and reliable.',
    ht: 'Gras a platfòm nou an, voye kredi mobil senp tankou voye yon mesaj. Nou travay ak pi bon patnè yo pou asire chak tranzaksyon rapid, sekirize e fyab.',
    es: 'A través de nuestra plataforma, enviar crédito móvil es tan simple como enviar un mensaje. Trabajamos con los mejores socios para garantizar que cada transacción sea rápida, segura y confiable.'
  },
  'about.stat_countries': {
    fr: 'Pays couverts',
    en: 'Countries covered',
    ht: 'Peyi kouvri',
    es: 'Países cubiertos'
  },
  'about.stat_operators': {
    fr: 'Opérateurs mobiles',
    en: 'Mobile operators',
    ht: 'Operatè mobil',
    es: 'Operadores móviles'
  },
  'about.stat_uptime': {
    fr: 'Disponibilité',
    en: 'Uptime',
    ht: 'Disponibilite',
    es: 'Disponibilidad'
  },
  'about.stat_support': {
    fr: 'Support client',
    en: 'Customer support',
    ht: 'Sipò kliyantèl',
    es: 'Soporte al cliente'
  },
  'about.values_title': {
    fr: 'Nos valeurs',
    en: 'Our values',
    ht: 'Valè nou yo',
    es: 'Nuestros valores'
  },
  'about.values_description': {
    fr: 'Les principes qui guident chacune de nos décisions',
    en: 'The principles that guide each of our decisions',
    ht: 'Prensip ki gide chak desizyon nou yo',
    es: 'Los principios que guían cada una de nuestras decisiones'
  },
  'about.value_trust': {
    fr: 'Confiance',
    en: 'Trust',
    ht: 'Konfyans',
    es: 'Confianza'
  },
  'about.value_trust_desc': {
    fr: 'Nous protégeons vos données et garantissons la sécurité de chaque transaction',
    en: 'We protect your data and guarantee the security of every transaction',
    ht: 'Nou pwoteje done ou epi garanti sekirite chak tranzaksyon',
    es: 'Protegemos sus datos y garantizamos la seguridad de cada transacción'
  },
  'about.value_innovation': {
    fr: 'Innovation',
    en: 'Innovation',
    ht: 'Inovasyon',
    es: 'Innovación'
  },
  'about.value_innovation_desc': {
    fr: 'Nous améliorons constamment notre plateforme pour vous offrir la meilleure expérience',
    en: 'We constantly improve our platform to offer you the best experience',
    ht: 'Nou amelyore platfòm nou an konstan pou ofri w pi bon eksperyans',
    es: 'Mejoramos constantemente nuestra plataforma para ofrecerle la mejor experiencia'
  },
  'about.value_care': {
    fr: 'Bienveillance',
    en: 'Care',
    ht: 'Atansyon',
    es: 'Cuidado'
  },
  'about.value_care_desc': {
    fr: 'Votre satisfaction est notre priorité, nous sommes là pour vous aider à tout moment',
    en: 'Your satisfaction is our priority, we are here to help you at any time',
    ht: 'Satisfaksyon ou se priyorite nou, nou la pou ede w nenpòt lè',
    es: 'Su satisfacción es nuestra prioridad, estamos aquí para ayudarle en cualquier momento'
  },
  'about.value_accessibility': {
    fr: 'Accessibilité',
    en: 'Accessibility',
    ht: 'Aksesibilite',
    es: 'Accesibilidad'
  },
  'about.value_accessibility_desc': {
    fr: 'Nos services sont disponibles partout, pour tous, en toute simplicité',
    en: 'Our services are available everywhere, for everyone, with simplicity',
    ht: 'Sèvis nou yo disponib toupatou, pou tout moun, an toute senplisite',
    es: 'Nuestros servicios están disponibles en todas partes, para todos, con simplicidad'
  },
  'about.story_title': {
    fr: 'Notre histoire',
    en: 'Our story',
    ht: 'Istwa nou',
    es: 'Nuestra historia'
  },
  'about.story_section1_title': {
    fr: 'Un besoin identifié',
    en: 'An identified need',
    ht: 'Yon bezwen idantifye',
    es: 'Una necesidad identificada'
  },
  'about.story_section1_desc': {
    fr: 'En observant les difficultés rencontrées par les diasporas pour soutenir leurs familles restées au pays, nous avons décidé de créer une solution qui élimine toutes les barrières. Plus de déplacement, plus de frais cachés, juste une plateforme simple et transparente.',
    en: 'By observing the difficulties faced by diasporas in supporting their families back home, we decided to create a solution that eliminates all barriers. No more travel, no more hidden fees, just a simple and transparent platform.',
    ht: 'Lè w obsève difikilte dyaspora yo rankontre pou sipòte fanmi yo ki rete nan peyi a, nou deside kreye yon solisyon ki elimine tout baryè. Pa gen plis deplase, pa gen plis frè kache, jis yon platfòm senp e transparan.',
    es: 'Al observar las dificultades que enfrentan las diásporas para apoyar a sus familias en casa, decidimos crear una solución que elimine todas las barreras. No más desplazamientos, no más tarifas ocultas, solo una plataforma simple y transparente.'
  },
  'about.story_section2_title': {
    fr: 'Une expansion mondiale',
    en: 'A global expansion',
    ht: 'Yon ekspansyon mondyal',
    es: 'Una expansión global'
  },
  'about.story_section2_desc': {
    fr: 'Aujourd\'hui, nous servons des milliers de clients à travers 160+ pays. Notre partenariat avec DTone nous permet d\'offrir une couverture mondiale inégalée, touchant 875+ opérateurs mobiles dans le monde entier.',
    en: 'Today, we serve thousands of customers across 160+ countries. Our partnership with DTone allows us to offer unmatched global coverage, reaching 875+ mobile operators worldwide.',
    ht: 'Jodi a, nou sèvi dè milye kliyan nan plis pase 160 peyi. Patenarya nou ak DTone pèmèt nou ofri yon kouvèti mondyal san parèy, rive jwenn plis pase 875 operatè mobil nan mond antye.',
    es: 'Hoy, servimos a miles de clientes en más de 160 países. Nuestra asociación con DTone nos permite ofrecer una cobertura global inigualable, llegando a más de 875 operadores móviles en todo el mundo.'
  },
  'about.story_section3_title': {
    fr: 'L\'avenir ensemble',
    en: 'The future together',
    ht: 'Lavni ansanm',
    es: 'El futuro juntos'
  },
  'about.story_section3_desc': {
    fr: 'Nous continuons d\'innover avec de nouvelles fonctionnalités comme les recharges récurrentes, le programme de fidélité et le support multi-devises. Notre objectif ? Rendre chaque transaction encore plus simple et avantageuse pour vous.',
    en: 'We continue to innovate with new features like recurring top-ups, loyalty program and multi-currency support. Our goal? To make every transaction even simpler and more beneficial for you.',
    ht: 'Nou kontinye inove ak nouvo fonksyonalite tankou rechaj rekiran, pwogram fidelite ak sipò milti-lajan. Objektif nou? Fè chak tranzaksyon pi senp e pi avantaje pou ou.',
    es: 'Continuamos innovando con nuevas características como recargas recurrentes, programa de fidelidad y soporte multimoneda. ¿Nuestro objetivo? Hacer que cada transacción sea aún más simple y beneficiosa para usted.'
  },
  'about.cta_title': {
    fr: 'Rejoignez des milliers de clients satisfaits',
    en: 'Join thousands of satisfied customers',
    ht: 'Vin jwenn dè milye kliyan satisfè',
    es: 'Únase a miles de clientes satisfechos'
  },
  'about.cta_description': {
    fr: 'Commencez à recharger vos proches dès aujourd\'hui',
    en: 'Start topping up your loved ones today',
    ht: 'Kòmanse rechaje moun ou renmen yo jodi a',
    es: 'Comience a recargar a sus seres queridos hoy'
  },
  'about.cta_start': {
    fr: 'Commencer à recharger',
    en: 'Start recharging',
    ht: 'Kòmanse rechaje',
    es: 'Comenzar a recargar'
  },
  'about.cta_contact': {
    fr: 'Nous contacter',
    en: 'Contact us',
    ht: 'Kontakte nou',
    es: 'Contáctenos'
  },

  // Common
  'common.back_home': {
    fr: 'Retour à l\'accueil',
    en: 'Back to home',
    ht: 'Retounen nan akèy',
    es: 'Volver al inicio'
  },
  'common.loading': {
    fr: 'Chargement...',
    en: 'Loading...',
    ht: 'Chajman...',
    es: 'Cargando...'
  },
  'common.save': {
    fr: 'Enregistrer',
    en: 'Save',
    ht: 'Anrejistre',
    es: 'Guardar'
  },
  'common.cancel': {
    fr: 'Annuler',
    en: 'Cancel',
    ht: 'Anile',
    es: 'Cancelar'
  },
  'common.delete': {
    fr: 'Supprimer',
    en: 'Delete',
    ht: 'Efase',
    es: 'Eliminar'
  },
  'common.edit': {
    fr: 'Modifier',
    en: 'Edit',
    ht: 'Modifye',
    es: 'Editar'
  },
  'common.close': {
    fr: 'Fermer',
    en: 'Close',
    ht: 'Fèmen',
    es: 'Cerrar'
  },
  'common.yes': {
    fr: 'Oui',
    en: 'Yes',
    ht: 'Wi',
    es: 'Sí'
  },
  'common.no': {
    fr: 'Non',
    en: 'No',
    ht: 'Non',
    es: 'No'
  },
  'common.confirm': {
    fr: 'Confirmer',
    en: 'Confirm',
    ht: 'Konfime',
    es: 'Confirmar'
  },

  // Privacy Page
  'privacy.title': {
    fr: 'Politique de confidentialité',
    en: 'Privacy Policy',
    ht: 'Politik konfidansyalite',
    es: 'Política de privacidad'
  },
  'privacy.last_updated': {
    fr: 'Dernière mise à jour',
    en: 'Last updated',
    ht: 'Dènye mizajou',
    es: 'Última actualización'
  },
  'privacy.section1_title': {
    fr: 'Collecte des informations',
    en: 'Information Collection',
    ht: 'Koleksyon enfòmasyon',
    es: 'Recopilación de información'
  },
  'privacy.section1_content': {
    fr: 'Nous collectons les informations que vous nous fournissez lors de la création de votre compte et l\'utilisation de nos services. Cela inclut votre nom, email, numéro de téléphone et informations de paiement.',
    en: 'We collect information you provide when creating your account and using our services. This includes your name, email, phone number and payment information.',
    ht: 'Nou kolekte enfòmasyon ou bay nou lè w ap kreye kont ou epi itilize sèvis nou yo. Sa gen ladan l non ou, imel, nimewo telefòn ak enfòmasyon peman.',
    es: 'Recopilamos la información que nos proporciona al crear su cuenta y utilizar nuestros servicios. Esto incluye su nombre, correo electrónico, número de teléfono e información de pago.'
  },
  'privacy.section2_title': {
    fr: 'Utilisation des données',
    en: 'Data Usage',
    ht: 'Itilizasyon done',
    es: 'Uso de datos'
  },
  'privacy.section2_content': {
    fr: 'Vos données sont utilisées uniquement pour fournir et améliorer nos services. Nous ne vendons jamais vos informations personnelles à des tiers.',
    en: 'Your data is used only to provide and improve our services. We never sell your personal information to third parties.',
    ht: 'Done ou yo itilize sèlman pou bay ak amelyore sèvis nou yo. Nou pa janm vann enfòmasyon pèsonèl ou bay lòt moun.',
    es: 'Sus datos se utilizan solo para proporcionar y mejorar nuestros servicios. Nunca vendemos su información personal a terceros.'
  },
  'privacy.section3_title': {
    fr: 'Sécurité des données',
    en: 'Data Security',
    ht: 'Sekirite done',
    es: 'Seguridad de datos'
  },
  'privacy.section3_content': {
    fr: 'Nous utilisons des mesures de sécurité de niveau bancaire pour protéger vos informations. Toutes les données sensibles sont chiffrées et stockées de manière sécurisée.',
    en: 'We use bank-level security measures to protect your information. All sensitive data is encrypted and stored securely.',
    ht: 'Nou itilize mezi sekirite nivo bank pou pwoteje enfòmasyon ou. Tout done sansib kripte epi estoke an sekirite.',
    es: 'Utilizamos medidas de seguridad de nivel bancario para proteger su información. Todos los datos sensibles están cifrados y almacenados de forma segura.'
  },
  'privacy.section4_title': {
    fr: 'Partage des informations',
    en: 'Information Sharing',
    ht: 'Pataj enfòmasyon',
    es: 'Compartir información'
  },
  'privacy.section4_content': {
    fr: 'Nous ne partageons vos informations qu\'avec les partenaires nécessaires au traitement des paiements et à la fourniture du service de recharge.',
    en: 'We only share your information with partners necessary for payment processing and providing the top-up service.',
    ht: 'Nou sèlman pataje enfòmasyon ou avèk patnè ki nesesè pou trete peman ak bay sèvis rechaj la.',
    es: 'Solo compartimos su información con socios necesarios para el procesamiento de pagos y la provisión del servicio de recarga.'
  },
  'privacy.section5_title': {
    fr: 'Vos droits',
    en: 'Your Rights',
    ht: 'Dwa ou',
    es: 'Sus derechos'
  },
  'privacy.section5_content': {
    fr: 'Vous avez le droit d\'accéder, de modifier ou de supprimer vos données personnelles à tout moment. Contactez-nous pour exercer ces droits.',
    en: 'You have the right to access, modify or delete your personal data at any time. Contact us to exercise these rights.',
    ht: 'Ou gen dwa aksè, modifye oswa efase done pèsonèl ou nenpòt lè. Kontakte nou pou egzèse dwa sa yo.',
    es: 'Tiene derecho a acceder, modificar o eliminar sus datos personales en cualquier momento. Contáctenos para ejercer estos derechos.'
  },
  'privacy.contact_title': {
    fr: 'Nous contacter',
    en: 'Contact Us',
    ht: 'Kontakte nou',
    es: 'Contáctenos'
  },
  'privacy.contact_content': {
    fr: 'Pour toute question concernant cette politique, contactez-nous à privacy@taptopload.com',
    en: 'For any questions about this policy, contact us at privacy@taptopload.com',
    ht: 'Pou nenpòt kesyon sou politik sa a, kontakte nou nan privacy@taptopload.com',
    es: 'Para cualquier pregunta sobre esta política, contáctenos en privacy@taptopload.com'
  },

  // Terms Page
  'terms.title': {
    fr: 'Conditions d\'utilisation',
    en: 'Terms of Service',
    ht: 'Kondisyon itilizasyon',
    es: 'Términos de servicio'
  },
  'terms.last_updated': {
    fr: 'Dernière mise à jour',
    en: 'Last updated',
    ht: 'Dènye mizajou',
    es: 'Última actualización'
  },
  'terms.section1_title': {
    fr: 'Acceptation des conditions',
    en: 'Acceptance of Terms',
    ht: 'Akseptasyon kondisyon',
    es: 'Aceptación de términos'
  },
  'terms.section1_content': {
    fr: 'En utilisant Taptopload, vous acceptez ces conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser notre service.',
    en: 'By using Taptopload, you accept these terms of service. If you do not accept these terms, please do not use our service.',
    ht: 'Lè w ap itilize Taptopload, ou aksepte kondisyon itilizasyon sa yo. Si ou pa aksepte kondisyon sa yo, tanpri pa itilize sèvis nou an.',
    es: 'Al utilizar Taptopload, acepta estos términos de servicio. Si no acepta estos términos, por favor no utilice nuestro servicio.'
  },
  'terms.section2_title': {
    fr: 'Services fournis',
    en: 'Services Provided',
    ht: 'Sèvis bay',
    es: 'Servicios proporcionados'
  },
  'terms.section2_content': {
    fr: 'Taptopload fournit un service de recharge mobile en ligne. Nous nous efforçons de garantir la disponibilité du service, mais ne pouvons garantir une disponibilité à 100%.',
    en: 'Taptopload provides an online mobile top-up service. We strive to ensure service availability, but cannot guarantee 100% availability.',
    ht: 'Taptopload bay yon sèvis rechaj mobil sou entènèt. Nou eseye asire disponibilite sèvis la, men nou pa ka garanti 100% disponibilite.',
    es: 'Taptopload proporciona un servicio de recarga móvil en línea. Nos esforzamos por garantizar la disponibilidad del servicio, pero no podemos garantizar una disponibilidad del 100%.'
  },
  'terms.section3_title': {
    fr: 'Responsabilités de l\'utilisateur',
    en: 'User Responsibilities',
    ht: 'Responsabilite itilizatè',
    es: 'Responsabilidades del usuario'
  },
  'terms.section3_content': {
    fr: 'Vous êtes responsable de maintenir la confidentialité de votre compte et de toutes les activités qui se produisent sous votre compte.',
    en: 'You are responsible for maintaining the confidentiality of your account and all activities that occur under your account.',
    ht: 'Ou responsab pou kenbe konfidansyalite kont ou epi tout aktivite ki fèt nan kont ou.',
    es: 'Usted es responsable de mantener la confidencialidad de su cuenta y de todas las actividades que ocurran en su cuenta.'
  },
  'terms.section4_title': {
    fr: 'Paiements et remboursements',
    en: 'Payments and Refunds',
    ht: 'Peman ak ranbousman',
    es: 'Pagos y reembolsos'
  },
  'terms.section4_content': {
    fr: 'Tous les paiements sont traités de manière sécurisée. Les remboursements sont possibles dans certains cas, selon notre politique de remboursement.',
    en: 'All payments are processed securely. Refunds are possible in certain cases, according to our refund policy.',
    ht: 'Tout peman trete an sekirite. Ranbousman posib nan kèk ka, selon politik ranbousman nou an.',
    es: 'Todos los pagos se procesan de forma segura. Los reembolsos son posibles en ciertos casos, según nuestra política de reembolsos.'
  },
  'terms.section5_title': {
    fr: 'Limitation de responsabilité',
    en: 'Limitation of Liability',
    ht: 'Limitasyon responsabilite',
    es: 'Limitación de responsabilidad'
  },
  'terms.section5_content': {
    fr: 'Taptopload ne peut être tenu responsable des dommages indirects résultant de l\'utilisation ou de l\'incapacité d\'utiliser notre service.',
    en: 'Taptopload cannot be held responsible for indirect damages resulting from the use or inability to use our service.',
    ht: 'Taptopload pa ka responsab pou domaj endirèk ki soti nan itilizasyon oswa pa ka itilize sèvis nou an.',
    es: 'Taptopload no puede ser responsable de daños indirectos resultantes del uso o la incapacidad de usar nuestro servicio.'
  },

  // Security Page
  'security.title': {
    fr: 'Sécurité',
    en: 'Security',
    ht: 'Sekirite',
    es: 'Seguridad'
  },
  'security.subtitle': {
    fr: 'Votre sécurité est notre priorité',
    en: 'Your security is our priority',
    ht: 'Sekirite ou se priyorite nou',
    es: 'Su seguridad es nuestra prioridad'
  },
  'security.ssl_title': {
    fr: 'Chiffrement SSL',
    en: 'SSL Encryption',
    ht: 'Chifrement SSL',
    es: 'Cifrado SSL'
  },
  'security.ssl_desc': {
    fr: 'Toutes les communications sont protégées par un chiffrement SSL 256-bit de niveau bancaire.',
    en: 'All communications are protected by 256-bit bank-level SSL encryption.',
    ht: 'Tout kominikasyon pwoteje pa yon chifrement SSL 256-bit nivo bank.',
    es: 'Todas las comunicaciones están protegidas por cifrado SSL de 256 bits de nivel bancario.'
  },
  'security.encryption_title': {
    fr: 'Données chiffrées',
    en: 'Encrypted Data',
    ht: 'Done kripte',
    es: 'Datos cifrados'
  },
  'security.encryption_desc': {
    fr: 'Vos informations sensibles sont stockées avec un chiffrement de bout en bout.',
    en: 'Your sensitive information is stored with end-to-end encryption.',
    ht: 'Enfòmasyon sansib ou estoke avèk chifrement bout-a-bout.',
    es: 'Su información sensible se almacena con cifrado de extremo a extremo.'
  },
  'security.privacy_title': {
    fr: 'Protection de la vie privée',
    en: 'Privacy Protection',
    ht: 'Pwoteksyon lavi prive',
    es: 'Protección de privacidad'
  },
  'security.privacy_desc': {
    fr: 'Nous ne partageons jamais vos données personnelles sans votre consentement.',
    en: 'We never share your personal data without your consent.',
    ht: 'Nou pa janm pataje done pèsonèl ou san konsantman ou.',
    es: 'Nunca compartimos sus datos personales sin su consentimiento.'
  },
  'security.infrastructure_title': {
    fr: 'Infrastructure sécurisée',
    en: 'Secure Infrastructure',
    ht: 'Enfrastrikti sekirize',
    es: 'Infraestructura segura'
  },
  'security.infrastructure_desc': {
    fr: 'Nos serveurs sont hébergés dans des centres de données certifiés avec surveillance 24/7.',
    en: 'Our servers are hosted in certified data centers with 24/7 monitoring.',
    ht: 'Sèvè nou yo estoke nan sant done sètifye ak siveyans 24/7.',
    es: 'Nuestros servidores están alojados en centros de datos certificados con monitoreo 24/7.'
  },
  'security.commitment_title': {
    fr: 'Notre engagement',
    en: 'Our Commitment',
    ht: 'Angajman nou',
    es: 'Nuestro compromiso'
  },
  'security.commitment_content': {
    fr: 'Nous nous engageons à protéger vos données avec les plus hauts standards de sécurité de l\'industrie. Notre équipe de sécurité surveille constamment nos systèmes pour détecter et prévenir toute menace potentielle.',
    en: 'We are committed to protecting your data with the highest industry security standards. Our security team constantly monitors our systems to detect and prevent any potential threats.',
    ht: 'Nou angaje pou pwoteje done ou avèk pi wo estanda sekirite nan endistri a. Ekip sekirite nou toujou siveyye sistèm nou yo pou detekte ak anpeche nenpòt menas potansyèl.',
    es: 'Estamos comprometidos a proteger sus datos con los más altos estándares de seguridad de la industria. Nuestro equipo de seguridad monitorea constantemente nuestros sistemas para detectar y prevenir cualquier amenaza potencial.'
  },

  // FAQ Page
  'faq.title': {
    fr: 'Questions Fréquentes',
    en: 'Frequently Asked Questions',
    ht: 'Kesyon Yo Poze Souvan',
    es: 'Preguntas Frecuentes'
  },
  'faq.subtitle': {
    fr: 'Trouvez des réponses à vos questions',
    en: 'Find answers to your questions',
    ht: 'Jwenn repons a kesyon ou yo',
    es: 'Encuentre respuestas a sus preguntas'
  },
  'faq.q1': {
    fr: 'Comment fonctionne Taptopload?',
    en: 'How does Taptopload work?',
    ht: 'Kijan Taptopload fonksyone?',
    es: '¿Cómo funciona Taptopload?'
  },
  'faq.a1': {
    fr: 'Taptopload est une plateforme de recharge mobile en ligne. Entrez simplement un numéro de téléphone, sélectionnez le montant et payez. Le crédit est livré instantanément.',
    en: 'Taptopload is an online mobile top-up platform. Simply enter a phone number, select the amount and pay. Credit is delivered instantly.',
    ht: 'Taptopload se yon platfòm rechaj mobil sou entènèt. Sèlman antre yon nimewo telefòn, chwazi montan an epi peye. Kredi livre imedyatman.',
    es: 'Taptopload es una plataforma de recarga móvil en línea. Simplemente ingrese un número de teléfono, seleccione el monto y pague. El crédito se entrega instantáneamente.'
  },
  'faq.q2': {
    fr: 'Quels opérateurs sont supportés?',
    en: 'Which operators are supported?',
    ht: 'Ki operatè ki sipòte?',
    es: '¿Qué operadores son compatibles?'
  },
  'faq.a2': {
    fr: 'Nous supportons tous les principaux opérateurs en Haïti et plus de 200 opérateurs dans 89 pays à travers le monde.',
    en: 'We support all major operators in Haiti and over 200 operators in 89 countries worldwide.',
    ht: 'Nou sipòte tout gwo operatè nan Ayiti ak plis pase 200 operatè nan 89 peyi nan mond lan.',
    es: 'Soportamos todos los operadores principales en Haití y más de 200 operadores en 89 países en todo el mundo.'
  },
  'faq.q3': {
    fr: 'Combien de temps prend une recharge?',
    en: 'How long does a top-up take?',
    ht: 'Konbyen tan yon rechaj pran?',
    es: '¿Cuánto tiempo tarda una recarga?'
  },
  'faq.a3': {
    fr: 'La plupart des recharges sont livrées instantanément, en moins de 30 secondes.',
    en: 'Most top-ups are delivered instantly, in less than 30 seconds.',
    ht: 'Pifò rechaj yo livre imedyatman, nan mwens pase 30 segond.',
    es: 'La mayoría de las recargas se entregan instantáneamente, en menos de 30 segundos.'
  },
  'faq.q4': {
    fr: 'Quels moyens de paiement acceptez-vous?',
    en: 'What payment methods do you accept?',
    ht: 'Ki mwayen peman nou aksepte?',
    es: '¿Qué métodos de pago aceptan?'
  },
  'faq.a4': {
    fr: 'Nous acceptons les cartes de crédit/débit (Visa, Mastercard, American Express) via notre système de paiement sécurisé Stripe.',
    en: 'We accept credit/debit cards (Visa, Mastercard, American Express) via our secure Stripe payment system.',
    ht: 'Nou aksepte kat kredi/debi (Visa, Mastercard, American Express) via sistèm peman sekirize Stripe nou an.',
    es: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard, American Express) a través de nuestro sistema de pago seguro Stripe.'
  },
  'faq.q5': {
    fr: 'Puis-je annuler une recharge?',
    en: 'Can I cancel a top-up?',
    ht: 'Èske m ka anile yon rechaj?',
    es: '¿Puedo cancelar una recarga?'
  },
  'faq.a5': {
    fr: 'Une fois qu\'une recharge est effectuée, elle ne peut pas être annulée. Assurez-vous de vérifier le numéro et le montant avant de confirmer.',
    en: 'Once a top-up is completed, it cannot be canceled. Make sure to verify the number and amount before confirming.',
    ht: 'Yon fwa yon rechaj fèt, li pa ka anile. Asire w verifye nimewo a ak montan an anvan ou konfime.',
    es: 'Una vez que se completa una recarga, no se puede cancelar. Asegúrese de verificar el número y el monto antes de confirmar.'
  },
  'faq.q6': {
    fr: 'Mes informations sont-elles sécurisées?',
    en: 'Is my information secure?',
    ht: 'Èske enfòmasyon mwen an sekirite?',
    es: '¿Mi información está segura?'
  },
  'faq.a6': {
    fr: 'Oui, nous utilisons un chiffrement SSL de niveau bancaire pour protéger toutes vos données personnelles et financières.',
    en: 'Yes, we use bank-level SSL encryption to protect all your personal and financial data.',
    ht: 'Wi, nou itilize chifrement SSL nivo bank pou pwoteje tout done pèsonèl ak finansye ou.',
    es: 'Sí, utilizamos cifrado SSL de nivel bancario para proteger todos sus datos personales y financieros.'
  },
  'faq.q7': {
    fr: 'Puis-je recharger un numéro international?',
    en: 'Can I top up an international number?',
    ht: 'Èske m ka rechaje yon nimewo entènasyonal?',
    es: '¿Puedo recargar un número internacional?'
  },
  'faq.a7': {
    fr: 'Oui, nous supportons les recharges vers plus de 50 pays à travers le monde.',
    en: 'Yes, we support top-ups to over 50 countries worldwide.',
    ht: 'Wi, nou sipòte rechaj nan plis pase 50 peyi nan mond lan.',
    es: 'Sí, soportamos recargas a más de 50 países en todo el mundo.'
  },
  'faq.q8': {
    fr: 'Comment contacter le support?',
    en: 'How do I contact support?',
    ht: 'Kijan m ka kontakte sipò?',
    es: '¿Cómo contacto al soporte?'
  },
  'faq.a8': {
    fr: 'Vous pouvez nous contacter via notre page de contact ou par email à support@taptopload.com',
    en: 'You can contact us via our contact page or by email at support@taptopload.com',
    ht: 'Ou ka kontakte nou via paj kontak nou oswa pa imel nan support@taptopload.com',
    es: 'Puede contactarnos a través de nuestra página de contacto o por correo electrónico a support@taptopload.com'
  },
  'faq.more_questions': {
    fr: 'Vous avez d\'autres questions?',
    en: 'Have more questions?',
    ht: 'Ou gen plis kesyon?',
    es: '¿Tiene más preguntas?'
  },
  'faq.contact_us': {
    fr: 'N\'hésitez pas à nous contacter, notre équipe est là pour vous aider.',
    en: 'Feel free to contact us, our team is here to help you.',
    ht: 'Pa ezite kontakte nou, ekip nou la pou ede w.',
    es: 'No dude en contactarnos, nuestro equipo está aquí para ayudarlo.'
  },

  // Contact Page
  'contact.title': {
    fr: 'Contactez-nous',
    en: 'Contact Us',
    ht: 'Kontakte nou',
    es: 'Contáctenos'
  },
  'contact.subtitle': {
    fr: 'Notre équipe est là pour vous aider',
    en: 'Our team is here to help you',
    ht: 'Ekip nou la pou ede w',
    es: 'Nuestro equipo está aquí para ayudarlo'
  },
  'contact.email_title': {
    fr: 'Email',
    en: 'Email',
    ht: 'Imel',
    es: 'Correo electrónico'
  },
  'contact.hours_title': {
    fr: 'Heures de support',
    en: 'Support Hours',
    ht: 'Lè sipò',
    es: 'Horario de soporte'
  },
  'contact.hours_content': {
    fr: 'Disponible 24h/24 et 7j/7',
    en: 'Available 24/7',
    ht: 'Disponib 24/7',
    es: 'Disponible 24/7'
  },
  'contact.name': {
    fr: 'Nom',
    en: 'Name',
    ht: 'Non',
    es: 'Nombre'
  },
  'contact.name_placeholder': {
    fr: 'Votre nom',
    en: 'Your name',
    ht: 'Non ou',
    es: 'Su nombre'
  },
  'contact.email': {
    fr: 'Email',
    en: 'Email',
    ht: 'Imel',
    es: 'Correo electrónico'
  },
  'contact.email_placeholder': {
    fr: 'votre@email.com',
    en: 'your@email.com',
    ht: 'ou@imel.com',
    es: 'su@correo.com'
  },
  'contact.message': {
    fr: 'Message',
    en: 'Message',
    ht: 'Mesaj',
    es: 'Mensaje'
  },
  'contact.message_placeholder': {
    fr: 'Comment pouvons-nous vous aider?',
    en: 'How can we help you?',
    ht: 'Kijan nou ka ede w?',
    es: '¿Cómo podemos ayudarlo?'
  },
  'contact.send': {
    fr: 'Envoyer le message',
    en: 'Send Message',
    ht: 'Voye mesaj',
    es: 'Enviar mensaje'
  },
  'contact.success_title': {
    fr: 'Message envoyé',
    en: 'Message sent',
    ht: 'Mesaj voye',
    es: 'Mensaje enviado'
  },
  'contact.success_desc': {
    fr: 'Nous vous répondrons dans les plus brefs délais.',
    en: 'We will respond to you as soon as possible.',
    ht: 'N ap reponn ou pi vit posib.',
    es: 'Le responderemos lo antes posible.'
  },
  'contact.whatsapp_title': {
    fr: 'Support WhatsApp',
    en: 'WhatsApp Support',
    ht: 'Sipò WhatsApp',
    es: 'Soporte WhatsApp'
  },
  'contact.whatsapp_button': {
    fr: 'Contacter via WhatsApp',
    en: 'Contact via WhatsApp',
    ht: 'Kontakte via WhatsApp',
    es: 'Contactar vía WhatsApp'
  },
  'contact.whatsapp_desc': {
    fr: 'Obtenez de l\'aide instantanée via WhatsApp',
    en: 'Get instant help via WhatsApp',
    ht: 'Jwenn èd touswit via WhatsApp',
    es: 'Obtenga ayuda instantánea vía WhatsApp'
  },

  // Help Center
  'help.title': {
    fr: 'Centre d\'aide',
    en: 'Help Center',
    ht: 'Sant èd',
    es: 'Centro de ayuda'
  },
  'help.subtitle': {
    fr: 'Comment pouvons-nous vous aider aujourd\'hui?',
    en: 'How can we help you today?',
    ht: 'Kijan nou ka ede w jodi a?',
    es: '¿Cómo podemos ayudarlo hoy?'
  },
  'help.search_placeholder': {
    fr: 'Rechercher dans l\'aide...',
    en: 'Search help...',
    ht: 'Chèche nan èd...',
    es: 'Buscar ayuda...'
  },
  'help.getting_started_title': {
    fr: 'Démarrage',
    en: 'Getting Started',
    ht: 'Kòmansman',
    es: 'Comenzar'
  },
  'help.getting_started_desc': {
    fr: 'Apprenez à utiliser Taptopload pour vos premières recharges',
    en: 'Learn how to use Taptopload for your first top-ups',
    ht: 'Aprann kijan pou itilize Taptopload pou premye rechaj ou yo',
    es: 'Aprenda a usar Taptopload para sus primeras recargas'
  },
  'help.payments_title': {
    fr: 'Paiements',
    en: 'Payments',
    ht: 'Peman',
    es: 'Pagos'
  },
  'help.payments_desc': {
    fr: 'Informations sur les moyens de paiement et la sécurité',
    en: 'Information about payment methods and security',
    ht: 'Enfòmasyon sou mwayen peman ak sekirite',
    es: 'Información sobre métodos de pago y seguridad'
  },
  'help.account_title': {
    fr: 'Compte',
    en: 'Account',
    ht: 'Kont',
    es: 'Cuenta'
  },
  'help.account_desc': {
    fr: 'Gérer votre compte et vos paramètres',
    en: 'Manage your account and settings',
    ht: 'Jere kont ou ak paramèt ou',
    es: 'Administrar su cuenta y configuración'
  },
  'help.troubleshooting_title': {
    fr: 'Dépannage',
    en: 'Troubleshooting',
    ht: 'Depanaj',
    es: 'Solución de problemas'
  },
  'help.troubleshooting_desc': {
    fr: 'Solutions aux problèmes courants',
    en: 'Solutions to common problems',
    ht: 'Solisyon a pwoblèm komen',
    es: 'Soluciones a problemas comunes'
  },
  'help.still_need_help': {
    fr: 'Besoin d\'aide supplémentaire?',
    en: 'Still need help?',
    ht: 'Toujou bezwen èd?',
    es: '¿Todavía necesita ayuda?'
  },
  'help.contact_support': {
    fr: 'Contactez notre équipe de support pour une assistance personnalisée.',
    en: 'Contact our support team for personalized assistance.',
    ht: 'Kontakte ekip sipò nou pou asistans pèsonalize.',
    es: 'Contacte a nuestro equipo de soporte para asistencia personalizada.'
  },

  // Auth Modals
  'auth.login_title': {
    fr: 'Connexion',
    en: 'Login',
    ht: 'Koneksyon',
    es: 'Iniciar sesión'
  },
  'auth.register_title': {
    fr: 'Inscription',
    en: 'Sign Up',
    ht: 'Enskri',
    es: 'Registrarse'
  },
  'auth.forgot_title': {
    fr: 'Mot de passe oublié',
    en: 'Forgot Password',
    ht: 'Paswò bliye',
    es: 'Olvidé la contraseña'
  },
  'auth.login_subtitle': {
    fr: 'Connectez-vous à votre compte',
    en: 'Sign in to your account',
    ht: 'Konekte nan kont ou',
    es: 'Inicia sesión en tu cuenta'
  },
  'auth.register_subtitle': {
    fr: 'Créez votre compte Taptopload',
    en: 'Create your Taptopload account',
    ht: 'Kreye kont Taptopload ou',
    es: 'Crea tu cuenta Taptopload'
  },
  'auth.forgot_subtitle': {
    fr: 'Réinitialisez votre mot de passe',
    en: 'Reset your password',
    ht: 'Reyajiste paswò ou',
    es: 'Restablece tu contraseña'
  },
  'auth.continue_with': {
    fr: 'Continuer avec',
    en: 'Continue with',
    ht: 'Kontinye avèk',
    es: 'Continuar con'
  },
  'auth.or_continue_email': {
    fr: 'Ou continuez avec votre email',
    en: 'Or continue with your email',
    ht: 'Oswa kontinye ak imel ou',
    es: 'O continúa con tu correo'
  },
  'auth.email': {
    fr: 'Email',
    en: 'Email',
    ht: 'Imel',
    es: 'Correo electrónico'
  },
  'auth.email_or_phone': {
    fr: 'Email ou Téléphone',
    en: 'Email or Phone',
    ht: 'Imel oswa Telefòn',
    es: 'Email o Teléfono'
  },
  'auth.email_placeholder': {
    fr: 'votre.email@exemple.com',
    en: 'your.email@example.com',
    ht: 'imel@ou.com',
    es: 'tu.correo@ejemplo.com'
  },
  'auth.identifier_placeholder': {
    fr: 'email@exemple.com ou +509...',
    en: 'email@example.com or +509...',
    ht: 'imel@ou.com oswa +509...',
    es: 'email@ejemplo.com o +509...'
  },
  'auth.password': {
    fr: 'Mot de passe',
    en: 'Password',
    ht: 'Paswò',
    es: 'Contraseña'
  },
  'auth.password_placeholder': {
    fr: '••••••••',
    en: '••••••••',
    ht: '••••••••',
    es: '••••••••'
  },
  'auth.first_name': {
    fr: 'Prénom',
    en: 'First Name',
    ht: 'Non',
    es: 'Nombre'
  },
  'auth.last_name': {
    fr: 'Nom',
    en: 'Last Name',
    ht: 'Siyati',
    es: 'Apellido'
  },
  'auth.phone': {
    fr: 'Téléphone',
    en: 'Phone',
    ht: 'Telefòn',
    es: 'Teléfono'
  },
  'auth.phone_placeholder': {
    fr: '+509 1234 5678',
    en: '+509 1234 5678',
    ht: '+509 1234 5678',
    es: '+509 1234 5678'
  },
  'auth.forgot_password': {
    fr: 'Mot de passe oublié?',
    en: 'Forgot password?',
    ht: 'Ou bliye paswò?',
    es: '¿Olvidaste tu contraseña?'
  },
  'auth.login_button': {
    fr: 'Se connecter',
    en: 'Sign in',
    ht: 'Konekte',
    es: 'Iniciar sesión'
  },
  'auth.register_button': {
    fr: 'Créer un compte',
    en: 'Create account',
    ht: 'Kreye kont',
    es: 'Crear cuenta'
  },
  'auth.send_reset': {
    fr: 'Envoyer le lien',
    en: 'Send reset link',
    ht: 'Voye lyen',
    es: 'Enviar enlace'
  },
  'auth.no_account': {
    fr: 'Pas de compte?',
    en: 'No account?',
    ht: 'Pa gen kont?',
    es: '¿No tienes cuenta?'
  },
  'auth.have_account': {
    fr: 'Déjà un compte?',
    en: 'Already have account?',
    ht: 'Ou gen kont deja?',
    es: '¿Ya tienes cuenta?'
  },
  'auth.back_to_login': {
    fr: 'Retour à la connexion',
    en: 'Back to login',
    ht: 'Retounen nan koneksyon',
    es: 'Volver al inicio de sesión'
  },
  'auth.success_register': {
    fr: 'Inscription réussie',
    en: 'Registration successful',
    ht: 'Enskripsyon reyisi',
    es: 'Registro exitoso'
  },
  'auth.success_register_desc': {
    fr: 'Votre compte a été créé avec succès',
    en: 'Your account has been created successfully',
    ht: 'Kont ou kreye avèk siksè',
    es: 'Tu cuenta ha sido creada exitosamente'
  },
  'auth.success_login': {
    fr: 'Connexion réussie',
    en: 'Login successful',
    ht: 'Koneksyon reyisi',
    es: 'Inicio de sesión exitoso'
  },
  'auth.success_login_desc': {
    fr: 'Bienvenue',
    en: 'Welcome back',
    ht: 'Byenvini',
    es: 'Bienvenido de nuevo'
  },
  'auth.email_sent': {
    fr: 'Email envoyé',
    en: 'Email sent',
    ht: 'Imel voye',
    es: 'Correo enviado'
  },
  'auth.email_sent_desc': {
    fr: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe',
    en: 'Check your email to reset your password',
    ht: 'Verifye bwat imel ou pou reyajiste paswò ou',
    es: 'Revisa tu correo para restablecer tu contraseña'
  },
  'auth.error': {
    fr: 'Erreur',
    en: 'Error',
    ht: 'Erè',
    es: 'Error'
  },
  'auth.error_desc': {
    fr: 'Une erreur est survenue',
    en: 'An error occurred',
    ht: 'Yon erè pase',
    es: 'Ocurrió un error'
  },
  'auth.google': {
    fr: 'Google',
    en: 'Google',
    ht: 'Google',
    es: 'Google'
  },
  'auth.twitter': {
    fr: 'Twitter',
    en: 'Twitter',
    ht: 'Twitter',
    es: 'Twitter'
  },
  'auth.facebook': {
    fr: 'Facebook',
    en: 'Facebook',
    ht: 'Facebook',
    es: 'Facebook'
  },
  'auth.first_name_placeholder': {
    fr: 'Prénom',
    en: 'First name',
    ht: 'Non',
    es: 'Nombre'
  },
  'auth.last_name_placeholder': {
    fr: 'Nom',
    en: 'Last name',
    ht: 'Siyati',
    es: 'Apellido'
  },
  'auth.send_reset_link': {
    fr: 'Envoyer le lien',
    en: 'Send reset link',
    ht: 'Voye lyen',
    es: 'Enviar enlace'
  },
  'auth.loading': {
    fr: 'Chargement...',
    en: 'Loading...',
    ht: 'Chajman...',
    es: 'Cargando...'
  },
  'auth.sending': {
    fr: 'Envoi...',
    en: 'Sending...',
    ht: 'Ap voye...',
    es: 'Enviando...'
  },
  'auth.login_link': {
    fr: 'Se connecter',
    en: 'Sign in',
    ht: 'Konekte',
    es: 'Iniciar sesión'
  },
  'auth.register_link': {
    fr: 'S\'inscrire',
    en: 'Sign up',
    ht: 'Enskri',
    es: 'Registrarse'
  },
  'auth.reset_password_title': {
    fr: 'Réinitialiser votre mot de passe',
    en: 'Reset your password',
    ht: 'Reyajiste paswò ou',
    es: 'Restablece tu contraseña'
  },
  'auth.reset_password_subtitle': {
    fr: 'Entrez votre nouveau mot de passe ci-dessous',
    en: 'Enter your new password below',
    ht: 'Antre nouvo paswò ou anba a',
    es: 'Ingresa tu nueva contraseña a continuación'
  },
  'auth.new_password': {
    fr: 'Nouveau mot de passe',
    en: 'New password',
    ht: 'Nouvo paswò',
    es: 'Nueva contraseña'
  },
  'auth.confirm_password': {
    fr: 'Confirmer le mot de passe',
    en: 'Confirm password',
    ht: 'Konfime paswò',
    es: 'Confirmar contraseña'
  },
  'auth.reset_password_button': {
    fr: 'Réinitialiser le mot de passe',
    en: 'Reset password',
    ht: 'Reyajiste paswò',
    es: 'Restablecer contraseña'
  },
  'auth.resetting': {
    fr: 'Réinitialisation...',
    en: 'Resetting...',
    ht: 'Reyajistman...',
    es: 'Restableciendo...'
  },
  'auth.password_reset_success': {
    fr: 'Mot de passe réinitialisé',
    en: 'Password reset',
    ht: 'Paswò reyajiste',
    es: 'Contraseña restablecida'
  },
  'auth.password_reset_success_desc': {
    fr: 'Votre mot de passe a été modifié avec succès.',
    en: 'Your password has been changed successfully.',
    ht: 'Paswò ou modifye avèk siksè.',
    es: 'Tu contraseña ha sido cambiada con éxito.'
  },
  'auth.redirecting_to_login': {
    fr: 'Redirection vers la page de connexion...',
    en: 'Redirecting to login page...',
    ht: 'Redireksyon vè paj koneksyon...',
    es: 'Redirigiendo a la página de inicio de sesión...'
  },
  'auth.verifying_link': {
    fr: 'Vérification du lien...',
    en: 'Verifying link...',
    ht: 'Verifikasyon lyen...',
    es: 'Verificando enlace...'
  },
  'auth.invalid_link': {
    fr: 'Lien invalide',
    en: 'Invalid link',
    ht: 'Lyen envalid',
    es: 'Enlace inválido'
  },
  'auth.invalid_link_desc': {
    fr: 'Lien invalide. Veuillez demander un nouveau lien de réinitialisation.',
    en: 'Invalid link. Please request a new reset link.',
    ht: 'Lyen envalid. Tanpri mande yon nouvo lyen reyajistman.',
    es: 'Enlace inválido. Por favor solicita un nuevo enlace de restablecimiento.'
  },
  'auth.back_home': {
    fr: 'Retour à l\'accueil',
    en: 'Back to home',
    ht: 'Retounen lakay',
    es: 'Volver al inicio'
  },
  'auth.password_min_8': {
    fr: 'Le mot de passe doit contenir au moins 8 caractères',
    en: 'Password must be at least 8 characters',
    ht: 'Paswò dwe gen omwen 8 karaktè',
    es: 'La contraseña debe tener al menos 8 caracteres'
  },
  'auth.passwords_dont_match': {
    fr: 'Les mots de passe ne correspondent pas',
    en: 'Passwords do not match',
    ht: 'Paswò yo pa koresponn',
    es: 'Las contraseñas no coinciden'
  },
  'auth.success': {
    fr: 'Succès',
    en: 'Success',
    ht: 'Siksè',
    es: 'Éxito'
  },

  // Dashboard
  'dashboard.overview': {
    fr: 'Vue d\'ensemble',
    en: 'Overview',
    ht: 'Apèsi',
    es: 'Resumen'
  },
  'dashboard.recharge': {
    fr: 'Recharge',
    en: 'Top-up',
    ht: 'Rechaj',
    es: 'Recarga'
  },
  'dashboard.favorites': {
    fr: 'Favoris',
    en: 'Favorites',
    ht: 'Favori',
    es: 'Favoritos'
  },
  'dashboard.history': {
    fr: 'Historique',
    en: 'History',
    ht: 'Istwa',
    es: 'Historial'
  },
  'dashboard.requests': {
    fr: 'Demandes',
    en: 'Requests',
    ht: 'Demann',
    es: 'Solicitudes'
  },
  'dashboard.profile': {
    fr: 'Profil',
    en: 'Profile',
    ht: 'Pwofil',
    es: 'Perfil'
  },
  'dashboard.logout': {
    fr: 'Déconnexion',
    en: 'Logout',
    ht: 'Dekonekte',
    es: 'Cerrar sesión'
  },
  'dashboard.home': {
    fr: 'Accueil',
    en: 'Home',
    ht: 'Akèy',
    es: 'Inicio'
  },
  'dashboard.settings': {
    fr: 'Paramètres',
    en: 'Settings',
    ht: 'Paramèt',
    es: 'Configuración'
  },
  'dashboard.admin': {
    fr: 'Admin',
    en: 'Admin',
    ht: 'Admin',
    es: 'Admin'
  },
  'dashboard.navigation': {
    fr: 'Navigation',
    en: 'Navigation',
    ht: 'Navigasyon',
    es: 'Navegación'
  },
  'dashboard.administration': {
    fr: 'Administration',
    en: 'Administration',
    ht: 'Administrasyon',
    es: 'Administración'
  },
  'dashboard.mobile_recharge': {
    fr: 'Recharge Mobile',
    en: 'Mobile Top-up',
    ht: 'Rechaj Mobil',
    es: 'Recarga Móvil'
  },
  'dashboard.account': {
    fr: 'Compte',
    en: 'Account',
    ht: 'Kont',
    es: 'Cuenta'
  },
  'recurringRecharges': {
    fr: 'Recharges récurrentes',
    en: 'Recurring Recharges',
    ht: 'Rechaj rekirans',
    es: 'Recargas recurrentes'
  },
  'loyaltyProgram': {
    fr: 'Programme de fidélité',
    en: 'Loyalty Program',
    ht: 'Pwogram fidelite',
    es: 'Programa de fidelidad'
  },

  // Overview Page
  'overview.title': {
    fr: 'Vue d\'ensemble',
    en: 'Overview',
    ht: 'Apèsi jeneral',
    es: 'Vista general'
  },
  'overview.subtitle': {
    fr: 'Statistiques de votre compte en temps réel',
    en: 'Real-time account statistics',
    ht: 'Estatistik kont ou an tan reyèl',
    es: 'Estadísticas de su cuenta en tiempo real'
  },
  'overview.total_recharged': {
    fr: 'Total Rechargé',
    en: 'Total Recharged',
    ht: 'Total Rechaje',
    es: 'Total Recargado'
  },
  'overview.total_amount': {
    fr: 'Montant total',
    en: 'Total amount',
    ht: 'Montan total',
    es: 'Monto total'
  },
  'overview.transactions': {
    fr: 'Transactions',
    en: 'Transactions',
    ht: 'Tranzaksyon',
    es: 'Transacciones'
  },
  'overview.total_completed': {
    fr: 'Total effectuées',
    en: 'Total completed',
    ht: 'Total fèt',
    es: 'Total completadas'
  },
  'overview.success_rate': {
    fr: 'Taux de Succès',
    en: 'Success Rate',
    ht: 'To Siksè',
    es: 'Tasa de Éxito'
  },
  'overview.successful_transactions': {
    fr: 'Transactions réussies',
    en: 'Successful transactions',
    ht: 'Tranzaksyon reyisi',
    es: 'Transacciones exitosas'
  },
  'overview.pending_requests': {
    fr: 'Demandes en attente',
    en: 'Pending Requests',
    ht: 'Demann ann atant',
    es: 'Solicitudes pendientes'
  },
  'overview.to_process': {
    fr: 'À traiter',
    en: 'To process',
    ht: 'Pou trete',
    es: 'Para procesar'
  },
  'overview.recharge_evolution': {
    fr: 'Évolution des Recharges',
    en: 'Recharge Evolution',
    ht: 'Evolisyon Rechaj',
    es: 'Evolución de Recargas'
  },
  'overview.total_amount_per_period': {
    fr: 'Montant total par période',
    en: 'Total amount per period',
    ht: 'Montan total pa peryòd',
    es: 'Monto total por período'
  },
  'overview.period_7d': {
    fr: '7 jours',
    en: '7 days',
    ht: '7 jou',
    es: '7 días'
  },
  'overview.period_30d': {
    fr: '30 jours',
    en: '30 days',
    ht: '30 jou',
    es: '30 días'
  },
  'overview.period_12m': {
    fr: '12 mois',
    en: '12 months',
    ht: '12 mwa',
    es: '12 meses'
  },
  'overview.period_year': {
    fr: 'Année',
    en: 'Year',
    ht: 'Ane',
    es: 'Año'
  },
  'overview.operators_distribution': {
    fr: 'Distribution par Opérateur',
    en: 'Distribution by Operator',
    ht: 'Distribisyon pa Operatè',
    es: 'Distribución por Operador'
  },
  'overview.breakdown_by_operator': {
    fr: 'Répartition par opérateur',
    en: 'Breakdown by operator',
    ht: 'Repartisyon pa operatè',
    es: 'Desglose por operador'
  },
  'overview.recent_transactions': {
    fr: 'Transactions Récentes',
    en: 'Recent Transactions',
    ht: 'Tranzaksyon Resan',
    es: 'Transacciones Recientes'
  },
  'overview.last_activities': {
    fr: 'Vos dernières activités',
    en: 'Your latest activities',
    ht: 'Dènye aktivite ou yo',
    es: 'Sus últimas actividades'
  },
  'overview.quick_actions': {
    fr: 'Actions Rapides',
    en: 'Quick Actions',
    ht: 'Aksyon Rapid',
    es: 'Acciones Rápidas'
  },
  'overview.new_recharge': {
    fr: 'Nouvelle Recharge',
    en: 'New Recharge',
    ht: 'Nouvo Rechaj',
    es: 'Nueva Recarga'
  },
  'overview.recharge_now': {
    fr: 'Recharger maintenant',
    en: 'Recharge now',
    ht: 'Rechaje kounye a',
    es: 'Recargar ahora'
  },
  'overview.my_favorites': {
    fr: 'Mes Favoris',
    en: 'My Favorites',
    ht: 'Favori mwen',
    es: 'Mis Favoritos'
  },
  'overview.quick_access': {
    fr: 'Accès rapide',
    en: 'Quick access',
    ht: 'Aksè rapid',
    es: 'Acceso rápido'
  },
  'overview.history': {
    fr: 'Historique',
    en: 'History',
    ht: 'Istwa',
    es: 'Historial'
  },
  'overview.view_all': {
    fr: 'Voir tout',
    en: 'View all',
    ht: 'Gade tout',
    es: 'Ver todo'
  },
  'overview.no_data': {
    fr: 'Aucune donnée disponible',
    en: 'No data available',
    ht: 'Pa gen done disponib',
    es: 'No hay datos disponibles'
  },
  'overview.no_transactions': {
    fr: 'Aucune transaction récente',
    en: 'No recent transactions',
    ht: 'Pa gen tranzaksyon resan',
    es: 'No hay transacciones recientes'
  },
  'overview.no_transactions_desc': {
    fr: 'Effectuez votre première recharge pour commencer',
    en: 'Make your first recharge to get started',
    ht: 'Fè premye rechaj ou pou kòmanse',
    es: 'Realice su primera recarga para comenzar'
  },
  'overview.status_unknown': {
    fr: 'Inconnu',
    en: 'Unknown',
    ht: 'Enkoni',
    es: 'Desconocido'
  },

  // Requests Page Keys
  'requests.title': { fr: 'Demandes de Recharge', en: 'Recharge Requests', ht: 'Demann Rechaj', es: 'Solicitudes de Recarga' },
  'requests.subtitle': { fr: 'Envoyez et gérez vos demandes de recharge', en: 'Send and manage your recharge requests', ht: 'Voye epi jere demann rechaj ou yo', es: 'Envíe y gestione sus solicitudes de recarga' },
  'requests.received': { fr: 'Reçues', en: 'Received', ht: 'Resevwa', es: 'Recibidas' },
  'requests.sent': { fr: 'Envoyées', en: 'Sent', ht: 'Voye', es: 'Enviadas' },
  'requests.new_request': { fr: 'Nouvelle Demande', en: 'New Request', ht: 'Nouvo Demann', es: 'Nueva Solicitud' },
  'requests.pay_now': { fr: 'Payer', en: 'Pay', ht: 'Peye', es: 'Pagar' },
  'requests.reject': { fr: 'Refuser', en: 'Reject', ht: 'Refize', es: 'Rechazar' },
  'requests.cancel': { fr: 'Annuler', en: 'Cancel', ht: 'Anile', es: 'Cancelar' },
  'requests.delete': { fr: 'Supprimer', en: 'Delete', ht: 'Efase', es: 'Eliminar' },
  'requests.copy_code': { fr: 'Code', en: 'Code', ht: 'Kòd', es: 'Código' },
  'requests.copy_link': { fr: 'Lien', en: 'Link', ht: 'Lyen', es: 'Enlace' },
  'requests.share': { fr: 'Partager', en: 'Share', ht: 'Pataje', es: 'Compartir' },
  'requests.from': { fr: 'De :', en: 'From:', ht: 'De:', es: 'De:' },
  'requests.to': { fr: 'À :', en: 'To:', ht: 'Pou:', es: 'A:' },
  'requests.sent_label': { fr: 'Demande envoyée', en: 'Request sent', ht: 'Demann voye', es: 'Solicitud enviada' },
  'requests.default_title': { fr: 'Demande de recharge', en: 'Recharge request', ht: 'Demann rechaj', es: 'Solicitud de recarga' },

  // Recharge Page
  'recharge.title_page': {
    fr: 'Recharge',
    en: 'Recharge',
    ht: 'Rechaj',
    es: 'Recarga'
  },
  'recharge.subtitle_page': {
    fr: 'Rechargez votre crédit mobile instantanément',
    en: 'Recharge your mobile credit instantly',
    ht: 'Rechaje kredi mobil ou imedyatman',
    es: 'Recargue su crédito móvil al instante'
  },
  'recharge.favorites_title': {
    fr: 'Favoris',
    en: 'Favorites',
    ht: 'Favori',
    es: 'Favoritos'
  },
  'recharge.favorites_desc': {
    fr: 'Accès rapide à vos numéros favoris',
    en: 'Quick access to your favorite numbers',
    ht: 'Aksè rapid bay nimewo favori ou',
    es: 'Acceso rápido a sus números favoritos'
  },
  'recharge.no_favorites': {
    fr: 'Aucun favori',
    en: 'No favorites',
    ht: 'Pa gen favori',
    es: 'Sin favoritos'
  },
  'recharge.no_favorites_desc': {
    fr: 'Ajoutez des numéros favoris pour un accès rapide',
    en: 'Add favorite numbers for quick access',
    ht: 'Ajoute nimewo favori pou aksè rapid',
    es: 'Agregue números favoritos para acceso rápido'
  },
  'recharge.new_recharge_title': {
    fr: 'Nouvelle Recharge',
    en: 'New Recharge',
    ht: 'Nouvo Rechaj',
    es: 'Nueva Recarga'
  },
  'recharge.new_recharge_desc': {
    fr: 'Entrez les détails de la recharge',
    en: 'Enter recharge details',
    ht: 'Antre detay rechaj la',
    es: 'Ingrese los detalles de la recarga'
  },
  'recharge.phone_number_label': {
    fr: 'Numéro de téléphone',
    en: 'Phone number',
    ht: 'Nimewo telefòn',
    es: 'Número de teléfono'
  },
  'recharge.amount_label': {
    fr: 'Montant (USD)',
    en: 'Amount (USD)',
    ht: 'Montan (USD)',
    es: 'Monto (USD)'
  },
  'recharge.commission_note': {
    fr: 'Une commission de 3% sera ajoutée',
    en: 'A 3% commission will be added',
    ht: 'Yon komisyon 3% ap ajoute',
    es: 'Se agregará una comisión del 3%'
  },
  'recharge.total_to_pay': {
    fr: 'Total à payer',
    en: 'Total to pay',
    ht: 'Total pou peye',
    es: 'Total a pagar'
  },
  'recharge.operator_detected': {
    fr: 'Opérateur détecté',
    en: 'Operator detected',
    ht: 'Operatè detekte',
    es: 'Operador detectado'
  },
  'recharge.continue_payment': {
    fr: 'Continuer vers le paiement',
    en: 'Continue to payment',
    ht: 'Kontinye pou peman',
    es: 'Continuar al pago'
  },
  'recharge.payment_title': {
    fr: 'Paiement sécurisé',
    en: 'Secure Payment',
    ht: 'Peman Sekirize',
    es: 'Pago Seguro'
  },
  'recharge.payment_desc': {
    fr: 'Complétez votre paiement pour finaliser la recharge',
    en: 'Complete your payment to finalize the recharge',
    ht: 'Konplete peman ou pou finalize rechaj la',
    es: 'Complete su pago para finalizar la recarga'
  },
  'recharge.back_to_form': {
    fr: 'Retour au formulaire',
    en: 'Back to form',
    ht: 'Retounen nan fòm',
    es: 'Volver al formulario'
  },
  'recharge.error_invalid_number': {
    fr: 'Numéro invalide',
    en: 'Invalid number',
    ht: 'Nimewo envalid',
    es: 'Número inválido'
  },
  'recharge.error_invalid_amount': {
    fr: 'Montant invalide',
    en: 'Invalid amount',
    ht: 'Montan envalid',
    es: 'Monto inválido'
  },
  'recharge.error_login_required': {
    fr: 'Connexion requise',
    en: 'Login required',
    ht: 'Koneksyon obligatwa',
    es: 'Inicio de sesión requerido'
  },
  'recharge.error_guest_limit': {
    fr: 'Les invités peuvent recharger jusqu\'à $300 maximum (incluant la commission de 3%). Veuillez vous connecter pour effectuer des recharges plus importantes.',
    en: 'Guests can recharge up to $300 maximum (including 3% commission). Please log in to make larger recharges.',
    ht: 'Envite yo ka rechaje jiska $300 maksimòm (gen ladan komisyon 3%). Tanpri konekte pou fè rechaj pi gwo.',
    es: 'Los invitados pueden recargar hasta $300 máximo (incluyendo comisión del 3%). Por favor inicie sesión para realizar recargas mayores.'
  },
  'recharge.success_title': {
    fr: 'Recharge réussie',
    en: 'Recharge successful',
    ht: 'Rechaj reyisi',
    es: 'Recarga exitosa'
  },
  'recharge.success_desc': {
    fr: 'Votre recharge a été effectuée avec succès',
    en: 'Your recharge was successful',
    ht: 'Rechaj ou te reyisi',
    es: 'Su recarga fue exitosa'
  },
  'recharge.error_title': {
    fr: 'Erreur',
    en: 'Error',
    ht: 'Erè',
    es: 'Error'
  },
  'recharge.payment_error': {
    fr: 'Erreur de paiement',
    en: 'Payment error',
    ht: 'Erè peman',
    es: 'Error de pago'
  },
  'recharge.payment_method': {
    fr: 'Méthode de paiement',
    en: 'Payment method',
    ht: 'Mòd peman',
    es: 'Método de pago'
  },
  'recharge.credit_card': {
    fr: 'Carte de crédit',
    en: 'Credit card',
    ht: 'Kat kredi',
    es: 'Tarjeta de crédito'
  },
  'recharge.secure_payment_stripe': {
    fr: 'Paiement sécurisé via Stripe',
    en: 'Secure payment via Stripe',
    ht: 'Peman sekirize pa Stripe',
    es: 'Pago seguro vía Stripe'
  },
  'recharge.recharge_amount': {
    fr: 'Montant de la recharge',
    en: 'Recharge amount',
    ht: 'Montan rechaj',
    es: 'Monto de recarga'
  },
  'recharge.commission': {
    fr: 'Frais',
    en: 'Fee',
    ht: 'Frè',
    es: 'Tarifa'
  },
  'recharge.preparing': {
    fr: 'Préparation...',
    en: 'Preparing...',
    ht: 'Preparasyon...',
    es: 'Preparando...'
  },
  'recharge.proceed_payment': {
    fr: 'Procéder au paiement',
    en: 'Proceed to payment',
    ht: 'Kontinye pou peman',
    es: 'Proceder al pago'
  },

  // Dashboard Recharge Page
  'recharge_page.title': {
    fr: 'Recharge Mobile',
    en: 'Mobile Top-up',
    ht: 'Rechaj Mobil',
    es: 'Recarga Móvil'
  },
  'recharge_page.subtitle': {
    fr: 'Rechargez votre téléphone ou celui d\'un proche',
    en: 'Top up your phone or a loved one\'s',
    ht: 'Rechaje telefòn ou oswa yon moun ou renmen',
    es: 'Recarga tu teléfono o el de un ser querido'
  },
  'recharge_page.error': {
    fr: 'Erreur',
    en: 'Error',
    ht: 'Erè',
    es: 'Error'
  },
  'recharge_page.recharge_failed': {
    fr: 'Recharge échouée',
    en: 'Top-up failed',
    ht: 'Rechaj echwe',
    es: 'Recarga fallida'
  },
  'recharge_page.recharge_rejected': {
    fr: 'La recharge a été refusée. Veuillez réessayer.',
    en: 'The top-up was rejected. Please try again.',
    ht: 'Rechaj la te refize. Tanpri eseye ankò.',
    es: 'La recarga fue rechazada. Por favor, inténtelo de nuevo.'
  },
  'recharge_page.credit_sent': {
    fr: '✅ Crédit envoyé !',
    en: '✅ Credit sent!',
    ht: '✅ Kredi voye!',
    es: '✅ ¡Crédito enviado!'
  },
  'recharge_page.confirm_receipt_message': {
    fr: 'Veuillez confirmer la réception du crédit dans les 3 minutes.',
    en: 'Please confirm receipt of credit within 3 minutes.',
    ht: 'Tanpri konfime resepsyon kredi a nan 3 minit.',
    es: 'Por favor, confirme la recepción del crédito en 3 minutos.'
  },
  'recharge_page.recharge_in_progress': {
    fr: '🚀 Recharge en cours',
    en: '🚀 Top-up in progress',
    ht: '🚀 Rechaj ap fèt',
    es: '🚀 Recarga en proceso'
  },
  'recharge_page.processing_message': {
    fr: 'Votre recharge est en cours de traitement...',
    en: 'Your top-up is being processed...',
    ht: 'Rechaj ou ap trete...',
    es: 'Su recarga se está procesando...'
  },
  'recharge_page.recharge_successful': {
    fr: 'Recharge réussie',
    en: 'Top-up successful',
    ht: 'Rechaj reyisi',
    es: 'Recarga exitosa'
  },
  'recharge_page.recharge_completed_message': {
    fr: 'La recharge a été effectuée avec succès',
    en: 'The top-up was completed successfully',
    ht: 'Rechaj la fèt avèk siksè',
    es: 'La recarga se completó con éxito'
  },
  'recharge_page.invalid_number': {
    fr: 'Numéro invalide',
    en: 'Invalid number',
    ht: 'Nimewo envalid',
    es: 'Número inválido'
  },
  'recharge_page.invalid_phone_message': {
    fr: 'Le numéro de téléphone est invalide',
    en: 'The phone number is invalid',
    ht: 'Nimewo telefòn nan envalid',
    es: 'El número de teléfono no es válido'
  },
  'recharge_page.invalid_amount': {
    fr: 'Montant invalide',
    en: 'Invalid amount',
    ht: 'Montan envalid',
    es: 'Monto inválido'
  },
  'recharge_page.amount_must_be_positive': {
    fr: 'Le montant doit être supérieur à 0',
    en: 'Amount must be greater than 0',
    ht: 'Montan an dwe pi gran pase 0',
    es: 'El monto debe ser mayor que 0'
  },
  'recharge_page.amount_too_small': {
    fr: 'Montant trop petit',
    en: 'Amount too small',
    ht: 'Montan twò piti',
    es: 'Monto demasiado pequeño'
  },
  'recharge_page.login_required': {
    fr: 'Connexion requise',
    en: 'Login required',
    ht: 'Koneksyon obligatwa',
    es: 'Inicio de sesión requerido'
  },
  'recharge_page.amount_exceeds_guest_limit': {
    fr: 'Pour les montants supérieurs à {limit} {currency}, veuillez vous connecter',
    en: 'For amounts above {limit} {currency}, please log in',
    ht: 'Pou montan ki pi wo pase {limit} {currency}, tanpri konekte',
    es: 'Para montos superiores a {limit} {currency}, por favor inicie sesión'
  },
  'recharge_page.payment_error': {
    fr: 'Erreur de paiement',
    en: 'Payment error',
    ht: 'Erè peman',
    es: 'Error de pago'
  },
  'recharge_page.transaction_completed': {
    fr: 'Votre transaction a été complétée avec succès',
    en: 'Your transaction was completed successfully',
    ht: 'Tranzaksyon ou a fèt avèk siksè',
    es: 'Su transacción se completó con éxito'
  },
  'recharge_page.transaction_successful': {
    fr: 'Transaction réussie !',
    en: 'Transaction successful!',
    ht: 'Tranzaksyon reyisi!',
    es: '¡Transacción exitosa!'
  },
  'recharge_page.transaction_id': {
    fr: 'ID Transaction',
    en: 'Transaction ID',
    ht: 'ID Tranzaksyon',
    es: 'ID de Transacción'
  },
  'recharge_page.phone_number': {
    fr: 'Numéro de téléphone',
    en: 'Phone number',
    ht: 'Nimewo telefòn',
    es: 'Número de teléfono'
  },
  'recharge_page.operator': {
    fr: 'Opérateur',
    en: 'Operator',
    ht: 'Operatè',
    es: 'Operador'
  },
  'recharge_page.amount': {
    fr: 'Montant',
    en: 'Amount',
    ht: 'Montan',
    es: 'Monto'
  },
  'recharge_page.commission_3': {
    fr: 'Frais de service',
    en: 'Service fee',
    ht: 'Frè sèvis',
    es: 'Tarifa de servicio'
  },
  'recharge_page.total_paid': {
    fr: 'Total payé',
    en: 'Total paid',
    ht: 'Total peye',
    es: 'Total pagado'
  },
  'recharge_page.download_receipt': {
    fr: 'Télécharger le reçu',
    en: 'Download receipt',
    ht: 'Telechaje resi',
    es: 'Descargar recibo'
  },
  'recharge_page.new_recharge': {
    fr: 'Nouvelle recharge',
    en: 'New top-up',
    ht: 'Nouvo rechaj',
    es: 'Nueva recarga'
  },
  'recharge_page.payment': {
    fr: 'Paiement',
    en: 'Payment',
    ht: 'Peman',
    es: 'Pago'
  },
  'recharge_page.complete_payment': {
    fr: 'Complétez le paiement pour effectuer la recharge',
    en: 'Complete the payment to process the top-up',
    ht: 'Konplete peman an pou fè rechaj la',
    es: 'Complete el pago para procesar la recarga'
  },
  'recharge_page.favorites': {
    fr: 'Favoris',
    en: 'Favorites',
    ht: 'Favori',
    es: 'Favoritos'
  },
  'recharge_page.quick_recharge_favorites': {
    fr: 'Rechargez rapidement vos numéros favoris',
    en: 'Quickly top up your favorite numbers',
    ht: 'Rechaje rapidman nimewo favori ou yo',
    es: 'Recarga rápidamente tus números favoritos'
  },
  'recharge_page.new_recharge_title': {
    fr: 'Nouvelle recharge',
    en: 'New top-up',
    ht: 'Nouvo rechaj',
    es: 'Nueva recarga'
  },
  'recharge_page.enter_number_amount': {
    fr: 'Entrez le numéro et le montant à recharger',
    en: 'Enter the number and amount to top up',
    ht: 'Antre nimewo ak montan pou rechaje',
    es: 'Ingrese el número y el monto a recargar'
  },
  'recharge_page.operator_detected': {
    fr: 'Opérateur détecté',
    en: 'Operator detected',
    ht: 'Operatè detekte',
    es: 'Operador detectado'
  },
  'recharge_page.payment_method': {
    fr: 'Méthode de paiement',
    en: 'Payment method',
    ht: 'Metòd peman',
    es: 'Método de pago'
  },
  'recharge_page.credit_card': {
    fr: 'Carte de crédit',
    en: 'Credit card',
    ht: 'Kat kredi',
    es: 'Tarjeta de crédito'
  },
  'recharge_page.secure_payment_stripe': {
    fr: 'Paiement sécurisé via Stripe',
    en: 'Secure payment via Stripe',
    ht: 'Peman sekirize via Stripe',
    es: 'Pago seguro a través de Stripe'
  },
  'recharge_page.recharge_amount': {
    fr: 'Montant de la recharge',
    en: 'Top-up amount',
    ht: 'Montan rechaj',
    es: 'Monto de recarga'
  },
  'recharge_page.total_to_pay': {
    fr: 'Total à payer',
    en: 'Total to pay',
    ht: 'Total pou peye',
    es: 'Total a pagar'
  },
  'recharge_page.preparing': {
    fr: 'Préparation...',
    en: 'Preparing...',
    ht: 'Preparasyon...',
    es: 'Preparando...'
  },
  'recharge_page.proceed_to_payment': {
    fr: 'Procéder au paiement',
    en: 'Proceed to payment',
    ht: 'Ale nan peman',
    es: 'Proceder al pago'
  },

  // Favorites Page
  'favorites.title': {
    fr: 'Favoris',
    en: 'Favorites',
    ht: 'Favori',
    es: 'Favoritos'
  },
  'favorites.subtitle': {
    fr: 'Gérez vos numéros favoris',
    en: 'Manage your favorite numbers',
    ht: 'Jere nimewo favori ou yo',
    es: 'Gestione sus números favoritos'
  },
  'favorites.add_favorite': {
    fr: 'Ajouter un favori',
    en: 'Add favorite',
    ht: 'Ajoute yon favori',
    es: 'Agregar favorito'
  },
  'favorites.dialog_title': {
    fr: 'Ajouter un numéro favori',
    en: 'Add favorite number',
    ht: 'Ajoute yon nimewo favori',
    es: 'Agregar número favorito'
  },
  'favorites.dialog_desc': {
    fr: 'Enregistrez un numéro pour y accéder rapidement',
    en: 'Save a number for quick access',
    ht: 'Anrejistre yon nimewo pou aksè rapid',
    es: 'Guardar un número para acceso rápido'
  },
  'favorites.nickname_label': {
    fr: 'Surnom (optionnel)',
    en: 'Nickname (optional)',
    ht: 'Non (opsyonèl)',
    es: 'Apodo (opcional)'
  },
  'favorites.nickname_placeholder': {
    fr: 'Ex: Maman, Pierre...',
    en: 'Ex: Mom, John...',
    ht: 'Egz: Manman, Jan...',
    es: 'Ej: Mamá, Pedro...'
  },
  'favorites.operator_label': {
    fr: 'Code opérateur (optionnel)',
    en: 'Operator code (optional)',
    ht: 'Kòd operatè (opsyonèl)',
    es: 'Código de operador (opcional)'
  },
  'favorites.operator_placeholder': {
    fr: 'Ex: DIGICEL',
    en: 'Ex: DIGICEL',
    ht: 'Egz: DIGICEL',
    es: 'Ej: DIGICEL'
  },
  'favorites.cancel': {
    fr: 'Annuler',
    en: 'Cancel',
    ht: 'Anile',
    es: 'Cancelar'
  },
  'favorites.add': {
    fr: 'Ajouter',
    en: 'Add',
    ht: 'Ajoute',
    es: 'Agregar'
  },
  'favorites.delete': {
    fr: 'Supprimer',
    en: 'Delete',
    ht: 'Efase',
    es: 'Eliminar'
  },
  'favorites.no_favorites': {
    fr: 'Aucun favori enregistré',
    en: 'No favorites saved',
    ht: 'Pa gen favori anrejistre',
    es: 'Sin favoritos guardados'
  },
  'favorites.no_favorites_desc': {
    fr: 'Ajoutez vos numéros fréquemment utilisés pour un accès rapide',
    en: 'Add your frequently used numbers for quick access',
    ht: 'Ajoute nimewo ou itilize souvan pou aksè rapid',
    es: 'Agregue sus números de uso frecuente para acceso rápido'
  },
  'favorites.added': {
    fr: 'Favori ajouté',
    en: 'Favorite added',
    ht: 'Favori ajoute',
    es: 'Favorito agregado'
  },
  'favorites.added_desc': {
    fr: 'Le numéro a été ajouté à vos favoris',
    en: 'The number has been added to your favorites',
    ht: 'Nimewo a te ajoute nan favori ou',
    es: 'El número se agregó a sus favoritos'
  },
  'favorites.deleted': {
    fr: 'Favori supprimé',
    en: 'Favorite deleted',
    ht: 'Favori efase',
    es: 'Favorito eliminado'
  },
  'favorites.deleted_desc': {
    fr: 'Le numéro a été retiré de vos favoris',
    en: 'The number has been removed from your favorites',
    ht: 'Nimewo a te retire nan favori ou',
    es: 'El número se eliminó de sus favoritos'
  },
  'favorites.error': {
    fr: 'Échec',
    en: 'Failed',
    ht: 'Echwe',
    es: 'Fallido'
  },
  'favorites.recharge_now': {
    fr: 'Recharger maintenant',
    en: 'Recharge now',
    ht: 'Rechaje kounye a',
    es: 'Recargar ahora'
  },

  // History Page
  'history.title': {
    fr: 'Historique',
    en: 'History',
    ht: 'Istwa',
    es: 'Historial'
  },
  'history.subtitle': {
    fr: 'Toutes vos transactions',
    en: 'All your transactions',
    ht: 'Tout tranzaksyon ou yo',
    es: 'Todas sus transacciones'
  },
  'history.download_receipt': {
    fr: 'Télécharger le reçu',
    en: 'Download receipt',
    ht: 'Telechaje resi',
    es: 'Descargar recibo'
  },
  'history.status_completed': {
    fr: 'Terminée',
    en: 'Completed',
    ht: 'Fini',
    es: 'Completada'
  },
  'history.status_pending': {
    fr: 'En attente',
    en: 'Pending',
    ht: 'Ann atant',
    es: 'Pendiente'
  },
  'history.status_processing': {
    fr: 'En cours',
    en: 'Processing',
    ht: 'An kou',
    es: 'Procesando'
  },
  'history.status_failed': {
    fr: 'Échouée',
    en: 'Failed',
    ht: 'Echwe',
    es: 'Fallida'
  },
  'history.status_cancelled': {
    fr: 'Annulée',
    en: 'Cancelled',
    ht: 'Anile',
    es: 'Cancelada'
  },
  'history.no_transactions': {
    fr: 'Aucune transaction',
    en: 'No transactions',
    ht: 'Pa gen tranzaksyon',
    es: 'Sin transacciones'
  },
  'history.no_transactions_desc': {
    fr: 'Vos transactions apparaîtront ici',
    en: 'Your transactions will appear here',
    ht: 'Tranzaksyon ou yo ap parèt isit la',
    es: 'Sus transacciones aparecerán aquí'
  },

  // Requests Page
  'requests.received': {
    fr: 'Reçues',
    en: 'Received',
    ht: 'Resevwa',
    es: 'Recibidas'
  },
  'requests.sent': {
    fr: 'Envoyées',
    en: 'Sent',
    ht: 'Voye',
    es: 'Enviadas'
  },
  'requests.pending_requests': {
    fr: 'Demandes en attente',
    en: 'Pending requests',
    ht: 'Demann ann atant',
    es: 'Solicitudes pendientes'
  },
  'requests.history_title': {
    fr: 'Historique',
    en: 'History',
    ht: 'Istwa',
    es: 'Historial'
  },
  'requests.new_request_desc': {
    fr: 'Demandez à quelqu\'un de recharger votre numéro',
    en: 'Ask someone to recharge your number',
    ht: 'Mande yon moun rechaje nimewo ou',
    es: 'Pida a alguien que recargue su número'
  },
  'requests.message_label': {
    fr: 'Message (optionnel)',
    en: 'Message (optional)',
    ht: 'Mesaj (opsyonèl)',
    es: 'Mensaje (opcional)'
  },
  'requests.message_placeholder': {
    fr: 'Ajoutez un message...',
    en: 'Add a message...',
    ht: 'Ajoute yon mesaj...',
    es: 'Agregar un mensaje...'
  },
  'requests.send_request': {
    fr: 'Envoyer la demande',
    en: 'Send request',
    ht: 'Voye demann',
    es: 'Enviar solicitud'
  },
  'requests.accept': {
    fr: 'Accepter',
    en: 'Accept',
    ht: 'Aksepte',
    es: 'Aceptar'
  },
  'requests.reject': {
    fr: 'Refuser',
    en: 'Reject',
    ht: 'Refize',
    es: 'Rechazar'
  },
  'requests.share_whatsapp': {
    fr: 'Partager sur WhatsApp',
    en: 'Share on WhatsApp',
    ht: 'Pataje sou WhatsApp',
    es: 'Compartir en WhatsApp'
  },
  'requests.copy_code': {
    fr: 'Copier le code',
    en: 'Copy code',
    ht: 'Kopye kòd',
    es: 'Copiar código'
  },
  'requests.no_received': {
    fr: 'Aucune demande reçue',
    en: 'No requests received',
    ht: 'Pa gen demann resevwa',
    es: 'Sin solicitudes recibidas'
  },
  'requests.no_sent': {
    fr: 'Aucune demande envoyée',
    en: 'No requests sent',
    ht: 'Pa gen demann voye',
    es: 'Sin solicitudes enviadas'
  },

  // Profile Page
  'profile.title': {
    fr: 'Profil',
    en: 'Profile',
    ht: 'Pwofil',
    es: 'Perfil'
  },
  'profile.subtitle': {
    fr: 'Gérez vos informations personnelles',
    en: 'Manage your personal information',
    ht: 'Jere enfòmasyon pèsonèl ou',
    es: 'Gestione su información personal'
  },
  'profile.personal_info': {
    fr: 'Informations personnelles',
    en: 'Personal information',
    ht: 'Enfòmasyon pèsonèl',
    es: 'Información personal'
  },
  'profile.update_info': {
    fr: 'Mettez à jour vos informations',
    en: 'Update your information',
    ht: 'Aktyalize enfòmasyon ou',
    es: 'Actualice su información'
  },
  'profile.first_name': {
    fr: 'Prénom',
    en: 'First name',
    ht: 'Non',
    es: 'Nombre'
  },
  'profile.last_name': {
    fr: 'Nom',
    en: 'Last name',
    ht: 'Siyati',
    es: 'Apellido'
  },
  'profile.email': {
    fr: 'Email',
    en: 'Email',
    ht: 'Imel',
    es: 'Correo'
  },
  'profile.phone': {
    fr: 'Téléphone',
    en: 'Phone',
    ht: 'Telefòn',
    es: 'Teléfono'
  },
  'profile.profile_picture': {
    fr: 'Photo de profil',
    en: 'Profile picture',
    ht: 'Foto pwofil',
    es: 'Foto de perfil'
  },
  'profile.upload_picture': {
    fr: 'Télécharger une photo',
    en: 'Upload a picture',
    ht: 'Telechaje yon foto',
    es: 'Subir una foto'
  },
  'profile.save_changes': {
    fr: 'Enregistrer les modifications',
    en: 'Save changes',
    ht: 'Anrejistre chanjman yo',
    es: 'Guardar cambios'
  },
  'profile.updated': {
    fr: 'Profil mis à jour',
    en: 'Profile updated',
    ht: 'Pwofil aktyalize',
    es: 'Perfil actualizado'
  },
  'profile.updated_desc': {
    fr: 'Vos informations ont été mises à jour avec succès',
    en: 'Your information has been updated successfully',
    ht: 'Enfòmasyon ou yo te aktyalize avèk siksè',
    es: 'Su información se actualizó correctamente'
  },

  // Receipt Confirmation Dialog
  'receipt.credit_sent': {
    fr: 'Crédit envoyé !',
    en: 'Credit sent!',
    ht: 'Kredi voye!',
    es: '¡Crédito enviado!'
  },
  'receipt.payment_confirmed': {
    fr: 'Paiement confirmé !',
    en: 'Payment confirmed!',
    ht: 'Peman konfime!',
    es: '¡Pago confirmado!'
  },
  'receipt.did_you_receive': {
    fr: 'Avez-vous reçu',
    en: 'Did you receive',
    ht: 'Èske ou te resevwa',
    es: '¿Recibiste'
  },
  'receipt.on_phone': {
    fr: 'sur le',
    en: 'on',
    ht: 'sou',
    es: 'en el'
  },
  'receipt.payment_success_desc': {
    fr: 'Votre paiement de {amount} {currency} a été effectué avec succès.',
    en: 'Your payment of {amount} {currency} has been completed successfully.',
    ht: 'Peman ou a de {amount} {currency} te fèt avèk siksè.',
    es: 'Tu pago de {amount} {currency} se ha completado con éxito.'
  },
  'receipt.time_remaining': {
    fr: 'Temps restant :',
    en: 'Time remaining:',
    ht: 'Tan ki rete:',
    es: 'Tiempo restante:'
  },
  'receipt.important': {
    fr: 'Important',
    en: 'Important',
    ht: 'Enpòtan',
    es: 'Importante'
  },
  'receipt.auto_charge_warning': {
    fr: 'Après 3 minutes, votre carte sera automatiquement débitée (nous présumons que vous avez bien reçu le crédit).',
    en: 'After 3 minutes, your card will be automatically charged (we assume you received the credit).',
    ht: 'Apre 3 minit, kat ou ap otomatikman debite (nou sipoze ou te resevwa kredi a).',
    es: 'Después de 3 minutos, tu tarjeta será cargada automáticamente (asumimos que recibiste el crédito).'
  },
  'receipt.confirm_instruction': {
    fr: 'Si vous avez bien reçu le crédit, cliquez sur',
    en: 'If you received the credit, click',
    ht: 'Si ou te resevwa kredi a, klike sou',
    es: 'Si recibiste el crédito, haz clic en'
  },
  'receipt.yes_received': {
    fr: 'Oui, j\'ai reçu',
    en: 'Yes, I received it',
    ht: 'Wi, mwen resevwa li',
    es: 'Sí, lo recibí'
  },
  'receipt.no_not_received': {
    fr: 'Non, je n\'ai rien reçu',
    en: 'No, I didn\'t receive anything',
    ht: 'Non, mwen pa resevwa anyen',
    es: 'No, no recibí nada'
  },
  'receipt.report_problem': {
    fr: 'Signaler un problème',
    en: 'Report a problem',
    ht: 'Rapòte yon pwoblèm',
    es: 'Reportar un problema'
  },
  'receipt.explain_reason': {
    fr: 'Veuillez expliquer pourquoi vous n\'avez pas reçu le crédit.',
    en: 'Please explain why you didn\'t receive the credit.',
    ht: 'Tanpri eksplike poukisa ou pa t resevwa kredi a.',
    es: 'Por favor explica por qué no recibiste el crédito.'
  },
  'receipt.dispute_reason_label': {
    fr: 'Raison de la réclamation',
    en: 'Reason for dispute',
    ht: 'Rezon pou reklamasyon',
    es: 'Motivo de la reclamación'
  },
  'receipt.dispute_placeholder': {
    fr: 'Exemple : Aucun crédit reçu après 5 minutes, message d\'erreur affiché sur le téléphone...',
    en: 'Example: No credit received after 5 minutes, error message shown on phone...',
    ht: 'Egzanp: Pa resevwa kredi apre 5 minit, mesaj erè parèt sou telefòn...',
    es: 'Ejemplo: No recibí crédito después de 5 minutos, mensaje de error en el teléfono...'
  },
  'receipt.submit_dispute': {
    fr: 'Envoyer réclamation',
    en: 'Submit dispute',
    ht: 'Voye reklamasyon',
    es: 'Enviar reclamación'
  },
  'receipt.cancel': {
    fr: 'Annuler',
    en: 'Cancel',
    ht: 'Anile',
    es: 'Cancelar'
  },
  'receipt.close': {
    fr: 'Fermer',
    en: 'Close',
    ht: 'Fèmen',
    es: 'Cerrar'
  },
  'receipt.download_receipt': {
    fr: 'Télécharger le reçu',
    en: 'Download receipt',
    ht: 'Telechaje resi a',
    es: 'Descargar recibo'
  },
  'receipt.transaction_completed': {
    fr: 'Transaction terminée',
    en: 'Transaction completed',
    ht: 'Tranzaksyon fini',
    es: 'Transacción completada'
  },
  'receipt.card_charged': {
    fr: 'Votre carte a été débitée de {amount} {currency}. Vous pouvez télécharger votre reçu ci-dessous.',
    en: 'Your card has been charged {amount} {currency}. You can download your receipt below.',
    ht: 'Kat ou te debite {amount} {currency}. Ou ka telechaje resi ou anba a.',
    es: 'Tu tarjeta ha sido cargada {amount} {currency}. Puedes descargar tu recibo abajo.'
  },
  'receipt.processing': {
    fr: 'Traitement...',
    en: 'Processing...',
    ht: 'Ap trete...',
    es: 'Procesando...'
  },
  'receipt.sending': {
    fr: 'Envoi...',
    en: 'Sending...',
    ht: 'Ap voye...',
    es: 'Enviando...'
  },
  'receipt.payment_completed_toast': {
    fr: 'Paiement effectué',
    en: 'Payment completed',
    ht: 'Peman fèt',
    es: 'Pago completado'
  },
  'receipt.payment_success_message': {
    fr: 'Merci ! Votre carte a été débitée avec succès.',
    en: 'Thank you! Your card has been charged successfully.',
    ht: 'Mèsi! Kat ou te debite avèk siksè.',
    es: '¡Gracias! Tu tarjeta ha sido cargada con éxito.'
  },
  'receipt.dispute_registered_toast': {
    fr: 'Réclamation enregistrée',
    en: 'Dispute registered',
    ht: 'Reklamasyon anrejistre',
    es: 'Reclamación registrada'
  },
  'receipt.dispute_message': {
    fr: 'Notre équipe va enquêter. Vous ne serez pas débité.',
    en: 'Our team will investigate. You will not be charged.',
    ht: 'Ekip nou ap chèche. Ou pa pral debite.',
    es: 'Nuestro equipo investigará. No se te cobrará.'
  },
  'receipt.error': {
    fr: 'Erreur',
    en: 'Error',
    ht: 'Erè',
    es: 'Error'
  },
  'receipt.confirm_error': {
    fr: 'Impossible de confirmer la réception.',
    en: 'Unable to confirm receipt.',
    ht: 'Enposib konfime resepsyon.',
    es: 'No se pudo confirmar la recepción.'
  },
  'receipt.dispute_error': {
    fr: 'Impossible d\'enregistrer la réclamation.',
    en: 'Unable to register dispute.',
    ht: 'Enposib anrejistre reklamasyon.',
    es: 'No se pudo registrar la reclamación.'
  },
  'receipt.reason_required_toast': {
    fr: 'Raison requise',
    en: 'Reason required',
    ht: 'Rezon obligatwa',
    es: 'Motivo requerido'
  },
  'receipt.reason_required_message': {
    fr: 'Veuillez expliquer pourquoi vous n\'avez pas reçu le crédit.',
    en: 'Please explain why you didn\'t receive the credit.',
    ht: 'Tanpri eksplike poukisa ou pa resevwa kredi a.',
    es: 'Por favor explica por qué no recibiste el crédito.'
  },
  'receipt.downloaded_toast': {
    fr: 'Reçu téléchargé',
    en: 'Receipt downloaded',
    ht: 'Resi telechaje',
    es: 'Recibo descargado'
  },
  'receipt.downloaded_message': {
    fr: 'Le reçu a été téléchargé avec succès',
    en: 'The receipt has been downloaded successfully',
    ht: 'Resi a te telechaje avèk siksè',
    es: 'El recibo se ha descargado con éxito'
  },
  'receipt.receipt_downloaded': {
    fr: 'Reçu téléchargé',
    en: 'Receipt downloaded',
    ht: 'Resi telechaje',
    es: 'Recibo descargado'
  },
  'receipt.receipt_saved': {
    fr: 'Le reçu a été enregistré sur votre appareil',
    en: 'The receipt has been saved to your device',
    ht: 'Resi a anrejistre sou aparèy ou an',
    es: 'El recibo se ha guardado en su dispositivo'
  },

  // Payment Form
  'payment.payment_information': {
    fr: 'Informations de paiement',
    en: 'Payment information',
    ht: 'Enfòmasyon peman',
    es: 'Información de pago'
  },
  'payment.number': {
    fr: 'Numéro',
    en: 'Number',
    ht: 'Nimewo',
    es: 'Número'
  },
  'payment.operator': {
    fr: 'Opérateur',
    en: 'Operator',
    ht: 'Operatè',
    es: 'Operador'
  },
  'payment.recharge_amount': {
    fr: 'Montant de la recharge',
    en: 'Top-up amount',
    ht: 'Montan rechaj',
    es: 'Monto de recarga'
  },
  'payment.commission': {
    fr: 'Frais',
    en: 'Fee',
    ht: 'Frè',
    es: 'Tarifa'
  },
  'payment.total_to_pay': {
    fr: 'Total à payer',
    en: 'Total to pay',
    ht: 'Total pou peye',
    es: 'Total a pagar'
  },
  'payment.processing': {
    fr: 'Traitement en cours...',
    en: 'Processing...',
    ht: 'Ap trete...',
    es: 'Procesando...'
  },
  'payment.pay_button': {
    fr: 'Payer',
    en: 'Pay',
    ht: 'Peye',
    es: 'Pagar'
  },
  'payment.form_validation_error': {
    fr: 'Erreur lors du validation du formulaire',
    en: 'Form validation error',
    ht: 'Erè nan validasyon fòm nan',
    es: 'Error de validación del formulario'
  },
  'payment.payment_error': {
    fr: 'Erreur lors du paiement',
    en: 'Payment error',
    ht: 'Erè nan peman',
    es: 'Error de pago'
  },
  'payment.secure_ssl': {
    fr: 'Paiement sécurisé SSL',
    en: 'SSL Secure Payment',
    ht: 'Peman sekirize SSL',
    es: 'Pago seguro SSL'
  },
  'payment.pci_compliant': {
    fr: 'PCI-DSS Conforme',
    en: 'PCI-DSS Compliant',
    ht: 'PCI-DSS Konfòm',
    es: 'PCI-DSS Conforme'
  },
  'payment.stripe_certified': {
    fr: 'Stripe Certifié',
    en: 'Stripe Certified',
    ht: 'Stripe Sètifye',
    es: 'Stripe Certificado'
  },
  'payment.bank_info_protected': {
    fr: 'Vos informations bancaires sont protégées',
    en: 'Your banking information is protected',
    ht: 'Enfòmasyon bank ou yo pwoteje',
    es: 'Su información bancaria está protegida'
  },
  'payment.stripe_security_message': {
    fr: 'Nous n\'avons jamais accès à vos données de carte. Elles sont directement traitées par Stripe, leader mondial de la sécurité des paiements.',
    en: 'We never have access to your card data. They are processed directly by Stripe, the global leader in payment security.',
    ht: 'Nou pa janm gen aksè a done kat ou. Yo trete direkteman pa Stripe, lidè mondyal sekirite peman.',
    es: 'Nunca tenemos acceso a sus datos de tarjeta. Son procesados directamente por Stripe, líder mundial en seguridad de pagos.'
  },
  'payment.secured': {
    fr: 'Sécurisé',
    en: 'Secured',
    ht: 'Sekirize',
    es: 'Seguro'
  },
  'payment.card_number': {
    fr: 'Numéro de carte bancaire',
    en: 'Card number',
    ht: 'Nimewo kat bank',
    es: 'Número de tarjeta'
  },
  'payment.card_number_helper': {
    fr: 'Entrez votre numéro de carte à 16 chiffres',
    en: 'Enter your 16-digit card number',
    ht: 'Antre nimewo kat ou a 16 chif',
    es: 'Ingrese su número de tarjeta de 16 dígitos'
  },
  'payment.expiry_date': {
    fr: 'Date d\'expiration',
    en: 'Expiry date',
    ht: 'Dat ekspirasyon',
    es: 'Fecha de vencimiento'
  },
  'payment.expiry_helper': {
    fr: 'MM/AA',
    en: 'MM/YY',
    ht: 'MM/AA',
    es: 'MM/AA'
  },
  'payment.cvv_code': {
    fr: 'Code CVV',
    en: 'CVV code',
    ht: 'Kòd CVV',
    es: 'Código CVV'
  },
  'payment.cvv_helper': {
    fr: '3 chiffres au dos',
    en: '3 digits on back',
    ht: '3 chif dèyè',
    es: '3 dígitos en el reverso'
  },

  // Payment Success
  'payment_success.invalid_session': {
    fr: 'Session invalide',
    en: 'Invalid session',
    ht: 'Sesyon envalid',
    es: 'Sesión inválida'
  },
  'payment_success.payment_unconfirmed': {
    fr: 'Paiement non confirmé',
    en: 'Payment not confirmed',
    ht: 'Peman pa konfime',
    es: 'Pago no confirmado'
  },
  'payment_success.processing_error': {
    fr: 'Erreur lors du traitement du paiement',
    en: 'Error processing payment',
    ht: 'Erè nan tretman peman',
    es: 'Error al procesar el pago'
  },
  'payment_success.processing_payment': {
    fr: 'Traitement du paiement...',
    en: 'Processing payment...',
    ht: 'Tretman peman...',
    es: 'Procesando pago...'
  },
  'payment_success.please_wait': {
    fr: 'Veuillez patienter',
    en: 'Please wait',
    ht: 'Tanpri tann',
    es: 'Por favor espere'
  },
  'payment_success.error': {
    fr: 'Erreur',
    en: 'Error',
    ht: 'Erè',
    es: 'Error'
  },
  'payment_success.back_to_recharge': {
    fr: 'Retour à la recharge',
    en: 'Back to recharge',
    ht: 'Retounen nan rechaj',
    es: 'Volver a la recarga'
  },
  'payment_success.payment_successful': {
    fr: 'Paiement réussi !',
    en: 'Payment successful!',
    ht: 'Peman reyisi!',
    es: '¡Pago exitoso!'
  },
  'payment_success.recharge_successful': {
    fr: 'Votre recharge a été effectuée avec succès',
    en: 'Your recharge was completed successfully',
    ht: 'Rechaj ou a fèt avèk siksè',
    es: 'Su recarga se completó con éxito'
  },
  'payment_success.phone_number': {
    fr: 'Numéro',
    en: 'Number',
    ht: 'Nimewo',
    es: 'Número'
  },
  'payment_success.amount': {
    fr: 'Montant',
    en: 'Amount',
    ht: 'Montan',
    es: 'Monto'
  },
  'payment_success.fees': {
    fr: 'Frais',
    en: 'Fees',
    ht: 'Frè',
    es: 'Tarifas'
  },
  'payment_success.total_paid': {
    fr: 'Total payé',
    en: 'Total paid',
    ht: 'Total peye',
    es: 'Total pagado'
  },
  'payment_success.download_receipt': {
    fr: 'Télécharger reçu',
    en: 'Download receipt',
    ht: 'Telechaje resi',
    es: 'Descargar recibo'
  },
  'payment_success.home': {
    fr: 'Accueil',
    en: 'Home',
    ht: 'Akèy',
    es: 'Inicio'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    // ✅ CHANGED DEFAULT TO 'en'
    return (saved as Language) || 'en'; 
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

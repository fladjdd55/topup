TapTopLoad - Plateforme de Recharge Mobile
📱 Vue d'ensemble
TapTopLoad est une plateforme globale de recharge mobile permettant d'envoyer du crédit téléphonique vers des mobiles partout dans le monde. La plateforme supporte les transactions authentifiées et invitées, offrant des recharges instantanées avec suivi en temps réel.

Fonctionnalités principales
🌍 Support multi-pays : Haiti, États-Unis, Canada, République Dominicaine, Jamaïque, Mexique, Brésil, et 160+ pays
💳 Paiement Stripe : Traitement sécurisé des paiements par carte (montant + commission 3%)
📡 API DTone : Recharges mobiles internationales vers 200+ opérateurs
💱 Multi-devises : HTG, USD, CAD, DOP, JMD, MXN, EUR, GBP, BRL
🔄 Recharges récurrentes : Abonnements automatiques hebdomadaires/mensuels
<!-- 🎁 Programme de fidélité : 4 paliers (Bronze/Silver/Gold/Platinum) avec cashback -->
⚡ Temps réel : Mises à jour instantanées via WebSocket
🌐 Multilingue : Français, Anglais, Créole haïtien, Espagnol
💬 WhatsApp Bot : Support client 24/7 avec IA conversationnelle
👤 Checkout invité : Recharges jusqu'à $300 sans compte
🛡️ Dashboard Admin : Gestion complète et monitoring en temps réel
💰 Flux de Paiement - Comment Recevoir l'Argent
✅ Le système est déjà configuré correctement !
Le code gère automatiquement le flux financier pour que tout l'argent aille sur votre compte bancaire :

1. Client paie le montant total
Recharge de $10.00
+ Commission 3% ($0.30)
= Total facturé: $10.30
Le code dans server/routes.ts (ligne 469) :

const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(totalAmount * 100), // totalAmount = montant + commission
  currency: 'usd',
  // ...
});
2. Stripe capture le paiement
Stripe reçoit les $10.30 complets
Le client est débité immédiatement
Le paiement est sécurisé par Stripe
3. Transfert automatique vers votre compte bancaire
Stripe transfère l'argent vers votre compte bancaire connecté
Fréquence configurable dans Dashboard Stripe :
Quotidien (par défaut)
Hebdomadaire
Mensuel
Vous recevez : $10.30 - frais Stripe (~$0.33) = ~$9.97
4. DTone effectue la recharge
Le montant de base ($10) est utilisé pour la recharge mobile
DTone déduit $10 de votre crédit revendeur
Le mobile reçoit la recharge instantanément
5. Votre profit net
Total reçu:        $10.30
- Frais Stripe:    ~$0.33 (2.9% + $0.30)
- Coût DTone:      $10.00
= Profit net:      ~-$0.03 (dans cet exemple)
Note : Pour être rentable, vous devez acheter votre crédit DTone avec une remise (ex: 5-10% de remise) ou augmenter la commission au-delà de 3%.

Configuration requise
Compte Stripe (obligatoire)
Créer un compte Stripe en mode production
Connecter votre compte bancaire :
Dashboard Stripe → Settings → Bank accounts and scheduling
Ajouter votre compte bancaire (IBAN ou numéro de compte)
Configurer la fréquence de transfert
Obtenir vos clés API :
STRIPE_SECRET_KEY (sk_live_...)
STRIPE_PUBLISHABLE_KEY (pk_live_...)
Compte DTone (obligatoire)
S'inscrire comme revendeur DTone
Obtenir :
DTONE_API_KEY
DTONE_API_SECRET
Charger votre compte en crédit
Le solde est visible dans le dashboard admin
🚀 Installation
Prérequis
Node.js 18 ou supérieur
PostgreSQL (local ou Neon)
Compte Stripe en mode production
Compte DTone revendeur
Compte bancaire connecté à Stripe
Étapes d'installation
1. Cloner et installer
git clone <votre-repo>
cd taptopload
npm install
2. Configuration des variables d'environnement
Créer un fichier .env à la racine :

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/taptopload
PGHOST=localhost
PGPORT=5432
PGUSER=votre_user
PGPASSWORD=votre_password
PGDATABASE=taptopload
# Stripe (CRITIQUE - Pour recevoir les paiements)
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique_production
# DTone API (Pour effectuer les recharges)
DTONE_API_KEY=votre_cle_dtone
DTONE_API_SECRET=votre_secret_dtone
# Session (Générer une clé aléatoire complexe)
SESSION_SECRET=votre_secret_aleatoire_tres_long_et_complexe
# Email (SMTP - Gmail par exemple)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre@email.com
EMAIL_PASS=votre_mot_de_passe_application_gmail
EMAIL_FROM=noreply@taptopload.com
# WhatsApp Business (Meta - Optionnel)
WHATSAPP_ACCESS_TOKEN=votre_token_meta
WHATSAPP_PHONE_NUMBER_ID=votre_phone_id
WHATSAPP_VERIFY_TOKEN=votre_verify_token
# OAuth Social Login (Optionnel)
BOOK_APP_ID=votre_facebook_app_id
FACEBOOK_APP_SECRET=votre_facebook_app_secret
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
TWITTER_API_KEY=votre_twitter_api_key
TWITTER_API_SECRET=votre_twitter_api_secret
3. Initialiser la base de données
# Créer la base de données PostgreSQL
createdb taptopload
# Pousser le schéma vers la base
npm run db:push
4. Créer le compte administrateur
Exécuter cette commande SQL dans votre base de données :

INSERT INTO users (email, password, role, first_name, last_name, created_at, updated_at)
VALUES (
  'admin@taptopload.com',
  '$2b$10$XOdnmveo4IK6T0aaM/dMQ.jQBq12cWstj7Mg6omoOYAwY/dpEKk0q',
  'admin',
  'Admin',
  'TapTopLoad',
  NOW(),
  NOW()
);
Identifiants :

Email : admin@taptopload.com
Mot de passe : taptopload123
5. Démarrer l'application
# Mode développement
npm run dev
L'application sera disponible sur : http://localhost:5000

6. Accéder au dashboard admin
Ouvrir http://localhost:5000
Cliquer sur "Connexion"
Utiliser les identifiants admin ci-dessus
Vous serez automatiquement redirigé vers /dashboard/admin
📊 Architecture Technique
Stack Frontend
React 18 + TypeScript - Framework UI moderne
Vite - Build tool ultra-rapide
Wouter - Routing léger
TanStack Query v5 - Gestion d'état serveur et cache
Shadcn/ui + Radix UI - Composants accessibles
Tailwind CSS - Styling utility-first
Recharts - Graphiques et analytics
Stripe Elements - UI de paiement sécurisée
Stack Backend
Express.js + TypeScript - Serveur API REST
PostgreSQL - Base de données relationnelle
Drizzle ORM - ORM type-safe
Passport.js - Authentification OAuth
WebSocket (ws) - Communication temps réel
Bcrypt - Hachage de mots de passe
Nodemailer - Envoi d'emails
Services Externes
Paiements
Stripe (v2025-09-30.clover) - Traitement des paiements
Payment Intents pour transactions sécurisées
Saved payment methods pour recharges récurrentes
Webhooks pour confirmations asynchrones
Recharges Mobiles
DTone API - Recharges internationales
200+ opérateurs mobiles
Mode simulation pour développement
Environnements production et preprod
Communications
Twilio - Notifications SMS
WhatsApp Business API - Bot conversationnel IA
Nodemailer - Emails transactionnels
🔐 Sécurité
Authentification
Bcrypt : Hachage des mots de passe (10 rounds)
JWT : Tokens pour l'API
Sessions : Stockage sécurisé dans PostgreSQL
OAuth 2.0 : Facebook, Google, Twitter
Autorisation
Rôles : user, admin, super_admin
Middleware : Protection des routes admin
CORS : Configuration sécurisée
Paiements
PCI Compliant : Via Stripe Elements
3D Secure : Support automatique
Webhooks : Signature verification
👨‍💼 Dashboard Admin
Interface d'administration complète et sécurisée.

Accès
URL : /dashboard/admin
Authentification : Compte admin requis
Redirection : Automatique après connexion
Fonctionnalités
1. Statistiques Globales (4 cartes)
Crédits DTone

Solde en temps réel de votre compte revendeur
Mise à jour automatique toutes les 60 secondes
Affichage en USD avec horodatage
Utilisateurs

Nombre total d'utilisateurs inscrits
Comptage depuis la base de données
Revenu Total

Somme de tous les montants rechargés
Commission 3% incluse
Exemple : 9 transactions × ~$29 = $265
Transactions

Nombre total de transactions
Taux de succès en pourcentage
Exemple : 6 réussies / 9 total = 67%
2. Gestion des Utilisateurs
Fonctionnalités

Liste complète avec détails (nom, email, téléphone, rôle, date d'inscription)
Recherche en temps réel par email, téléphone, nom
Suppression d'utilisateurs non-admin
Protection : impossible de supprimer admins ou soi-même
Endpoints

GET /api/admin/users - Liste
DELETE /api/admin/users/:id - Suppression
3. Monitoring des Transactions
Vue

Jusqu'à 1000 dernières transactions
Recherche par numéro de téléphone ou ID transaction
Colonnes : ID, Numéro, Montant, Commission, Statut, Date
Statuts

En attente (pending)
En cours (processing)
Terminée (completed)
Échouée (failed)
Annulée (cancelled)
Endpoint

GET /api/admin/transactions
4. Balance DTone
Affichage

Solde disponible en USD
Dernière mise à jour (timestamp)
Auto-refresh toutes les 60 secondes
Endpoint

GET /api/admin/dtone/balance
Interface Simplifiée
Les administrateurs voient uniquement :

✅ Administration (section principale)
✅ Profil (sous Compte)
✅ Paramètres (sous Compte)
Sections masquées pour les admins :

❌ Recharge
❌ Favoris
❌ Demandes
❌ Recharges récurrentes
❌ Historique
📱 API Endpoints
Authentification
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion
POST   /api/auth/logout            Déconnexion
GET    /api/auth/me                Utilisateur actuel
POST   /api/auth/forgot-password   Demande reset
POST   /api/auth/reset-password    Reset mot de passe
Recharges
POST   /api/stripe/create-payment-intent    Créer paiement
POST   /api/recharge/execute                Exécuter recharge
Transactions
GET    /api/transactions           Historique utilisateur
GET    /api/dashboard/stats        Statistiques utilisateur
GET    /api/dashboard/graph-data   Données graphiques
Demandes de Recharge
GET    /api/recharge-requests                    Liste
POST   /api/recharge-requests                    Créer
GET    /api/recharge-requests/code/:code         Par code
PATCH  /api/recharge-requests/:id                Mettre à jour
DELETE /api/recharge-requests/:id                Supprimer
GET    /api/recharge-requests/count              Compteur
Admin (🔒 Admin seulement)
GET    /api/admin/stats              Statistiques globales
GET    /api/admin/users              Liste utilisateurs
DELETE /api/admin/users/:id          Supprimer utilisateur
GET    /api/admin/transactions       Toutes transactions
GET    /api/admin/dtone/balance      Solde DTone
Favoris
GET    /api/favorites                Liste
POST   /api/favorites                Créer
DELETE /api/favorites/:id            Supprimer
Recharges Récurrentes
GET    /api/recurring-recharges      Liste
POST   /api/recurring-recharges      Créer
PATCH  /api/recurring-recharges/:id  Mettre à jour
DELETE /api/recurring-recharges/:id  Supprimer
Programme de Fidélité
GET    /api/loyalty                  Points et palier
🌐 Internationalisation
Langues supportées
🇫🇷 Français (par défaut)
🇬🇧 Anglais
🇭🇹 Créole haïtien
🇪🇸 Espagnol
Fonctionnalités traduites
Interface utilisateur complète
Messages de validation
Notifications et toasts
Emails (réinitialisation mot de passe)
Bot WhatsApp
💬 WhatsApp Bot
Bot conversationnel avec IA pour support client 24/7.

Capacités
Multi-langue : Détection automatique (FR/EN/HT/ES)
Menu interactif : Navigation par options 1-5
Recharges guidées : Liens pré-remplis
Suivi transactions : Statut en temps réel
FAQ automatique : Réponses instantanées
Handoff humain : Transfert vers agent si besoin
Commandes
1 - Effectuer une recharge
2 - Suivre une transaction
3 - FAQ
4 - Contact support
5 - Changer de langue
🌍 - Menu langues
Configuration
WHATSAPP_VERIFY_TOKEN=votre_token_verification
WHATSAPP_ACCESS_TOKEN=token_permanent_meta
WHATSAPP_PHONE_NUMBER_ID=id_numero_whatsapp_business
🔧 Scripts NPM
# Développement
npm run dev              # Démarrer serveur dev (http://localhost:5000)
# Build
npm run build            # Build production
# Base de données
npm run db:push          # Synchroniser schéma
npm run db:generate      # Générer migration
npm run db:migrate       # Exécuter migrations
npm run db:studio        # Interface Drizzle Studio
# Qualité code
npm run typecheck        # Vérifier types TypeScript
📈 Calcul de Rentabilité
Exemple de transaction
Client paie
Recharge: $10.00
Commission: $0.30 (3%)
Total: $10.30
Vous recevez (via Stripe)
Paiement Stripe: $10.30
- Frais Stripe: -$0.33 (2.9% + $0.30)
= Net reçu: $9.97
Coût DTone
Recharge mobile: $10.00
- Remise DTone: -$0.50 (5% remise exemple)
= Coût réel: $9.50
Profit net
Reçu: $9.97
- Coût: $9.50
= Profit: $0.47 (4.7% marge)
Conseils de rentabilité
Négocier remise DTone : 5-10% minimum
Augmenter commission : 4-5% au lieu de 3%
Volume : Plus de transactions = meilleure marge
Recharges récurrentes : Revenus prévisibles
📝 Notes Importantes
Stripe
Mode production obligatoire pour recevoir l'argent réel
Compte bancaire doit être connecté et vérifié
Transferts : Quotidien par défaut (configurable)
Frais : ~2.9% + $0.30 par transaction (varie selon pays)
DTone
Crédit prépayé : Charger votre compte avant de commencer
Solde visible : Dashboard admin en temps réel
Remise : Négocier avec votre account manager DTone
Simulation : Mode test disponible pour développement
Commission
Taux actuel : 3% (configurable dans le code)
Modification : Fichier server/routes.ts fonction calculateCommission
Recommandation : 4-5% pour rentabilité optimale
🆘 Support & Contact
Email : support@taptopload.com
WhatsApp : Bot intégré dans l'application
Dashboard : Section Contact
📄 Licence
Propriétaire - Tous droits réservés © 2025 TapTopLoad

TapTopLoad - Recharges mobiles instantanées partout dans le monde 🌍⚡# topup
# topup

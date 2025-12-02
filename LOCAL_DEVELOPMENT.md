# 💻 Guide de Développement Local - TapTopLoad

## 🎯 Configuration pour développer en local

Ce guide est pour travailler sur **votre ordinateur personnel** avec PostgreSQL local.

**🪟 Utilisateurs Windows** : Consultez **WINDOWS_SETUP.md** pour un guide complet spécifique à Windows !

---

## 📋 Prérequis

- **Node.js 20+** : https://nodejs.org/
- **PostgreSQL 14+** : https://www.postgresql.org/download/
- **Git** : https://git-scm.com/
- **Un éditeur** : VS Code, WebStorm, etc.

---

## 🚀 Installation

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/votre-username/taptopload.git
cd taptopload
```

### 2️⃣ Installer PostgreSQL

**Sur macOS** :
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Sur Ubuntu/Debian** :
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Sur Windows** :
- Téléchargez depuis : https://www.postgresql.org/download/windows/
- Lancez l'installateur
- Notez le mot de passe que vous créez pour l'utilisateur `postgres`

### 3️⃣ Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Dans psql, exécuter :
CREATE USER taptop_user WITH PASSWORD 'taptop_dev_2025';
CREATE DATABASE taptopload OWNER taptop_user;
GRANT ALL PRIVILEGES ON DATABASE taptopload TO taptop_user;

# Quitter psql
\q
```

**Sur Windows** :
```cmd
psql -U postgres
# Puis exécuter les mêmes commandes CREATE USER, CREATE DATABASE, etc.
```

### 4️⃣ Installer les dépendances Node.js

```bash
npm install
```

### 5️⃣ Configuration des variables d'environnement

**Créez un fichier `.env.local`** à la racine du projet :

```bash
cp .env.local.example .env.local
```

**Éditez `.env.local`** avec vos vraies valeurs :

```bash
# Base de données locale
DATABASE_URL=postgresql://taptop_user:taptop_dev_2025@localhost:5432/taptopload
PGHOST=localhost
PGDATABASE=taptopload
PGUSER=taptop_user
PGPASSWORD=taptop_dev_2025
PGPORT=5432

# Session (gardez celui-ci pour le dev)
SESSION_SECRET=dev-secret-key-min-32-characters-change-in-prod

# Stripe TEST (pas les clés live!)
STRIPE_SECRET_KEY=sk_test_votre_cle_test
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_test

# DTone TEST
DTONE_API_KEY=votre_cle_test
DTONE_API_SECRET=votre_secret_test

# Email (utilisez Gmail ou Mailtrap pour les tests)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
EMAIL_FROM=noreply-dev@taptopload.com

# WhatsApp TEST
WHATSAPP_VERIFY_TOKEN=mon_token_dev_123
WHATSAPP_ACCESS_TOKEN=votre_token_meta_test
WHATSAPP_PHONE_NUMBER_ID=votre_phone_id_test

# Environnement
NODE_ENV=development
```

### 6️⃣ Créer les tables dans la base de données

```bash
npm run db:push
```

Cette commande crée toutes les tables selon le schéma défini dans `shared/schema.ts`.

### 7️⃣ Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur : **http://localhost:5000**

---

## 🔧 Commandes Utiles

### Développement

```bash
# Lancer en mode développement
npm run dev

# Build pour production (test local)
npm run build

# Lancer la version buildée
npm start
```

### Base de données

```bash
# Synchroniser le schéma (crée/modifie les tables)
npm run db:push

# Forcer la synchronisation si erreurs
npm run db:push --force

# Studio Drizzle (interface visuelle)
npx drizzle-kit studio
```

### Tests

```bash
# Se connecter à PostgreSQL
psql -U taptop_user -d taptopload -h localhost

# Voir les tables
\dt

# Voir les données d'une table
SELECT * FROM users;

# Quitter
\q
```

---

## 🌐 Configuration ngrok (pour WhatsApp)

Pour tester WhatsApp en local, vous devez exposer votre serveur :

### 1️⃣ Installer ngrok

```bash
# macOS
brew install ngrok

# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin

# Windows
# Télécharger depuis https://ngrok.com/download
```

### 2️⃣ Créer un compte ngrok (gratuit)

https://dashboard.ngrok.com/signup

### 3️⃣ Authentifier ngrok

```bash
ngrok config add-authtoken votre_token_ngrok
```

### 4️⃣ Exposer votre serveur local

**Terminal 1** - Lancer l'app :
```bash
npm run dev
```

**Terminal 2** - Lancer ngrok :
```bash
ngrok http 5000
```

Vous verrez :
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:5000
```

### 5️⃣ Configurer le webhook WhatsApp

Dans Meta for Developers :
```
Callback URL: https://abc123.ngrok-free.app/api/whatsapp/webhook
Verify Token: [celui dans votre .env.local]
```

⚠️ **Important** : L'URL ngrok change à chaque redémarrage (version gratuite)

---

## 📁 Structure du Projet

```
taptopload/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Pages de l'app
│   │   ├── components/ # Composants réutilisables
│   │   ├── lib/        # Utilitaires
│   │   └── hooks/      # React hooks
│   └── index.html
├── server/              # Backend Express
│   ├── index.ts        # Point d'entrée
│   ├── routes.ts       # Routes API
│   ├── db.ts           # Configuration DB
│   ├── auth.ts         # Authentification
│   ├── whatsappBot.ts  # Bot WhatsApp
│   └── whatsappMeta.ts # API WhatsApp
├── shared/              # Code partagé
│   ├── schema.ts       # Schéma DB (Drizzle)
│   ├── phoneValidation.ts
│   └── currencyUtils.ts
├── .env.local          # Variables locales (à créer)
├── .env.example        # Template production
└── package.json
```

---

## 🐛 Dépannage

### Erreur : "DATABASE_URL must be set"

**Solution** : Créez le fichier `.env.local` avec la variable `DATABASE_URL`

### Erreur : "password authentication failed"

**Solutions** :
1. Vérifiez le mot de passe dans `.env.local`
2. Recréez l'utilisateur PostgreSQL :
   ```bash
   sudo -u postgres psql
   DROP USER IF EXISTS taptop_user;
   CREATE USER taptop_user WITH PASSWORD 'taptop_dev_2025';
   ```

### Erreur : "database taptopload does not exist"

**Solution** :
```bash
sudo -u postgres psql
CREATE DATABASE taptopload OWNER taptop_user;
```

### Erreur : "Port 5000 already in use"

**Solutions** :
1. Trouvez et tuez le processus :
   ```bash
   # macOS/Linux
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID [PID] /F
   ```

2. Ou changez le port dans `server/index.ts`

### L'application ne se connecte pas à la DB

**Vérifiez** :
```bash
# PostgreSQL fonctionne ?
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Connexion manuelle marche ?
psql -U taptop_user -d taptopload -h localhost
```

### Ngrok : "ERR_NGROK_108"

**Solution** : Votre token ngrok n'est pas configuré
```bash
ngrok config add-authtoken votre_token
```

---

## 🔄 Workflow de Développement

### 1. Modifier le code
Éditez les fichiers dans `client/` ou `server/`

### 2. Hot reload automatique
L'application se recharge automatiquement (Vite HMR)

### 3. Tester
Ouvrez http://localhost:5000 dans votre navigateur

### 4. Modifier le schéma DB
1. Éditez `shared/schema.ts`
2. Lancez `npm run db:push`
3. Les tables sont mises à jour automatiquement

### 5. Commit
```bash
git add .
git commit -m "feat: ajout de ..."
git push
```

---

## 🎨 Développement Frontend

### Ajouter une nouvelle page

1. Créez le fichier dans `client/src/pages/`
2. Ajoutez la route dans `client/src/App.tsx`

### Utiliser un composant shadcn

```bash
# Les composants sont déjà installés dans client/src/components/ui/
# Importez-les directement :
import { Button } from '@/components/ui/button';
```

### Ajouter une nouvelle icône

```typescript
import { IconName } from 'lucide-react';
```

Catalogue : https://lucide.dev/icons/

---

## 🗄️ Développement Backend

### Ajouter une route API

Éditez `server/routes.ts` :

```typescript
app.get('/api/mon-endpoint', async (req, res) => {
  // Votre code
});
```

### Requête à la base de données

```typescript
import { db } from './db';
import { users } from '@shared/schema';

// SELECT
const allUsers = await db.select().from(users);

// INSERT
const newUser = await db.insert(users).values({
  email: 'test@example.com',
  // ...
}).returning();

// UPDATE
await db.update(users)
  .set({ firstName: 'John' })
  .where(eq(users.id, 1));
```

---

## 🧪 Tests

### Tester une API avec curl

```bash
# GET
curl http://localhost:5000/api/countries

# POST
curl -X POST http://localhost:5000/api/recharge \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+50938123456","amount":500}'
```

### Tester WhatsApp localement

1. Lancez ngrok : `ngrok http 5000`
2. Configurez le webhook dans Meta avec l'URL ngrok
3. Envoyez un message WhatsApp au numéro de test
4. Vérifiez les logs dans votre console

---

## 📊 Outils de Debug

### Logs serveur
Les logs apparaissent dans la console où vous avez lancé `npm run dev`

### Logs WhatsApp
Cherchez dans la console :
```
📱 WhatsApp message received from:
✅ WhatsApp message sent successfully:
```

### Drizzle Studio (interface DB)
```bash
npx drizzle-kit studio
```
Ouvrez : https://local.drizzle.studio/

### PostgreSQL GUI
Utilisez **pgAdmin** ou **DBeaver** pour une interface graphique

---

## 🌍 Variables d'Environnement : Local vs Production

| Variable | Local (.env.local) | Taptopload (Secrets) | Production (.env) |
|----------|-------------------|------------------|-------------------|
| DATABASE_URL | localhost:5432 | neon.tech | votre-serveur |
| NODE_ENV | development | development | production |
| STRIPE_KEY | sk_test_... | sk_test_... | sk_live_... |
| EMAIL | dev@test.com | test@taptopload.com | real@prod.com |

---

## ✅ Checklist Développement Local

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `taptopload` créée
- [ ] Utilisateur `taptop_user` créé
- [ ] Fichier `.env.local` configuré
- [ ] Dépendances installées (`npm install`)
- [ ] Migrations exécutées (`npm run db:push`)
- [ ] Application lance sans erreur (`npm run dev`)
- [ ] Page d'accueil accessible (http://localhost:5000)
- [ ] ngrok configuré (si test WhatsApp)

---

**Prêt à coder ! 🚀**

Pour plus d'infos :
- Configuration production → `DEPLOYMENT_GUIDE.md`
- Configuration WhatsApp → `WHATSAPP_CREATION_GUIDE.md`
- Variables globales → `CONFIGURATION_GUIDE.md`

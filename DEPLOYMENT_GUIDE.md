# 🚀 Guide de Déploiement - TapTopLoad

## 📋 Vue d'ensemble

Ce guide explique comment déployer TapTopLoad sur votre propre infrastructure (VPS, cloud, etc.)

**Architecture** :
- **Développement local** : PostgreSQL local (localhost)
- **Production** : Votre propre serveur avec PostgreSQL

---

## 🏗️ Options de Déploiement

### Option 1 : VPS (DigitalOcean, Linode, etc.) ⭐ RECOMMANDÉ

**Avantages** :
- ✅ Contrôle total
- ✅ Économique (~$5-10/mois)
- ✅ Performances prévisibles

**Serveur recommandé** :
- 2 GB RAM minimum
- 1 vCPU
- 50 GB SSD
- Ubuntu 22.04 LTS

### Option 2 : Cloud Platform (AWS, GCP, Azure)

**Avantages** :
- ✅ Scalabilité automatique
- ✅ Services managés
- ⚠️ Plus coûteux

### Option 3 : Platform-as-a-Service (Render, Railway, Fly.io)

**Avantages** :
- ✅ Déploiement ultra-simple
- ✅ PostgreSQL inclus
- ⚠️ Limitations en version gratuite

---

## 🗄️ Configuration de la Base de Données

### A. PostgreSQL en Production

**Installation sur Ubuntu** :

```bash
# Installer PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Créer utilisateur et base de données
sudo -u postgres psql

# Dans psql :
CREATE USER taptop_prod WITH PASSWORD 'votre_mot_de_passe_securise';
CREATE DATABASE taptopload_prod;
GRANT ALL PRIVILEGES ON DATABASE taptopload_prod TO taptop_prod;
\q
```

**Configuration PostgreSQL managé** (DigitalOcean, AWS RDS, etc.) :

1. Créez une instance PostgreSQL 14+
2. Notez les informations de connexion
3. Configurez le firewall pour autoriser votre serveur
4. Activez SSL si disponible

### B. Variables d'Environnement Production

Créez un fichier `.env` sur votre serveur :

```bash
# Base de données
DATABASE_URL=postgresql://taptop_prod:password@localhost:5432/taptopload_prod
PGHOST=localhost
PGDATABASE=taptopload_prod
PGUSER=taptop_prod
PGPASSWORD=votre_mot_de_passe_securise
PGPORT=5432

# Session (IMPORTANT : changez ce secret !)
SESSION_SECRET=votre_secret_super_long_et_securise_min_32_caracteres_uniques

# Stripe PRODUCTION (clés live)
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe_production
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_stripe_production

# DTone PRODUCTION
DTONE_API_KEY=votre_cle_dtone_production
DTONE_API_SECRET=votre_secret_dtone_production

# Email PRODUCTION
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@taptopload.com
EMAIL_PASS=votre_mot_de_passe_app_gmail
EMAIL_FROM=noreply@taptopload.com

# WhatsApp PRODUCTION
WHATSAPP_VERIFY_TOKEN=votre_token_production_securise
WHATSAPP_ACCESS_TOKEN=votre_token_meta_permanent
WHATSAPP_PHONE_NUMBER_ID=votre_phone_id_production

# OAuth (si utilisé)
FACEBOOK_APP_ID=votre_app_id_production
FACEBOOK_APP_SECRET=votre_secret_production

# Environnement
NODE_ENV=production
```

---

## 📦 Déploiement sur VPS (Guide complet)

### 1️⃣ Préparation du Serveur

```bash
# Se connecter au serveur
ssh root@votre-serveur-ip

# Mise à jour système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer nginx (reverse proxy)
sudo apt install -y nginx

# Installer certbot (SSL gratuit)
sudo apt install -y certbot python3-certbot-nginx
```

### 2️⃣ Configuration PostgreSQL

```bash
# Créer base de données
sudo -u postgres psql -c "CREATE USER taptop_prod WITH PASSWORD 'MotDePasseSecurise123!';"
sudo -u postgres psql -c "CREATE DATABASE taptopload_prod OWNER taptop_prod;"
```

### 3️⃣ Déploiement de l'Application

```bash
# Créer répertoire application
sudo mkdir -p /var/www/taptopload
sudo chown $USER:$USER /var/www/taptopload
cd /var/www/taptopload

# Cloner votre repository (ou upload via SFTP)
git clone https://github.com/votre-username/taptopload.git .

# Installer dépendances
npm install --production=false

# Créer fichier .env (copiez les variables ci-dessus)
nano .env

# Build de l'application
npm run build

# Exécuter les migrations
npm run db:push
```

### 4️⃣ Configuration PM2

```bash
# Créer fichier ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'taptopload',
    script: 'npm',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Démarrer l'application
pm2 start ecosystem.config.js

# Configurer démarrage automatique
pm2 startup
pm2 save
```

### 5️⃣ Configuration Nginx

```bash
# Créer configuration nginx
sudo nano /etc/nginx/sites-available/taptopload

# Coller cette configuration :
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}

# Activer le site
sudo ln -s /etc/nginx/sites-available/taptopload /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtenir certificat SSL (HTTPS)
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 6️⃣ Configuration du Firewall

```bash
# Autoriser trafic nécessaire
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

---

## 🔄 Mise à Jour de l'Application

```bash
# Se connecter au serveur
ssh user@votre-serveur-ip

# Aller dans le répertoire
cd /var/www/taptopload

# Pull dernières modifications
git pull origin main

# Installer nouvelles dépendances
npm install

# Rebuild
npm run build

# Migrations si nécessaire
npm run db:push

# Redémarrer
pm2 restart taptopload
```

---

## 📊 Monitoring et Logs

### Logs PM2

```bash
# Voir tous les logs
pm2 logs

# Logs en temps réel
pm2 logs taptopload --lines 100

# Monitoring
pm2 monit
```

### Logs Nginx

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🌐 Configuration WhatsApp en Production

Une fois déployé, mettez à jour le webhook dans Meta :

```
Callback URL: https://votre-domaine.com/api/whatsapp/webhook
Verify Token: [celui dans votre .env]
```

---

## 🔐 Sécurité

### Checklist Sécurité

- ✅ Changez tous les secrets par défaut
- ✅ Utilisez des mots de passe forts (min 32 caractères)
- ✅ Activez SSL/HTTPS avec certbot
- ✅ Configurez le firewall (UFW)
- ✅ Limitez l'accès SSH (clés seulement)
- ✅ Gardez le système à jour
- ✅ Backups réguliers de la base de données
- ✅ Ne commitez JAMAIS le fichier .env

### Backup Automatique PostgreSQL

```bash
# Créer script de backup
cat > /home/$USER/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U taptop_prod taptopload_prod > $BACKUP_DIR/taptopload_$DATE.sql
# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "taptopload_*.sql" -mtime +7 -delete
EOF

chmod +x /home/$USER/backup-db.sh

# Ajouter au crontab (tous les jours à 2h)
(crontab -l ; echo "0 2 * * * /home/$USER/backup-db.sh") | crontab -
```

---

## 🌍 Variables d'Environnement par Environnement

### Développement Local (.env.local)
```bash
DATABASE_URL=postgresql://taptop_user:taptop_dev_2025@localhost:5432/taptopload
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_...  # Test mode
```

### (Secrets)
```bash
DATABASE_URL=postgresql://...@neon.tech/...
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_...  # Test mode
```

### Production (.env)
```bash
DATABASE_URL=postgresql://taptop_prod:...@localhost:5432/taptopload_prod
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...  # Live mode
```

---

## 🚨 Dépannage

### L'application ne démarre pas

```bash
# Vérifier les logs PM2
pm2 logs taptopload --err

# Vérifier les variables d'environnement
pm2 env 0

# Vérifier la connexion DB
psql -U taptop_prod -d taptopload_prod -h localhost
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL fonctionne
sudo systemctl status postgresql

# Tester la connexion
psql "postgresql://taptop_prod:password@localhost:5432/taptopload_prod"
```

### Nginx 502 Bad Gateway

```bash
# Vérifier que PM2 tourne
pm2 status

# Vérifier les logs nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 💰 Coûts Estimés

### VPS Basic
- **Serveur** : $5-10/mois (DigitalOcean, Linode)
- **Domaine** : $10-15/an
- **SSL** : Gratuit (Let's Encrypt)
- **Total** : ~$7/mois

### Services Tiers
- **Stripe** : 2.9% + $0.30 par transaction
- **DTone** : Variable selon volume
- **WhatsApp** : 1000 conversations gratuites/mois
- **Email** : Gratuit (Gmail) ou $5/mois (service dédié)

---

## 📚 Ressources

- **PM2** : https://pm2.keymetrics.io/
- **Nginx** : https://nginx.org/en/docs/
- **Let's Encrypt** : https://letsencrypt.org/
- **PostgreSQL** : https://www.postgresql.org/docs/

---

## ✅ Checklist de Déploiement

- [ ] Serveur configuré (VPS/Cloud)
- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée
- [ ] Application déployée
- [ ] Variables d'environnement configurées (.env)
- [ ] Migrations exécutées (npm run db:push)
- [ ] PM2 configuré et lancé
- [ ] Nginx configuré
- [ ] SSL activé (HTTPS)
- [ ] Firewall configuré
- [ ] Webhook WhatsApp mis à jour
- [ ] Backups automatiques configurés
- [ ] Monitoring actif
- [ ] Tests complets effectués

---

**Besoin d'aide ?** Consultez les guides WHATSAPP_CREATION_GUIDE.md et CONFIGURATION_GUIDE.md

# 🖋️ Vanely Tattoo

Projet de gestion et vitrine pour Vanely Tattoo (Lyon).

## 🚀 Installation Rapide

### 1. Cloner le projet
```bash
git clone <url-du-depot>
cd VanelyTattoo
```

### 2. Installation des dépendances
Il faut installer les dépendances pour le frontend ET le backend.

```bash
# Installation Frontend (Racine)
npm install

# Installation Backend
cd server
npm install
cd ..
```

### 3. Configuration des environnements
Créez les fichiers `.env` aux bons endroits :

**Frontend (`.env` à la racine) :**
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend (`server/.env`) :**
```env
PORT=3000
DB_HOST=localhost
DB_USER=votre_user
DB_PASSWORD=votre_password
DB_NAME=vanely_tattoo
JWT_SECRET=votre_secret_jwt
```

### 4. Base de données
Importez le schéma SQL situé dans `server/schema.sql` dans votre base de données MySQL.

---

## 🛠️ Utilisation (Développement)

Pour lancer le projet, vous devez démarrer deux terminaux :

**Terminal 1 : Frontend**
```bash
npm run dev
```

**Terminal 2 : Backend**
```bash
cd server
npm run dev
```

---

## 📦 Autres commandes

### Production
- Build frontend : `npm run build`
- Lancer serveur production : `cd server && npm start`

### Qualité
- Lint : `npm run lint`
- Mise en forme : `npm run format`

---

## 🔝 Déploiement & Mise à Jour

### 🔄 Mise à jour rapide (One-liner)
À exécuter sur le serveur dans le dossier du projet pour tout mettre à jour d'un coup :

```bash
git pull && npm ci && npm run build && cd server && npm ci && pm2 restart all
```

### 💡 Créer un Alias (Recommandé)
Pour mettre à jour le site avec une seule commande (ex: `update-vanely`), suivez ces étapes sur votre serveur :

1. Ouvrez votre configuration bash : `nano ~/.bashrc`
2. Ajoutez cette ligne à la fin :
   ```bash
   alias update-vanely='cd /var/www/VanelyTattoo && git fetch --all && git reset --hard origin/main && npm ci && npm run build && cd server && npm ci && pm2 restart all && cd ..'
   ```
   *(Ajustez `/var/www/VanelyTattoo` selon votre vrai chemin)*
3. Sauvegardez (`Ctrl+O`, `Enter`, `Ctrl+X`) et activez : `source ~/.bashrc`

Désormais, tapez simplement `update-vanely` pour synchroniser et redémarrer le site !

---

## 📂 Structure du projet
- `src/` : Code source Vue.js (Frontend)
- `server/` : API Express & Base de données (Backend)
- `public/` : Assets statiques

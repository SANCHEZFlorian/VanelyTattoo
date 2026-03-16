# 🛡️ FINAL_STABILIZATION.md - Check-list de Mise en Production (Lead QA)

Ce document sert de référence unique pour valider la qualité et la stabilité de l'application **Vanely Tattoo** avant le lancement officiel.

---

## 1. 🧹 Nettoyage du Code & Data

Avant d'ouvrir le site au public, il est impératif de repartir sur une base saine.

- [ ] **Suppression des Données de Test (Supabase)**
  - Aller dans l'interface Supabase > Table Editor.
  - Vider la table `messages` (supprimer les entrées "lorem ipsum").
  - Vider la table `bookings` (supprimer les fausses réservations).
  - Vérifier la table `flash_tattoos` : remettre le statut `active` pour tous les flashs qui ont été "réservés" pendant les tests.
- [ ] **Console & Logs**
  - Vérifier que le build de production (`npm run build`) ne génère pas de `console.log` critiques exposant des données sensibles.
  - S'assurer que le mode `debug` est désactivé si applicable.
- [ ] **Variables d'Environnement (.env)**
  - [ ] `VITE_SUPABASE_URL` : Vérifier qu'elle pointe bien sur le projet PROD (si distinct du DEV).
  - [ ] `VITE_SUPABASE_ANON_KEY` : Vérifier que c'est bien la clé publique.
  - [ ] S'assurer qu'aucune clé privée (SERVICE_ROLE_KEY) n'est présente dans le code client.

---

## 2. 🚦 Tests de Parcours Critiques (Recette)

Ces scénarios doivent être joués manuellement pour garantir que le cœur de métier fonctionne.

- [ ] **Scénario : "Réservation d'un Flash"**
  1. Aller sur la page "Flash" (Client).
  2. Sélectionner un flash disponible.
  3. Cliquer sur "Réserver ce flash" -> Redirection vers `/booking` avec l'ID pré-rempli.
  4. Remplir et envoyer le formulaire.
  5. **Validation QA** :
     - Le statut du flash passe-t-il à `reserved` dans l'admin ?
     - Une notification est-elle apparue dans l'admin ?
     - (Optionnel) Un email de confirmation a-t-il été déclenché (si configuré) ?

- [ ] **Scénario : "Fin de journée" (Admin)**
  1. Aller dans le `CalendarManager` (Admin).
  2. Sélectionner un rendez-vous passé.
  3. Ouvrir les détails.
  4. Tester les actions de clôture :
     - **Publier** : Le RDV est-il archivé / transformé en post brouillon ?
     - **Ignorer** : Le RDV est-il archivé sans action ?
  5. **Validation QA** : Le RDV doit disparaître de la vue "À venir" ou changer d'état visuel.

- [ ] **Scénario : "Uploader un PDF"**
  1. Aller dans `ResourcesManager` ou dans un formulaire client (ex: Contact).
  2. Uploader un fichier PDF (ex: Consentement ou Image de référence).
  3. **Validation QA** :
     - Le fichier apparaît-il dans le Bucket Supabase ?
     - L'URL générée est-elle accessible publiquement (test en navigation privée) ?

---

## 3. 📱 Performance & Mobile

L'expérience utilisateur doit être fluide sur tous les appareils.

- [ ] **Fluidité du Scroll (Mobile)**
  - Tester sur un appareil réel (iPhone et Android) ou via DevTools Mobile.
  - Scroller rapidement dans la `GalleryView` et `FlashView`.
  - **Critère** : Pas de "jank" (saccades), pas d'erreurs dans la console liées aux écouteurs d'événements (`passive: true`).
- [ ] **Menu Burger / Navigation Mobile**
  - Ouvrir le menu burger sur mobile.
  - Cliquer sur chaque lien.
  - Le menu se ferme-t-il après le clic ?
- [ ] **Affichage Admin Mobile**
  - Se connecter à `/admin` sur mobile.
  - Vérifier que les **Tableaux** (Flashs, Messages) ne cassent pas la mise en page (scroll horizontal présent si besoin).
- [ ] **Optimisation des Images**
  - Vérifier que les images uploadées ne font pas 5 Mo pour rien.
  - Idéalement, les images affichées en grille ne devraient pas dépasser ~150-300ko.

---

## 4. 🔒 Sécurité & Accessibilité

Derniers verrous avant ouverture.

- [ ] **Protection de l'Admin**
  - Se déconnecter.
  - Tenter d'accéder directement à `YOUR_URL/admin/dashboard`.
  - **Résultat attendu** : Redirection immédiate vers `/admin/login`.
- [ ] **Accessibilité des Liens Clés**
  - Vérifier le pied de page (Footer).
  - Les liens "Soins (Aftercare)" et "Mentions Légales" fonctionnent-ils ?
  - Le lien "Consentement" (si présent) télécharge-t-il bien le document ?
- [ ] **Accessibilité Visuelle (Images)**
  - Inspecter la page d'accueil.
  - Vérifier que les images importantes ont un attribut `alt` rempli (ex: `alt="Tatouage loup géométrique"` et non `alt="img_123"`).

---

## 📝 Conclusion : Sauvegarde de Sécurité

**Avant le lancement, faites un Dump SQL !**

Si vous devez faire des modifications de structure plus tard, il est crucial d'avoir une copie de l'état "Propre" de la base.

**Procédure (depuis Supabase Dashboard) :**

1. Aller dans **Database** > **Backups** (ou via SQL Editor).
2. Si pas d'option directe, aller dans **SQL Editor**.
3. Exécuter un script pour lister tables et données, ou utiliser la CLI Supabase :
   ```bash
   supabase db dump --db-url "votre_url_de_connexion" > backup_pre_prod.sql
   ```
4. Conserver ce fichier `backup_pre_prod.sql` en lieu sûr.

---

_Document généré par l'Agent QA Vanely Tattoo - Prêt pour le déploiement !_ 🚀

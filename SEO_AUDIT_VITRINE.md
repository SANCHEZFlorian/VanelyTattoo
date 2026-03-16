# Audit SEO Préliminaire - Vitrine VanelyTattoo

## État des Lieux Global

L'application est une Single Page Application (SPA) Vue.js. Actuellement, la gestion des métadonnées (Titre, Description) est **statique** et définie uniquement dans `index.html`. Cela signifie que toutes les pages partagent le même titre "Vanely Tattoo" et n'ont pas de méta-description spécifique, ce qui est **très pénalisant** pour le référencement local.

## Analyse par Page

### 1. Structure Globale (`index.html`)

- **Titre** : "Vanely Tattoo" (Générique)
- **Meta Description** : **Absente**.
- **Viewport** : Présent (Correct).
- **Favicon** : Présent.

### 2. Accueil (`HomeView.vue`)

- **Hierarchie Hn** :
  - `<h1>` multiples dans le carrousel (cachés par `v-if/v-show` mais présents dans le DOM). C'est acceptable mais un seul `<h1>` statique serait plus sûr.
  - `<h2>` pour les sections "Nouveaux flashs" et "En promo". Correct.
- **Images** : Les balises `alt` sont dynamiques (`slide.title`, `work.title`). **Bon point**.
- **Manquant** : Titre spécifique (ex: "Tatoueur [Ville] - Vanely Tattoo") et description riche.

### 3. Flashs (`FlashView.vue`)

- **Hierarchie Hn** : Pas de `<h1>` visible dans le code fourni (le composant filtre est au dessus). Il manque un titre principal de page.
- **Images** : Gérées dynamiquement.
- **Manquant** : Titre de page "Catalogue Flash Tattoo - Styles [Liste]".

### 4. Galerie (`GalleryView.vue`)

- **Hierarchie Hn** : `<h1>Galerie</h1>`. Correct.
- **Images** : `alt` basé sur `item.title`. Correct.
- **Manquant** : Méta description décrivant le style artistique.

### 5. Réservation (`BookingView.vue`)

- **Hierarchie Hn** : Pas de `<h1>` global explicite dans l'extrait, souvent le titre est dans un composant parent ou manquant.
- **SEO** : Page fonctionnelle, moins critique pour le référencement pur mais importante pour la conversion.

### 6. Contact (`ContactView.vue`)

- **Hierarchie Hn** : `<h1>Contactez-nous</h1>`. Correct.
- **Manquant** : Coordonnées géographiques lisibles par les robots (JSON-LD) Idéalement.

### 7. Blog (`BlogView.vue` & `ArticleView.vue`)

- **Hierarchie Hn** : `<h1>Le Blog</h1>`. Correct.
- **Contenu** : C'est la section la plus importante pour le SEO. Les articles doivent avoir des titres accrocheurs.
- **Manquant** : Les pages articles doivent absolument mettre à jour le `<title>` du navigateur avec le titre de l'article.

### 8. Pages Légales (`Aftercare`, `Terms`, `Privacy`)

- **Structure** : Correcte avec des `<h1>`.
- **Impact SEO** : Faible, mais rassurant pour Google (E-E-A-T).

---

## Recommandations Prioritaires

### 1. Implémentation de la Gestion des Métadonnées

Installer `@vueuse/head` ou utiliser les "Navigation Guards" du routeur pour mettre à jour dynamiquement :

- **Title** : `Titre de la page | Vanely Tattoo`
- **Meta Description** : Une phrase unique par page contenant les mots-clés locaux (Ville, Style).

### 2. Balisage Sémantique

- Ajouter des données structurées **JSON-LD** pour "LocalBusiness" dans `HomeView.vue`.
- S'assurer que chaque page a un et un seul `<h1>` visible.

### 3. Optimisation des Images

- Vérifier que toutes les images uploadées via l'admin conservent des noms de fichiers pertinents si possible, ou forcer des attributs `alt` descriptifs générés côté client.

### 4. Liens Internes

- Renforcer le maillage interne : Lier les articles de blog vers la page Flash ou Réservation.

## Actions Immédiates (Phase de Stabilisation)

- [ ] Ajouter un watcher dans `router/index.js` pour mettre à jour `document.title` selon la route (`meta.title`).
- [ ] Ajouter une balise `<meta name="description">` par défaut dans `index.html` et la mettre à jour dynamiquement si possible, ou au moins avoir une description générique robuste.

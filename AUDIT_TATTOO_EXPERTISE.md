# AUDIT TATTOO EXPERTISE

## [Expérience Client]

### 1. Gestion des Éclats "Réservés" et "Tatoués"

**Observation :**
Actuellement, les flashs n'ont que deux statuts : `active` (visible) ou `standby` (caché).
Il manque un statut intermédiaire "Réservé" (visible mais non réservable) et "Tatoué" (visible en tant que portfolio ou archivé).
Un client ne peut pas voir un flash qu'il a manqué de peu, ce qui crée de la frustration et empêche de montrer l'activité récente.

**Recommandation :**
Ajouter des statuts visuels sur les cartes Flash côté client.

```vue
<!-- Proposition de correction pour FlashView.vue -->
<!-- Dans le template de la carte flash, ajouter un overlay ou un badge spécifique -->
<div
  v-if="flash.status === 'reserved'"
  class="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
>
  <span class="text-white font-bold text-xl uppercase border-2 border-white px-4 py-2 rotate-[-15deg]">
    RÉSERVÉ
  </span>
</div>
<div
  v-if="flash.status === 'tattooed'"
  class="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
>
  <span class="text-white font-bold text-xl uppercase border-2 border-white px-4 py-2 rotate-[-15deg]">
    TATOUÉ
  </span>
</div>

<!-- Désactiver le clic sur openModal si réservé/tatoué -->
<div
  @click="flash.status === 'active' ? openModal(flash) : null"
  :class="{ 'cursor-default': flash.status !== 'active' }"
>
  ...
</div>
```

### 2. Formulaire de Demande de Projet Simpliste

**Observation :**
Le formulaire de réservation (`BookingView.vue`) ne demande qu'une "Description" textuelle.
Le client ne peut pas spécifier formellement la taille, l'emplacement ou le budget. Cela oblige l'artiste à demander ces détails par mail, retardant le processus.

**Recommandation :**
Ajouter des champs structurés :

- **Taille approximative** (cm)
- **Emplacement du corps** (liste déroulante ou texte court)
- **Budget envisagé** (fourchette)

```vue
<!-- Proposition d'ajout dans BookingView.vue (Formulaire) -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Emplacement</label>
    <input v-model="bookingForm.placement" type="text" placeholder="Ex: Avant-bras gauche" class="..." />
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">Taille estimée (cm)</label>
    <input v-model="bookingForm.size" type="text" placeholder="Ex: 15x10 cm" class="..." />
  </div>
</div>
<div>
  <label class="block text-sm font-medium text-gray-700 mb-2">Budget envisagé</label>
  <select v-model="bookingForm.budget" class="...">
    <option value="small">< 150€</option>
    <option value="medium">150€ - 300€</option>
    <option value="large">300€ - 500€</option>
    <option value="xl">500€ +</option>
  </select>
</div>
```

---

## [Gestion Admin & Flashs]

### 1. Statuts Manquants dans l'Admin

**Observation :**
Dans `FlashManager.vue`, le sélecteur de statut ne propose que "Actif" et "Standby".

**Recommandation :**
Mettre à jour les options et la logique de filtrage pour inclure "Réservé" et "Tatoué".

```javascript
/* Proposition de correction pour FlashManager.vue */
const statusOptions = [
  { value: 'active', label: 'Disponible' },
  { value: 'reserved', label: 'Réservé' },
  { value: 'tattooed', label: 'Tatoué' },
  { value: 'standby', label: 'Caché / Standby' },
]
```

### 2. Tri des Demandes (Expérience Artiste)

**Observation :**
L'`Admin` (`BookingManager.vue`) ne permet pas de trier par "Rentabilité" ou "Taille" car ces données ne sont pas collectées. Une fois les champs ajoutés côté client (voir point précédent), il faudra mettre à jour les colonnes du tableau Admin.

**Recommandation :**
Ajouter des colonnes triables dans `BookingManager.vue` après mise à jour de la base de données.

```vue
<!-- Future colonne dans BookingManager.vue -->
<th @click="sortBy('budget')" class="cursor-pointer ...">
  Budget <i :class="getSortIcon('budget')"></i>
</th>
```

---

## [Conformité & Santé]

### 1. Absence de Page "Soins Après Tatouage" (Aftercare)

**Observation :**
Aucune page ni modale n'est dédiée aux instructions de cicatrisation. C'est une obligation légale et sanitaire de fournir ces informations CLAIREMENT.
`SettingsView.vue` permet d'éditer les CGV mais n'a pas de champ pour l'Aftercare.

**Recommandation :**

1. Créer une nouvelle vue `AftercareView.vue` côté client.
2. Ajouter un onglet "Soins / Aftercare" dans `SettingsView.vue` (Admin) pour éditer ce contenu dynamiquement via `InfoStore`.
3. Envoyer automatiquement ce lien par email lors de la confirmation du RDV.

### 2. Décharge de Responsabilité (Consentement)

**Observation :**
La case à cocher "J'accepte les termes" dans le formulaire de réservation est juridiquement faible pour une procédure invasive comme le tatouage.

**Recommandation :**

- Soit intégrer un lien vers un formulaire PDF généré.
- Soit ajouter une étape explicite "Consentement Éclairé" (Santé, Allergies, Sobriété) avant la validation finale.

---

## [Bugs & Optimisations Code]

### 1. Durée de RDV "Hardcodée"

**Fichier :** `BookingView.vue`
**Problème :**
Ligne 160 : `const duration = selectedFlash.value?.duration || 60`
Si ce n'est pas un flash (projet perso), la durée est arbitrairement fixée à 60min, ce qui fausse le calendrier de l'artiste.

**Correction Proposée :**
Pour un projet perso, demander au client une estimation ou mettre une durée par défaut "à confirmer" (ex: 0 ou flag spécifique) qui ne bloque pas le créneau définitivement tant que l'artiste n'a pas validé la durée réelle.

### 2. Fragilité du Scroll Lock

**Fichier :** `FlashView.vue`
**Problème :**
Lignes 44 & 50 : Manipulation directe du DOM `document.body.style.overflow`.
Si le composant est démonté alors que la modale est ouverte (navigation arrière navigateur), le scroll peut rester bloqué.

**Correction Proposée :**
Utiliser `onUnmounted` pour garantir le nettoyage.

```javascript
/* Dans FlashView.vue */
import { onUnmounted } from 'vue'

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})
```

### 3. Logique de Disponibilité Client-Side

**Fichier :** `BookingView.vue`
**Problème :**
La fonction `isSlotAvailable` est exécutée côté client. Si deux clients sont sur la page en même temps, ils peuvent voir le même créneau libre.

**Correction Proposée :**
Bien que l'architecture actuelle semble simple, il faut s'assurer que le `bookingStore` rafraîchit les données régulièrement ou juste avant la soumission (`submitBooking`) pour éviter les double-réservations.

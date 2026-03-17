<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFlashStore } from '../../stores/flash'
import { useCategoryStore } from '../../stores/category'
import { usePromoStore } from '../../stores/promo'
import { useClientStore } from '../../stores/client'
import { useAuthStore } from '../../stores/auth'
import FlashModal from '../../components/client/FlashModal.vue'
import { normalizeString } from '../../utils/stringUtils'
import { getImageUrl } from '../../utils/imageUtils'

const router = useRouter()
const route = useRoute()
const flashStore = useFlashStore()
const categoryStore = useCategoryStore()
const promoStore = usePromoStore()
const clientStore = useClientStore()

// Initialize wishlist on mount if logged in
onMounted(async () => {
  // We don't block render but try to fetch wishlist
  if (useAuthStore().user) {
    // quick check using auth store without importing it explicitly if possible, or assume clientStore handles it
    // Actually best to just call fetchWishlist, it checks user internally
    await clientStore.fetchWishlist()
  }
})

const toggleWishlist = async (flash) => {
  if (clientStore.isInWishlist(flash.id)) {
    await clientStore.removeFromWishlist(flash.id)
  } else {
    await clientStore.addToWishlist(flash.id)
  }
}

const selectedCategories = ref([])
const selectedSizes = ref([])
const selectedColors = ref([])
const priceRange = ref(500)
const sortBy = ref('newest')
const searchQuery = ref('')
const showOnlyPromos = ref(false)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Modal state
const isModalOpen = ref(false)
const modalItem = ref(null)
const modalInitialView = ref('details')

// Fetch global promo on mount
onMounted(() => {
  categoryStore.fetchCategories()
  promoStore.fetchPromotions()
  promoStore.fetchActiveGlobalPromo()

  // SEO: Meta Description
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      'Découvrez notre collection de Flash Tattoos à Lyon. Dessins uniques prêts à être tatoués. Réservez votre séance.',
    )
  }
})

const openModal = (item, view = 'details') => {
  if (item) {
    flashStore.incrementView(item.id)
  }
  modalItem.value = item
  modalInitialView.value = view
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  modalItem.value = null
  document.body.style.overflow = 'auto'
}

onUnmounted(() => {
  document.body.style.overflow = 'auto'
})

const handleBook = (item) => {
  const targetItem = item || modalItem.value
  closeModal()
  if (targetItem) {
    router.push(`/booking?flash=${targetItem.id}`)
  } else {
    router.push('/booking')
  }
}

// Watch for query params changes
watch(
  () => route.query.q,
  (newVal) => {
    searchQuery.value = newVal || ''
  },
  { immediate: true },
)

// Watch for filter promo query param
watch(
  () => route.query.filter,
  (newVal) => {
    if (newVal === 'promo') {
      showOnlyPromos.value = true
    }
  },
  { immediate: true },
)

const filteredFlashTattoos = computed(() => {
  let filtered = flashStore.flashTattoos.filter((tattoo) => {
    if (tattoo.status === 'standby' || tattoo.status === 'tattooed') return false // Filter standby and tattooed
    if (searchQuery.value) {
      const searchLower = normalizeString(searchQuery.value)

      // Support searching by #ID
      const isIdSearch = searchQuery.value.startsWith('#')
      const searchId = isIdSearch ? searchQuery.value.substring(1) : searchQuery.value

      const matchesSearch =
        normalizeString(tattoo.title).includes(searchLower) || tattoo.id.toString() === searchId

      if (!matchesSearch) return false
    }
    if (selectedCategories.value.length) {
      // Check if tattoo has at least one of the selected categories
      const hasCategory = tattoo.categories.some((cat) => selectedCategories.value.includes(cat))
      if (!hasCategory) return false
    }
    if (selectedSizes.value.length && !selectedSizes.value.includes(tattoo.size)) return false
    if (selectedColors.value.length) {
      const tattooColors = Array.isArray(tattoo.color) ? tattoo.color : [tattoo.color]
      const matchesColor = tattooColors.some((c) => selectedColors.value.includes(c))
      if (!matchesColor) return false
    }

    // Check price against discounted price if promo is active
    const currentPrice = promoStore.getDiscountedPrice(tattoo.price, tattoo.id, tattoo.discount)
    if (currentPrice > priceRange.value) return false

    // Filter by promo status
    if (showOnlyPromos.value) {
      // If current price is equal to original price (if it exists) or standard price, then no discount is applied
      const referencePrice = tattoo.original_price || tattoo.price
      if (currentPrice >= referencePrice) return false
    }

    return true
  })
  // Sort
  if (sortBy.value === 'price-low') {
    filtered.sort(
      (a, b) =>
        promoStore.getDiscountedPrice(a.price, a.id, a.discount) -
        promoStore.getDiscountedPrice(b.price, b.id, b.discount),
    )
  } else if (sortBy.value === 'price-high') {
    filtered.sort(
      (a, b) =>
        promoStore.getDiscountedPrice(b.price, b.id, b.discount) -
        promoStore.getDiscountedPrice(a.price, a.id, a.discount),
    )
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredFlashTattoos.value.length / itemsPerPage.value))

const paginatedFlashTattoos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredFlashTattoos.value.slice(start, end)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(filteredFlashTattoos, () => {
  currentPage.value = 1
})

// Check for open query param
watch(
  () => route.query.open,
  (newId) => {
    if (newId) {
      const id = parseInt(newId)
      const item = flashStore.flashTattoos.find((f) => f.id === id)
      if (item) {
        openModal(item)
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">Flash Tattoos</h1>
    <!-- Count & Sort Bar (Moved above columns for alignment) -->
    <div class="flex justify-between items-center mb-6">
      <p class="text-gray-600">
        <span v-if="filteredFlashTattoos.length === 0">Aucun flash trouvé</span>
        <span v-else-if="filteredFlashTattoos.length === 1">1 Flash trouvé</span>
        <span v-else>{{ filteredFlashTattoos.length }} Flashs trouvés</span>
      </p>
      <select
        v-model="sortBy"
        class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="newest">Plus récents</option>
        <option value="price-low">Prix croissant</option>
        <option value="price-high">Prix décroissant</option>
        <option value="popular">Populaire</option>
      </select>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 items-start">
      <!-- Filters Sidebar -->
      <div class="lg:w-64 bg-white rounded-lg shadow-lg p-4">
        <h3 class="text-lg font-semibold mb-3">Filtres</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Catégories</label>
            <div class="space-y-1">
              <label v-for="cat in categoryStore.categories" :key="cat" class="flex items-center">
                <input v-model="selectedCategories" :value="cat" type="checkbox" />
                <span class="text-sm capitalize">{{ cat }}</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Promotions</label>
            <label class="flex items-center">
              <input v-model="showOnlyPromos" type="checkbox" />
              <span class="text-sm">En promotion uniquement</span>
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Taille</label>
            <div class="space-y-1">
              <label class="flex items-center">
                <input v-model="selectedSizes" value="small" type="checkbox" />
                <span class="text-sm">Petit (5-10 cm)</span>
              </label>
              <label class="flex items-center">
                <input v-model="selectedSizes" value="medium" type="checkbox" />
                <span class="text-sm">Moyen (10-15 cm)</span>
              </label>
              <label class="flex items-center">
                <input v-model="selectedSizes" value="large" type="checkbox" />
                <span class="text-sm">Grand (15cm+)</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Couleurs</label>
            <div class="space-y-1">
              <label class="flex items-center">
                <input v-model="selectedColors" value="color" type="checkbox" />
                <span class="text-sm">Couleur</span>
              </label>
              <label class="flex items-center">
                <input v-model="selectedColors" value="blackwork" type="checkbox" />
                <span class="text-sm">Noir & Blanc</span>
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Prix max: {{ priceRange }}€</label
            >
            <input v-model="priceRange" type="range" min="50" max="500" step="25" />
          </div>
        </div>
      </div>
      <!-- Flash Tattoos Grid -->
      <div class="flex-1">
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="flash in paginatedFlashTattoos"
            :key="flash.id"
            class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            @click="openModal(flash)"
          >
            <div class="relative">
              <img
                :src="getImageUrl(flash.images[0])"
                :alt="flash.title"
                class="w-full h-64 object-cover object-top"
              />
              <!-- Wishlist Heart -->
              <button
                @click.stop="toggleWishlist(flash)"
                class="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md z-20 group/heart"
                :class="
                  clientStore.isInWishlist(flash.id)
                    ? 'bg-white text-pink-500'
                    : 'bg-black/30 text-white hover:bg-white hover:text-pink-500'
                "
                title="Ajouter aux favoris"
              >
                <i
                  :class="clientStore.isInWishlist(flash.id) ? 'fas fa-heart' : 'far fa-heart'"
                ></i>
              </button>

              <!-- Status Badges -->
              <div
                v-if="flash.status === 'reserved'"
                class="absolute inset-0 bg-black/40 flex items-center justify-center z-10"
              >
                <span
                  class="text-white font-black text-2xl uppercase border-4 border-white px-6 py-2 rotate-[-12deg] tracking-wider shadow-xl"
                >
                  RÉSERVÉ
                </span>
              </div>

              <div
                v-if="
                  (flash.original_price && flash.original_price > flash.price) ||
                  promoStore.activePromo
                "
                class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold"
              >
                <!-- Show global promo if active, otherwise individual discount -->
                -{{
                  promoStore.activePromo
                    ? promoStore.activePromo.discount_percent
                    : Math.round(
                        ((flash.original_price - flash.price) / flash.original_price) * 100,
                      )
                }}%
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2">{{ flash.title }}</h3>
              <div class="flex flex-wrap gap-1 mb-3">
                <span
                  v-for="cat in flash.categories"
                  :key="cat"
                  class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs uppercase"
                >
                  {{ cat }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <span
                    v-if="
                      (flash.original_price && flash.original_price > flash.price) ||
                      promoStore.activePromo
                    "
                    class="text-gray-400 line-through text-sm"
                    >{{ flash.original_price || flash.price }}€</span
                  >
                  <span class="text-xl font-bold text-gray-800"
                    >{{
                      promoStore.activePromo
                        ? promoStore.getDiscountedPrice(flash.price, flash.id, flash.discount)
                        : flash.price
                    }}€</span
                  >
                </div>
                <button
                  v-if="flash.status === 'active'"
                  @click.stop="openModal(flash, 'booking')"
                  class="bg-blue-400 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition-colors text-xs !rounded-button cursor-pointer whitespace-nowrap font-bold inline-block"
                >
                  Réserver ce flash
                </button>
                <button
                  v-else
                  disabled
                  class="bg-gray-300 text-gray-500 px-4 py-2 rounded-full text-xs !rounded-button cursor-not-allowed whitespace-nowrap font-bold"
                >
                  Indisponible
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <div class="flex gap-1">
            <template v-for="page in totalPages" :key="page">
              <button
                v-if="
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                "
                @click="changePage(page)"
                :class="[
                  'w-8 h-8 flex items-center justify-center rounded-md border transition-colors',
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-100',
                ]"
              >
                {{ page }}
              </button>
              <span
                v-else-if="page === currentPage - 3 || page === currentPage + 3"
                class="px-1 self-end"
                >...</span
              >
            </template>
          </div>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <FlashModal
      :isOpen="isModalOpen"
      :item="modalItem"
      :initialView="modalInitialView"
      type="flash"
      @close="closeModal"
      @book="handleBook"
    />
  </div>
</template>

<style scoped>
.\!rounded-button {
  border-radius: 9999px;
}

/* Custom Checkbox Styling */
input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  background-color: #fff;
  margin-right: 0.5rem;
  font: inherit;
  color: currentColor;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #cbd5e1; /* slate-300 */
  border-radius: 0.5rem; /* More rounded (md/lg) */
  display: grid;
  place-content: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

input[type='checkbox']::before {
  content: '';
  width: 0.65em;
  height: 0.65em;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em white;
  transform-origin: center;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}

input[type='checkbox']:checked {
  background-color: #60a5fa; /* blue-400 */
  border-color: #60a5fa;
}

input[type='checkbox']:checked::before {
  transform: scale(1);
}

input[type='checkbox']:focus {
  outline: 2px solid #93c5fd; /* blue-300 */
  outline-offset: 2px;
}

/* Custom Range Slider Styling */
input[type='range'] {
  -webkit-appearance: none; /* Override default CSS styles */
  appearance: none;
  width: 100%;
  height: 6px;
  background: #e2e8f0; /* slate-200 */
  border-radius: 99px;
  outline: none;
  opacity: 0.9;
  transition: opacity 0.2s;
}

input[type='range']:hover {
  opacity: 1;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #60a5fa; /* blue-400 */
  cursor: pointer;
  transition:
    background 0.15s ease-in-out,
    transform 0.15s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type='range']::-webkit-slider-thumb:hover {
  background: #3b82f6; /* blue-500 */
  transform: scale(1.1);
}

input[type='range']::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #60a5fa;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

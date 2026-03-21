<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGalleryStore } from '../../stores/gallery'
import { useCategoryStore } from '../../stores/category'
import FlashModal from '../../components/client/FlashModal.vue'
import { getImageUrl } from '../../utils/imageUtils'

const route = useRoute()
const galleryStore = useGalleryStore()
const categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.fetchCategories()
})

onMounted(() => {
  // SEO: Meta Description
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      'Explorez la galerie de tatouages de Vanely Tattoo. Réalisations fines, florales et artistiques à Lyon.',
    )
  }
})

const selectedGalleryFilters = ref(['Tous'])
const galleryFilters = computed(() => ['Tous', ...categoryStore.categories])

// Modal state
const isModalOpen = ref(false)
const modalItem = ref(null)

const toggleFilter = (filter) => {
  if (filter === 'Tous') {
    selectedGalleryFilters.value = ['Tous']
    return
  }
  
  const idx = selectedGalleryFilters.value.indexOf('Tous')
  if (idx > -1) selectedGalleryFilters.value.splice(idx, 1)

  const fIdx = selectedGalleryFilters.value.indexOf(filter)
  if (fIdx > -1) {
    selectedGalleryFilters.value.splice(fIdx, 1)
    if (selectedGalleryFilters.value.length === 0) selectedGalleryFilters.value = ['Tous']
  } else {
    selectedGalleryFilters.value.push(filter)
  }
}

const filteredGallery = computed(() => {
  let items = galleryStore.galleryItems.filter((i) => i.status !== 'standby')
  if (selectedGalleryFilters.value.includes('Tous')) return items
  // Filter if item.categories includes any of the selected IDs
  return items.filter((item) => item.categories.some(c => selectedGalleryFilters.value.includes(c)))
})

const openModal = (item) => {
  if (item) {
    galleryStore.incrementView(item.id)
  }
  modalItem.value = item
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  modalItem.value = null
  document.body.style.overflow = 'auto'
}

const handleBook = () => {
  // Handled by modal
}

watch(
  () => route.query.open,
  (newId) => {
    if (newId) {
      const id = parseInt(newId)
      const item = galleryStore.galleryItems.find((f) => f.id === id)
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
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">
      Galerie Tatouages Lyon - Vanely Tattoo
    </h1>
    <!-- Filter Tabs -->
    <div class="flex justify-center mb-8">
      <div class="flex flex-wrap gap-4 bg-white rounded-xl p-3 shadow-sm border border-gray-100 justify-center">
        <button
          v-for="filter in galleryFilters"
          :key="filter"
          @click="toggleFilter(filter)"
          :class="{
            'bg-purple-600 text-white shadow-md': selectedGalleryFilters.includes(filter),
            'bg-gray-50 text-gray-700 hover:bg-gray-100': !selectedGalleryFilters.includes(filter)
          }"
          class="px-5 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap capitalize text-sm font-medium border border-transparent"
        >
          {{ filter }}
        </button>
      </div>
    </div>
    <!-- Masonry Gallery -->
    <div class="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      <div
        v-for="item in filteredGallery"
        :key="item.id"
        class="break-inside-avoid bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
        @click="openModal(item)"
      >
        <img :src="getImageUrl(item.images[0])" :alt="item.title" class="w-full object-cover object-top" />
        <div class="p-4">
          <h3 class="font-semibold mb-1">{{ item.title }}</h3>
          <p class="text-sm text-gray-600">{{ item.categories.join(', ') }}</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <FlashModal
      :isOpen="isModalOpen"
      :item="modalItem"
      type="gallery"
      @close="closeModal"
      @book="handleBook"
    />
  </div>
</template>

<style scoped>
/* Masonry layout adjustments */
.columns-1 {
  column-count: 1;
}
.columns-2 {
  column-count: 2;
}
.columns-3 {
  column-count: 3;
}
.columns-4 {
  column-count: 4;
}
@media (min-width: 640px) {
  .sm\:columns-2 {
    column-count: 2;
  }
}
@media (min-width: 1024px) {
  .lg\:columns-3 {
    column-count: 3;
  }
}
@media (min-width: 1280px) {
  .xl\:columns-4 {
    column-count: 4;
  }
}
</style>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFlashStore } from '../../stores/flash'
import { useGalleryStore } from '../../stores/gallery'
import { useBlogStore } from '../../stores/blog'
import { normalizeString } from '../../utils/stringUtils'

const router = useRouter()
const flashStore = useFlashStore()
const galleryStore = useGalleryStore()
const blogStore = useBlogStore()

const searchQuery = ref('')
const isOpen = ref(false)
const searchInput = ref(null)

// Computed property to filter results from all stores
const filteredResults = computed(() => {
  const query = normalizeString(searchQuery.value).trim()

  if (!query) {
    return {
      flash: [],
      gallery: [],
      blog: [],
    }
  }

  const flashResults = flashStore.flashTattoos.filter(
    (item) =>
      normalizeString(item.title).includes(query) ||
      item.categories?.some((cat) => normalizeString(cat).includes(query)),
  )

  const galleryResults = galleryStore.galleryItems.filter(
    (item) =>
      normalizeString(item.title).includes(query) ||
      item.categories?.some((cat) => normalizeString(cat).includes(query)),
  )

  const blogResults = blogStore.posts.filter(
    (post) =>
      normalizeString(post.title).includes(query) ||
      normalizeString(post.excerpt).includes(query) ||
      normalizeString(post.content).includes(query),
  )

  return {
    flash: flashResults,
    gallery: galleryResults,
    blog: blogResults,
  }
})

const hasResults = computed(() => {
  return (
    filteredResults.value.flash.length > 0 ||
    filteredResults.value.gallery.length > 0 ||
    filteredResults.value.blog.length > 0
  )
})

const navigateTo = (path, id = null) => {
  const options = { path }
  if (id) {
    options.query = { open: id }
  }
  router.push(options)
  isOpen.value = false
  searchQuery.value = ''
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
    isOpen.value = false
    searchQuery.value = ''
  }
}

const getItemImage = (item, type) => {
  if (type === 'flash') return item.images?.[0] || '/images/generic_tattoo.png'
  if (type === 'gallery') return item.image_url || '/images/generic_tattoo.png'
  if (type === 'blog') return item.image || '/images/hero_1.png'
  return '/images/generic_tattoo.png'
}

// Watch for search query changes to open dropdown
watch(searchQuery, (newVal) => {
  if (newVal.trim()) {
    isOpen.value = true
  } else {
    isOpen.value = false
  }
})

const clearSearch = () => {
  searchQuery.value = ''
  isOpen.value = false
}
</script>

<template>
  <div class="relative w-full max-w-md" ref="searchInput">
    <div class="relative">
      <input
        v-model="searchQuery"
        @focus="isOpen = true"
        @keydown.enter="handleSearch"
        type="text"
        placeholder="Rechercher..."
        class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm shadow-sm transition-all duration-300"
      />
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i class="fas fa-search text-gray-400"></i>
      </div>
      <button
        v-if="searchQuery"
        @click="clearSearch"
        class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Dropdown Results -->
    <div
      v-if="isOpen && searchQuery.trim()"
      class="absolute mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-96 overflow-y-auto z-50 divide-y divide-gray-100"
    >
      <div v-if="!hasResults" class="p-4 text-center text-gray-500 text-sm">
        Aucun résultat trouvé pour "{{ searchQuery }}"
        <button @click="handleSearch" class="block w-full mt-2 text-blue-500 hover:underline">
          Voir la page de recherche
        </button>
      </div>

      <div v-if="filteredResults.flash.length > 0">
        <div
          class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0"
        >
          Flashs
        </div>
        <ul>
          <li v-for="item in filteredResults.flash" :key="'flash-' + item.id">
            <button
              @click="navigateTo('/flash', item.id)"
              class="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
            >
              <img
                :src="getItemImage(item, 'flash')"
                :alt="item.title"
                class="w-8 h-8 rounded object-cover border border-gray-200"
              />
              <div>
                <p class="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                  {{ item.title }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ item.categories?.join(', ') }}
                </p>
              </div>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="filteredResults.gallery.length > 0">
        <div
          class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0"
        >
          Galerie
        </div>
        <ul>
          <li v-for="item in filteredResults.gallery" :key="'gallery-' + item.id">
            <button
              @click="navigateTo('/gallery', item.id)"
              class="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
            >
              <img
                :src="getItemImage(item, 'gallery')"
                :alt="item.title"
                class="w-8 h-8 rounded object-cover border border-gray-200"
              />
              <div>
                <p class="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                  {{ item.title }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ item.categories?.join(', ') }}
                </p>
              </div>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="filteredResults.blog.length > 0">
        <div
          class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0"
        >
          Blog
        </div>
        <ul>
          <li v-for="post in filteredResults.blog" :key="'blog-' + post.id">
            <button
              @click="navigateTo(`/article/${post.id}`)"
              class="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
            >
              <img
                :src="getItemImage(post, 'blog')"
                :alt="post.title"
                class="w-8 h-8 rounded object-cover border border-gray-200"
              />
              <div>
                <p class="text-sm font-medium text-gray-800 group-hover:text-blue-600">
                  {{ post.title }}
                </p>
                <p class="text-xs text-gray-500 line-clamp-1">{{ post.excerpt }}</p>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

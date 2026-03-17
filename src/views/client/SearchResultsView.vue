<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFlashStore } from '../../stores/flash'
import { useGalleryStore } from '../../stores/gallery'
import { useBlogStore } from '../../stores/blog'
import { normalizeString } from '../../utils/stringUtils'
import { getImageUrl } from '../../utils/imageUtils'

const route = useRoute()
const router = useRouter()
const flashStore = useFlashStore()
const galleryStore = useGalleryStore()
const blogStore = useBlogStore()

const query = ref('')
const activeTab = ref('all')

onMounted(() => {
  query.value = route.query.q || ''
})

watch(
  () => route.query.q,
  (newVal) => {
    query.value = newVal || ''
  },
)

const results = computed(() => {
  const q = normalizeString(query.value).trim()
  if (!q) return { flash: [], gallery: [], blog: [] }

  return {
    flash: flashStore.flashTattoos.filter(
      (item) =>
        normalizeString(item.title).includes(q) ||
        item.categories?.some((c) => normalizeString(c).includes(q)),
    ),
    gallery: galleryStore.galleryItems.filter(
      (item) =>
        normalizeString(item.title).includes(q) ||
        item.categories?.some((c) => normalizeString(c).includes(q)),
    ),
    blog: blogStore.posts.filter(
      (post) =>
        normalizeString(post.title).includes(q) || normalizeString(post.excerpt).includes(q),
    ),
  }
})

const counts = computed(() => ({
  flash: results.value.flash.length,
  gallery: results.value.gallery.length,
  blog: results.value.blog.length,
  all: results.value.flash.length + results.value.gallery.length + results.value.blog.length,
}))

const getItemImage = (item, type) => {
  if (type === 'flash') return getImageUrl(item.images?.[0]) || '/images/generic_tattoo.png'
  if (type === 'gallery') return getImageUrl(item.images?.[0]) || '/images/generic_tattoo.png'
  if (type === 'blog') return getImageUrl(item.image) || '/images/hero_1.png'
  return '/images/generic_tattoo.png'
}

const navigateTo = (path, id) => {
  if (path === '/flash' || path === '/gallery') {
    router.push({ path, query: { open: id } })
  } else {
    router.push(path)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 pt-32 min-h-screen">
    <h1 class="text-3xl font-bold mb-2 text-gray-800">Résultats de recherche</h1>
    <p class="text-gray-500 mb-8">Pour : "{{ query }}" ({{ counts.all }} résultats)</p>

    <!-- Tabs -->
    <div class="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto pb-2">
      <button
        @click="activeTab = 'all'"
        class="px-4 py-2 font-medium transition-colors whitespace-nowrap"
        :class="
          activeTab === 'all'
            ? 'text-pink-600 border-b-2 border-pink-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Tout ({{ counts.all }})
      </button>
      <button
        @click="activeTab = 'flash'"
        class="px-4 py-2 font-medium transition-colors whitespace-nowrap"
        :class="
          activeTab === 'flash'
            ? 'text-pink-600 border-b-2 border-pink-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Flashs ({{ counts.flash }})
      </button>
      <button
        @click="activeTab = 'gallery'"
        class="px-4 py-2 font-medium transition-colors whitespace-nowrap"
        :class="
          activeTab === 'gallery'
            ? 'text-pink-600 border-b-2 border-pink-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Galerie ({{ counts.gallery }})
      </button>
      <button
        @click="activeTab = 'blog'"
        class="px-4 py-2 font-medium transition-colors whitespace-nowrap"
        :class="
          activeTab === 'blog'
            ? 'text-pink-600 border-b-2 border-pink-600'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        Articles ({{ counts.blog }})
      </button>
    </div>

    <div v-if="counts.all === 0" class="text-center py-16 text-gray-500">
      <i class="fas fa-search text-4xl mb-4 text-gray-300"></i>
      <p>Aucun résultat trouvé pour votre recherche.</p>
      <button @click="router.push('/')" class="mt-4 text-pink-600 hover:underline">
        Retour à l'accueil
      </button>
    </div>

    <div v-else class="space-y-12">
      <!-- Flash Section -->
      <section v-if="(activeTab === 'all' || activeTab === 'flash') && results.flash.length > 0">
        <h2 v-if="activeTab === 'all'" class="text-2xl font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-bolt text-yellow-500"></i> Flashs
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="item in results.flash"
            :key="item.id"
            @click="navigateTo('/flash', item.id)"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          >
            <div class="h-48 overflow-hidden">
              <img
                :src="getItemImage(item, 'flash')"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="p-4">
              <h3 class="font-bold text-gray-800 mb-1 truncate">{{ item.title }}</h3>
              <div class="flex flex-wrap gap-1 mb-2">
                <span
                  v-for="cat in item.categories"
                  :key="cat"
                  class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >{{ cat }}</span
                >
              </div>
              <span class="text-pink-600 font-bold">{{ item.price }}€</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Gallery Section -->
      <section
        v-if="(activeTab === 'all' || activeTab === 'gallery') && results.gallery.length > 0"
      >
        <h2 v-if="activeTab === 'all'" class="text-2xl font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-images text-purple-500"></i> Galerie
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="item in results.gallery"
            :key="item.id"
            @click="navigateTo('/gallery', item.id)"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
          >
            <div class="h-48 overflow-hidden">
              <img
                :src="getItemImage(item, 'gallery')"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="p-4">
              <h3 class="font-bold text-gray-800 mb-1 truncate">{{ item.title }}</h3>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="cat in item.categories"
                  :key="cat"
                  class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >{{ cat }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Blog Section -->
      <section v-if="(activeTab === 'all' || activeTab === 'blog') && results.blog.length > 0">
        <h2 v-if="activeTab === 'all'" class="text-2xl font-bold mb-4 flex items-center gap-2">
          <i class="fas fa-newspaper text-blue-500"></i> Articles
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="item in results.blog"
            :key="item.id"
            @click="navigateTo(`/blog/${item.id}`)"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col sm:flex-row h-full"
          >
            <div class="sm:w-1/3 h-48 sm:h-auto overflow-hidden">
              <img
                :src="getItemImage(item, 'blog')"
                :alt="item.title"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <h3 class="font-bold text-lg text-gray-800 mb-2">{{ item.title }}</h3>
              <p class="text-sm text-gray-500 mb-auto line-clamp-3">{{ item.excerpt }}</p>
              <span class="text-xs text-gray-400 mt-4">{{
                new Date(item.created_at).toLocaleDateString()
              }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

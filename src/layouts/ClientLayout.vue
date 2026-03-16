<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useInfoStore } from '../stores/info'
import { usePromoStore } from '../stores/promo'
import { useNotificationStore } from '../stores/notification'
import { useBlogStore } from '../stores/blog'
import ToastContainer from '../components/ui/ToastContainer.vue'

const route = useRoute()
const infoStore = useInfoStore()
const promoStore = usePromoStore()
const blogStore = useBlogStore()
const notificationStore = useNotificationStore()
const mobileMenuOpen = ref(false)

onMounted(() => {
  promoStore.fetchActiveGlobalPromo()
})

const tabs = [
  { id: 'home', name: 'Accueil', path: '/' },
  { id: 'about', name: 'À propos', path: '/about' },
  { id: 'flash', name: 'Flashs', path: '/flash' },
  { id: 'gallery', name: 'Galerie', path: '/gallery' },
  { id: 'process', name: 'Fonctionnement', path: '/process' },
  { id: 'blog', name: 'Blog', path: '/blog' },
  { id: 'contact', name: 'Contact', path: '/contact' },
]

const isActive = (path) => {
  return route.path === path
}

const isHome = computed(() => route.path === '/')

const mainPaddingClass = computed(() => {
  if (isHome.value) {
    return 'pt-[76px]' // Padding equal to navbar height (approx)
  }
  return 'pt-24' // Reduced from pt-32 for other pages
})

const visibleTabs = computed(() => {
  return tabs.filter((tab) => {
    if (tab.id === 'blog') {
      return blogStore.posts.length > 0
    }
    return true
  })
})
</script>

<script>
import GlobalSearch from '../components/client/GlobalSearch.vue'
export default {
  components: {
    GlobalSearch,
  },
}
</script>

<template>
  <div class="min-h-screen bg-fuchsia-50 flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 bg-fuchsia-100 shadow-sm z-50">
      <!-- Promo Banner -->
      <div
        v-if="promoStore.activePromo"
        class="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center py-3 text-sm"
      >
        <div class="animate-pulse font-bold">
          🎨 {{ promoStore.activePromo.name }} : {{ promoStore.activePromo.discount_percent }}% de
          réduction ! 🎨
        </div>
      </div>
      <nav class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <RouterLink to="/" class="text-2xl font-bold text-gray-800">VanelyTattoo</RouterLink>
        </div>
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <RouterLink
            v-for="tab in visibleTabs"
            :key="tab.id"
            :to="tab.path"
            class="transition-colors py-2 whitespace-nowrap"
            :class="[
              isActive(tab.path)
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-gray-700 hover:text-pink-600',
            ]"
          >
            {{ tab.name }}
          </RouterLink>
          <RouterLink
            to="/booking"
            class="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors !rounded-button whitespace-nowrap"
          >
            Réserver
          </RouterLink>
        </div>
        <!-- Search Bar -->
        <div class="hidden md:flex items-center relative w-64">
          <GlobalSearch />
        </div>
        <!-- Mobile Menu Button -->
        <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden cursor-pointer">
          <i class="fas fa-bars text-xl"></i>
        </button>
      </nav>
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t">
        <div class="px-4 py-2">
          <GlobalSearch />
        </div>
        <div class="flex flex-col">
          <RouterLink
            v-for="tab in visibleTabs"
            :key="tab.id"
            :to="tab.path"
            @click="mobileMenuOpen = false"
            class="text-left px-4 py-3 cursor-pointer whitespace-nowrap"
            :class="[
              isActive(tab.path) ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50',
            ]"
          >
            {{ tab.name }}
          </RouterLink>
          <RouterLink
            to="/booking"
            @click="mobileMenuOpen = false"
            class="text-left px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap font-bold text-pink-600"
          >
            Réserver
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main :class="['flex-grow', mainPaddingClass]">
      <RouterView />
    </main>

    <ToastContainer />

    <!-- Expanded Footer (Compact) -->
    <footer class="bg-gray-900 text-white pt-10 pb-6 mt-auto text-sm">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <!-- Column 1: Brand & Address -->
          <div>
            <h3 class="text-xl font-bold mb-4">VanelyTattoo</h3>
            <div class="text-gray-400 space-y-2">
              <p class="flex items-start">
                <i class="fas fa-map-marker-alt mt-1 mr-3 text-pink-500"></i>
                <span>
                  <a
                    :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      infoStore.generalInfo.address,
                    )}`"
                    target="_blank"
                    class="hover:text-white transition-colors"
                  >
                    {{ infoStore.generalInfo.address }}
                  </a>
                </span>
              </p>
              <p class="flex items-center">
                <i class="fas fa-phone mr-3 text-pink-500"></i>
                <a
                  :href="`tel:${infoStore.generalInfo.phone}`"
                  class="hover:text-white transition-colors"
                  >{{ infoStore.generalInfo.phone }}</a
                >
              </p>
              <p class="flex items-center">
                <i class="fas fa-envelope mr-3 text-pink-500"></i>
                <a
                  :href="`mailto:${infoStore.generalInfo.email}`"
                  class="hover:text-white transition-colors"
                  >{{ infoStore.generalInfo.email }}</a
                >
              </p>
            </div>
          </div>

          <!-- Column 2: Sitemap -->
          <div>
            <h4 class="text-base font-bold mb-4 border-b border-gray-700 pb-2">Plan du site</h4>
            <ul class="grid grid-cols-2 gap-x-2 gap-y-2">
              <li v-for="tab in visibleTabs" :key="tab.id">
                <RouterLink
                  :to="tab.path"
                  class="text-gray-400 hover:text-pink-400 transition-colors flex items-center whitespace-nowrap"
                >
                  <i class="fas fa-chevron-right text-[10px] mr-2 text-gray-600"></i>
                  {{ tab.name }}
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Column 3: Legal -->
          <div>
            <h4 class="text-base font-bold mb-4 border-b border-gray-700 pb-2">Informations</h4>
            <ul class="space-y-1">
              <li>
                <RouterLink
                  to="/mentions-legales"
                  class="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Mentions Légales
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/cgv" class="text-gray-400 hover:text-pink-400 transition-colors">
                  Conditions Générales de Vente
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/confidentialite"
                  class="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  Politique de Confidentialité
                </RouterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-base font-bold mb-4 border-b border-gray-700 pb-2">Horaires</h4>
            <div class="text-gray-400 text-xs space-y-2">
              <div
                v-for="(group, index) in infoStore.groupedOpeningHours"
                :key="index"
                class="flex flex-col space-y-0.5"
              >
                <span class="text-white font-semibold">{{ group.label }} :</span>
                <span class="pl-2 border-l border-gray-700 ml-1">{{ group.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-gray-800 pt-6 text-center text-gray-500 text-xs">
          <p>&copy; 2025 VanelyTattoo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

    <!-- Floating Social Sidebar -->
    <div class="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 flex flex-col space-y-2 mr-2">
      <a
        v-if="infoStore.socials.facebook"
        :href="infoStore.socials.facebook"
        target="_blank"
        class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
        title="Facebook"
      >
        <i class="fab fa-facebook-f"></i>
      </a>
      <a
        v-if="infoStore.socials.instagram"
        :href="infoStore.socials.instagram"
        target="_blank"
        class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
        title="Instagram"
      >
        <i class="fab fa-instagram"></i>
      </a>
      <a
        v-if="infoStore.socials.tiktok"
        :href="infoStore.socials.tiktok"
        target="_blank"
        class="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg border border-gray-800"
        title="TikTok"
      >
        <i class="fab fa-tiktok"></i>
      </a>
    </div>
  </div>
</template>

<style>
/* Global style to prevent layout shift */
html {
  scrollbar-gutter: stable;
  scroll-behavior: smooth;
}
</style>

<style scoped>
.\!rounded-button {
  border-radius: 9999px;
}
</style>

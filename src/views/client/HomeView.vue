<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBannerStore } from '../../stores/banner'
import { useFlashStore } from '../../stores/flash'
import { useBlogStore } from '../../stores/blog'
import { usePromoStore } from '../../stores/promo'
import { getImageUrl } from '../../utils/imageUtils'

const router = useRouter()
const bannerStore = useBannerStore()
const flashStore = useFlashStore()
const blogStore = useBlogStore()
const promoStore = usePromoStore()

// Carousel Data
const currentSlide = ref(0)
const heroSlides = computed(() => {
  const activeBanners = bannerStore.banners ? bannerStore.banners.filter((b) => b.active) : []

  if (activeBanners.length === 0) {
    return [
      {
        id: 'default',
        image: '/images/default_banner.png',
        title: 'Découvrez nos Flashs',
        description: 'Explorez une sélection unique de tatouages prêts à être réalisés.',
        buttonText: 'Voir la collection',
        link: '/flash',
        color: 'from-gray-100 to-gray-200',
      },
    ]
  }

  return activeBanners.map((slide, index) => ({
    id: slide.id,
    image: getImageUrl(slide.image_url),
    title: slide.title,
    description: slide.description,
    buttonText: slide.button_text || 'Découvrir',
    link: slide.button_link || '/contact',
    color: index % 2 === 0 ? 'from-pink-100 to-blue-100' : 'from-purple-100 to-pink-100',
  }))
})

// Carousel Logic
let carouselInterval
const nextSlide = () => {
  if (heroSlides.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % heroSlides.value.length
}
const prevSlide = () => {
  if (heroSlides.value.length === 0) return
  currentSlide.value = (currentSlide.value - 1 + heroSlides.value.length) % heroSlides.value.length
}
const goToSlide = (index) => {
  currentSlide.value = index
}

onMounted(async () => {
  // SEO: JSON-LD
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Vanely Tattoo',
    image: window.location.origin + '/logo.png',
    description: 'Studio de tatouage artistique situé à Lyon et ses alentours.',
    url: window.location.origin,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lyon',
      addressRegion: 'Auvergne-Rhône-Alpes',
      addressCountry: 'FR',
    },
    priceRange: '$$',
  }
  const script = document.createElement('script')
  script.id = 'json-ld-home'
  script.type = 'application/ld+json'
  script.text = JSON.stringify(schema)
  document.head.appendChild(script)

  // SEO: Meta Description
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      'Studio de tatouage à Lyon et alentours. Découvrez mes flashs et projets personnalisés. Tatoueuse passionnée à votre écoute.',
    )
  }

  await Promise.all([
    bannerStore.fetchBanners(),
    flashStore.fetchFlashTattoos(),
    blogStore.fetchPosts(),
    promoStore.fetchPromotions(),
    promoStore.fetchActiveGlobalPromo(),
  ])

  if (heroSlides.value.length > 0) {
    carouselInterval = setInterval(nextSlide, 5000)
  }
})

watch(heroSlides, (newVal) => {
  if (newVal.length > 0 && !carouselInterval) {
    carouselInterval = setInterval(nextSlide, 5000)
  }
})

onUnmounted(() => {
  if (carouselInterval) clearInterval(carouselInterval)
  const script = document.getElementById('json-ld-home')
  if (script) script.remove()
})

// Real data from stores
const highlightedFlashes = computed(() => {
  return flashStore.flashTattoos
    .filter((t) => t.is_featured && t.status === 'active')
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || 'Coup de coeur du moment',
      image: t.images && t.images.length > 0 ? getImageUrl(t.images[0]) : '/images/generic_tattoo.png',
      price: t.price,
      promoPrice: t.promo_price, // Optional display
    }))
})

const featuredWorks = computed(() => {
  return flashStore.flashTattoos
    .filter((t) => t.status === 'active')
    .slice(0, 3)
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || 'Nouveau flash disponible',
      image: t.images && t.images.length > 0 ? getImageUrl(t.images[0]) : '/images/generic_tattoo.png',
    }))
})

const promoWorks = computed(() => {
  return flashStore.flashTattoos
    .filter((t) => {
      if (t.status !== 'active') return false
      const currentPrice = promoStore.getDiscountedPrice(t.price, t.id, t.discount)
      const referencePrice = t.original_price || t.price
      return currentPrice < referencePrice
    })
    .slice(0, 3)
    .map((t) => ({
      id: t.id,
      title: t.title,
      price: t.price,
      discountedPrice: promoStore.getDiscountedPrice(t.price, t.id, t.discount),
      image: t.images && t.images.length > 0 ? getImageUrl(t.images[0]) : '/images/generic_tattoo.png',
    }))
})

const latestPosts = computed(() => {
  return blogStore.posts
    .filter((p) => p.status === 'published')
    .slice(0, 2)
    .map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt || (p.content ? p.content.substring(0, 100) + '...' : ''),
      date: p.date,
      image: p.image?.[0] ? getImageUrl(p.image) : (p.image ? getImageUrl(p.image) : '/images/hero_1.png'),
    }))
})
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Carousel -->
    <section class="relative h-[500px] overflow-hidden group">
      <div
        v-if="bannerStore.loading"
        class="absolute inset-0 flex items-center justify-center bg-gray-100"
      >
        <p>Chargement du carrousel...</p>
      </div>

      <div
        v-else
        v-for="(slide, index) in heroSlides"
        :key="slide.id"
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        :class="[
          currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0',
          `bg-gradient-to-r ${slide.color}`,
        ]"
      >
        <div class="absolute inset-0">
          <img
            :src="slide.image"
            :alt="slide.title"
            class="w-full h-full object-cover object-top"
          />
          <div
            class="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent"
          ></div>
        </div>
        <div class="relative container mx-auto px-4 h-full flex items-center">
          <div
            class="max-w-xl transition-all duration-700 transform"
            :class="
              currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            "
          >
            <h2 class="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              {{ slide.title }}
            </h2>
            <p class="text-xl text-gray-700 mb-8 max-w-lg">
              {{ slide.description }}
            </p>
            <button
              @click="router.push(slide.link)"
              class="bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg !rounded-button cursor-pointer whitespace-nowrap text-lg font-medium"
            >
              {{ slide.buttonText }}
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <button
        v-if="heroSlides.length > 1"
        @click="prevSlide"
        class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white p-3 rounded-full shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100"
      >
        <i class="fas fa-chevron-left text-xl"></i>
      </button>
      <button
        v-if="heroSlides.length > 1"
        @click="nextSlide"
        class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/50 hover:bg-white p-3 rounded-full shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100"
      >
        <i class="fas fa-chevron-right text-xl"></i>
      </button>

      <!-- Indicators -->
      <div
        v-if="heroSlides.length > 1"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3"
      >
        <button
          v-for="(slide, index) in heroSlides"
          :key="slide.id"
          @click="goToSlide(index)"
          class="w-3 h-3 rounded-full transition-all duration-300 shadow-sm"
          :class="currentSlide === index ? 'bg-gray-900 w-8' : 'bg-white hover:bg-gray-200'"
        ></button>
      </div>
    </section>

    <!-- SEO H1 Section -->
    <section class="container mx-auto px-4 pt-8 text-center">
      <h1 class="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
        Vanely Tattoo - Studio de Tatouage à Lyon et alentours
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Découvrez un univers artistique unique où chaque tatouage raconte une histoire.
      </p>
    </section>

    <!-- Featured / Coups de Coeur Section -->
    <section v-if="highlightedFlashes.length > 0" class="container mx-auto px-4">
      <div class="flex items-center justify-center gap-3 mb-12">
        <i class="fas fa-heart text-pink-600 text-2xl animate-pulse"></i>
        <h2 class="text-3xl font-bold text-center text-gray-800">Coups de Coeur</h2>
        <i class="fas fa-heart text-pink-600 text-2xl animate-pulse"></i>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="work in highlightedFlashes"
          :key="'highlight-' + work.id"
          @click="router.push({ path: '/flash', query: { open: work.id } })"
          class="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border-2 border-pink-100"
        >
          <div class="overflow-hidden h-72 relative">
            <div
              class="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm text-pink-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1"
            >
              <i class="fas fa-star text-yellow-400"></i>
              Sélection
            </div>
            <img
              :src="work.image"
              :alt="work.title"
              class="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6"
            >
              <span class="text-white font-bold text-lg"
                >Voir le détail <i class="fas fa-arrow-right ml-2"></i
              ></span>
            </div>
          </div>
          <div class="p-6 text-center">
            <h3
              class="text-xl font-bold mb-2 text-gray-800 group-hover:text-pink-600 transition-colors"
            >
              {{ work.title }}
            </h3>
            <p class="text-gray-500 text-sm line-clamp-2">{{ work.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Work -->
    <section v-if="featuredWorks.length > 0" class="container mx-auto px-4">
      <div class="flex items-center justify-between mb-8 px-2 border-b border-gray-100 pb-4">
        <h2 class="text-3xl font-bold text-gray-800">Les nouveaux flashs</h2>
        <a
          @click.prevent="router.push('/flash')"
          href="#"
          class="text-pink-600 hover:text-pink-700 font-bold flex items-center gap-2 group transition-colors"
        >
          Voir tout
          <i
            class="fas fa-arrow-right transform group-hover:translate-x-1 transition-transform"
          ></i>
        </a>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="work in featuredWorks"
          :key="work.id"
          @click="router.push({ path: '/flash', query: { open: work.id } })"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
        >
          <div class="overflow-hidden">
            <img
              :src="work.image"
              :alt="work.title"
              class="w-full h-64 object-cover object-top transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">
              {{ work.title }}
            </h3>
            <p class="text-gray-600 line-clamp-2">{{ work.description }}</p>
          </div>
        </div>
      </div>
      <div class="text-center mt-12">
        <button
          @click="router.push('/flash')"
          class="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all font-bold shadow-lg cursor-pointer transform hover:scale-105"
        >
          Voir tous les flashs
        </button>
      </div>
    </section>

    <!-- Promotions Section -->
    <section v-if="promoWorks.length > 0" class="bg-red-50 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">En promo</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="work in promoWorks"
            :key="work.id"
            @click="router.push({ path: '/flash', query: { open: work.id } })"
            class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group relative"
          >
            <div
              class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold z-10 animate-pulse"
            >
              PROMO
            </div>
            <div class="overflow-hidden">
              <img
                :src="work.image"
                :alt="work.title"
                class="w-full h-64 object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2 group-hover:text-red-600 transition-colors">
                {{ work.title }}
              </h3>
              <div class="flex items-center space-x-3">
                <span class="text-gray-400 line-through">{{ work.price }}€</span>
                <span class="text-2xl font-bold text-red-600">{{ work.discountedPrice }}€</span>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-12">
          <button
            @click="router.push({ path: '/flash', query: { filter: 'promo' } })"
            class="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-all font-bold shadow-lg cursor-pointer"
          >
            Voir toutes les promos
          </button>
        </div>
      </div>
    </section>

    <!-- Latest Blog Posts -->
    <section class="container mx-auto px-4 pb-16">
      <h2 class="text-3xl font-bold text-center mb-12">Dernières nouvelles</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <article
          v-for="post in latestPosts"
          :key="post.id"
          @click="router.push({ name: 'article', params: { id: post.id } })"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
        >
          <div class="overflow-hidden h-64">
            <img
              :src="post.image"
              :alt="post.title"
              class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div class="p-6">
            <h3 class="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors">
              {{ post.title }}
            </h3>
            <p class="text-gray-600 mb-4 line-clamp-2">{{ post.excerpt }}</p>
            <span class="text-sm text-blue-400 font-medium">{{ post.date }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.\!rounded-button {
  border-radius: 9999px;
}
</style>

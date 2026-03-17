<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '@/stores/blog'
import { getImageUrl } from '@/utils/imageUtils'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()
const post = ref(null)

const loading = ref(true)

onMounted(async () => {
  const id = parseInt(route.params.id)

  // If posts are not loaded, fetch them first
  if (blogStore.posts.length === 0) {
    await blogStore.fetchPosts()
  }

  post.value = blogStore.getPostById(id)
  loading.value = false

  if (post.value) {
    // SEO: Dynamic Meta
    if (post.value.title) {
      document.title = `${post.value.title} | Blog Vanely Tattoo`
    }
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        post.value.excerpt ||
          `Découvrez l'article ${post.value.title} sur le blog de Vanely Tattoo.`,
      )
    }
  }
})
</script>

<template>
  <div class="min-h-screen py-10 bg-gray-50">
    <div v-if="loading" class="container mx-auto px-4 py-20 text-center">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"
      ></div>
      <p class="text-gray-500">Chargement de l'article...</p>
    </div>

    <div v-else-if="post" class="container mx-auto px-4 max-w-4xl">
      <button
        @click="router.back()"
        class="mb-8 flex items-center text-gray-600 hover:text-blue-500 transition-colors"
      >
        <span class="mr-2">←</span> Retour
      </button>

      <article class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="h-64 md:h-96 relative">
          <img :src="getImageUrl(post.image)" :alt="post.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-8 text-white">
            <span class="text-blue-200 font-medium mb-2 block">{{ post.date }}</span>
            <h1 class="text-4xl md:text-5xl font-bold font-display">{{ post.title }}</h1>
          </div>
        </div>

        <div class="p-8 md:p-12">
          <div class="prose prose-lg max-w-none prose-pink prose-img:rounded-xl">
            <div v-html="post.content"></div>
          </div>

          <!-- Internal Link / CTA -->
          <div class="mt-12 pt-8 border-t border-gray-100 text-center not-prose">
            <h3 class="text-xl font-bold mb-4 text-gray-800">Envie d'un tatouage ?</h3>
            <router-link
              to="/flash"
              class="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg inline-block font-bold"
            >
              Voir mes flashs
            </router-link>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="container mx-auto px-4 py-10 text-center">
      <h2 class="text-2xl font-bold text-gray-700">Article non trouvé</h2>
      <button @click="router.push('/blog')" class="mt-4 text-blue-500 hover:underline">
        Retour au blog
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles if needed, tailwind typography plugin handles prose */
</style>

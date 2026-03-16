<script setup>
import { onMounted } from 'vue'
import { useBlogStore } from '@/stores/blog'
import { useRouter } from 'vue-router'

const router = useRouter()
const blogStore = useBlogStore()
const { posts } = blogStore

onMounted(() => {
  const metaDesc = document.querySelector('meta[name="description"]')
  if (metaDesc) {
    metaDesc.setAttribute(
      'content',
      'Lisez le blog de Vanely Tattoo. Conseils soins, histoire du tatouage et actualités du studio à Lyon.',
    )
  }
})

const goToArticle = (id) => {
  router.push({ name: 'article', params: { id } })
}
</script>

<template>
  <div class="min-h-screen py-8 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
          Blog Vanely Tattoo - Conseils & Actualités
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Découvrez nos derniers articles, conseils et actualités sur l'univers du tatouage.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article
          v-for="post in posts"
          :key="post.id"
          class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
          @click="goToArticle(post.id)"
        >
          <div class="h-48 overflow-hidden">
            <img
              :src="post.image"
              :alt="post.title"
              class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div class="p-6">
            <span class="text-blue-500 text-sm font-medium mb-2 block">{{ post.date }}</span>
            <h2
              class="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-500 transition-colors"
            >
              {{ post.title }}
            </h2>
            <p class="text-gray-600 line-clamp-3">
              {{ post.excerpt || post.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' }}
            </p>
            <div class="mt-4 flex items-center text-blue-500 font-medium">
              Lire l'article
              <i class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

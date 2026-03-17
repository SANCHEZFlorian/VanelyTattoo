<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBlogStore } from '../../stores/blog'
import { useFlashStore } from '../../stores/flash'
import api from '@/lib/api'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseFileUpload from '../../components/ui/BaseFileUpload.vue'
import { useNotificationStore } from '../../stores/notification'
import { getImageUrl } from '../../utils/imageUtils'

const router = useRouter()
const route = useRoute()
const blogStore = useBlogStore()
const flashStore = useFlashStore()
const notificationStore = useNotificationStore()

const isEditing = ref(false)
const loading = ref(false)
const showFlashModal = ref(false)

const formData = ref({
  id: null,
  title: '',
  excerpt: '',
  content: '',
  image: '',
  author: 'Admin',
  date: new Date().toISOString().split('T')[0],
  status: 'draft',
})

// CTA options
const ctaConfig = ref({
  enabled: false,
  text: 'Réserver un tatouage',
  link: '/flash',
  description: 'Envie de passer sous mes aiguilles ?',
})

// Initialize
onMounted(async () => {
  // Ensure potential dependencies
  if (flashStore.flashTattoos.length === 0) {
    await flashStore.fetchFlashTattoos()
  }

  const id = route.params.id
  if (id) {
    isEditing.value = true
    const post = blogStore.getPostById(parseInt(id))
    if (post) {
      formData.value = { ...post }
      // Attempt to parse CTA from content or metadata if stored separately
      // For now, we assume standard layout or manual insertion.
      // If we want "CTA Configuration" as a specific feature, we might need a separate column in DB or just append it to content on save.
      // Let's treat it as an "Append on Save" or "Preview" feature
    } else {
      // Fallback fetch if deep link
      await blogStore.fetchPosts()
      const fetched = blogStore.getPostById(parseInt(id))
      if (fetched) formData.value = { ...fetched }
    }
  }
})

// Helpers for Editor
const insertTag = (tag) => {
  const textarea = document.getElementById('content-editor')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = formData.value.content
  const before = text.substring(0, start)
  const after = text.substring(end, text.length)
  const selection = text.substring(start, end)

  let insertion = ''
  if (tag === 'b') insertion = `<strong>${selection || 'Gras'}</strong>`
  if (tag === 'i') insertion = `<em>${selection || 'Italique'}</em>`
  if (tag === 'h2')
    insertion = `\n<h2 class="text-2xl font-bold mt-4 mb-2">${selection || 'Titre 2'}</h2>\n`
  if (tag === 'h3')
    insertion = `\n<h3 class="text-xl font-bold mt-3 mb-1">${selection || 'Titre 3'}</h3>\n`
  if (tag === 'li')
    insertion = `\n<ul class="list-disc pl-5 py-2">\n  <li>${selection || 'Liste'}</li>\n</ul>\n`

  formData.value.content = before + insertion + after
}

const insertFlash = (flash) => {
  const cardHtml = `
<div class="my-6 p-4 border border-purple-100 rounded-xl bg-purple-50 flex flex-col md:flex-row gap-4 items-center not-prose">
  <img src="${getImageUrl(flash.images[0])}" alt="${flash.title}" class="w-32 h-32 object-cover rounded-lg shadow-sm" />
  <div class="flex-1 text-center md:text-left">
    <h4 class="font-bold text-lg text-gray-800">${flash.title}</h4>
    <p class="text-sm text-gray-600 mb-2">${flash.categories.join(', ')}</p>
    <a href="/flash?open=${flash.id}" class="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors">
      Voir ce flash
    </a>
  </div>
</div>
`
  const textarea = document.getElementById('content-editor')
  const start = textarea ? textarea.selectionStart : formData.value.content.length

  const text = formData.value.content
  formData.value.content = text.substring(0, start) + cardHtml + text.substring(start)
  showFlashModal.value = false
}

const previewContent = computed(() => {
  let html = formData.value.content

  // Auto-append CTA if enabled
  if (ctaConfig.value.enabled) {
    html += `
<div class="mt-12 pt-8 border-t border-gray-100 text-center not-prose">
    <h3 class="text-xl font-bold mb-4 text-gray-800">${ctaConfig.value.description}</h3>
    <a
        href="${ctaConfig.value.link}"
        class="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg inline-block font-bold"
    >
        ${ctaConfig.value.text}
    </a>
</div>
`
  }
  return html
})

const savePost = async () => {
  loading.value = true
  try {
    let finalImageUrl = formData.value.image

    if (
      formData.value.image &&
      typeof formData.value.image === 'object' &&
      formData.value.image.file
    ) {
      const file = formData.value.image.file
      const uploadData = new FormData()
      uploadData.append('image', file)

      const { data: uploadRes } = await api.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      finalImageUrl = uploadRes.url
    } else if (
      formData.value.image &&
      typeof formData.value.image === 'object' &&
      formData.value.image.url
    ) {
      finalImageUrl = formData.value.image.url
    }

    // Merge CTA into content PERMANENTLY on save? Or keep separate?
    // Simplicity: Merge it.
    // Wait, if we edit again, we duplicate it.
    // Better: Don't merge, just rely on the editor content. The CTA config is just a helper to Generate Snippet.
    // Let's add a "Insert CTA" button instead of auto-append on save.

    const postData = { ...formData.value, image: finalImageUrl }

    if (postData.id) {
      await blogStore.updatePost(postData.id, postData)
    } else {
      delete postData.id
      await blogStore.addPost(postData)
    }
    notificationStore.addNotification('Succès', 'Article enregistré', 'success')
    router.push('/admin/blog')
  } catch (e) {
    console.error(e)
    notificationStore.addNotification('Erreur', "Impossible d'enregistrer", 'error')
  } finally {
    loading.value = false
  }
}

const insertCTA = () => {
  const ctaHtml = `
<div class="mt-8 pt-6 border-t border-gray-100 text-center not-prose">
    <h3 class="text-lg font-bold mb-3 text-gray-800">${ctaConfig.value.description}</h3>
    <a href="${ctaConfig.value.link}" class="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all shadow-md inline-block font-bold text-sm">
        ${ctaConfig.value.text}
    </a>
</div>
`
  formData.value.content += ctaHtml
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-100px)]">
    <!-- Toolbar -->
    <div class="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm">
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="text-gray-500 hover:text-gray-800">
          <i class="fas fa-arrow-left"></i>
        </button>
        <h1 class="text-xl font-bold text-gray-800">
          {{ isEditing ? 'Modifier Article' : 'Nouvel Article' }}
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="formData.status"
          class="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-purple-500"
        >
          <option value="draft">Brouillon</option>
          <option value="published">Publié</option>
        </select>
        <button
          @click="savePost"
          :disabled="loading"
          class="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else>Enregistrer</span>
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Settings & Editor -->
      <div class="w-1/2 flex flex-col border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <!-- Metadata Section -->
        <div class="p-6 space-y-4 bg-white border-b border-gray-100">
          <BaseInput
            v-model="formData.title"
            label="Titre Principal"
            placeholder="Mon super article..."
          />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="formData.date" type="date" label="Date de publication" />
            <BaseInput v-model="formData.author" label="Auteur" />
          </div>
          <BaseFileUpload v-model="formData.image" label="Image de Couverture" :multiple="false" />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Extrait (SEO Description)</label
            >
            <textarea
              v-model="formData.excerpt"
              rows="2"
              class="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 text-sm"
            ></textarea>
          </div>
        </div>

        <!-- Toolbar -->
        <div
          class="px-4 py-2 bg-gray-100 border-b border-gray-200 flex flex-wrap gap-2 sticky top-0 z-10"
        >
          <button @click="insertTag('b')" class="p-2 hover:bg-white rounded" title="Gras">
            <i class="fas fa-bold"></i>
          </button>
          <button @click="insertTag('i')" class="p-2 hover:bg-white rounded" title="Italique">
            <i class="fas fa-italic"></i>
          </button>
          <div class="w-px h-6 bg-gray-300 mx-1"></div>
          <button @click="insertTag('h2')" class="p-2 hover:bg-white rounded font-bold text-sm">
            H2
          </button>
          <button @click="insertTag('h3')" class="p-2 hover:bg-white rounded font-bold text-xs">
            H3
          </button>
          <button @click="insertTag('li')" class="p-2 hover:bg-white rounded">
            <i class="fas fa-list-ul"></i>
          </button>
          <div class="w-px h-6 bg-gray-300 mx-1"></div>
          <button
            @click="showFlashModal = true"
            class="p-2 hover:bg-white rounded flex items-center gap-1 text-purple-600 font-medium text-xs bg-purple-50 border border-purple-100"
          >
            <i class="fas fa-bolt"></i> Lier Flash
          </button>
        </div>

        <!-- Content Editor -->
        <div class="flex-1 p-4 bg-white min-h-[500px]">
          <textarea
            id="content-editor"
            v-model="formData.content"
            class="w-full h-full p-4 outline-none resize-none font-mono text-sm leading-relaxed"
            placeholder="Commencez à rédiger votre article... (HTML supporté)"
          ></textarea>
        </div>

        <!-- CTA Configuration -->
        <div class="p-6 bg-purple-50 border-t border-purple-100">
          <h3 class="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
            <i class="fas fa-bullhorn"></i> Configuration CTA
          </h3>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <input
              v-model="ctaConfig.text"
              placeholder="Texte du bouton"
              class="border rounded p-2 text-sm"
            />
            <input
              v-model="ctaConfig.link"
              placeholder="Lien (/flash, /contact...)"
              class="border rounded p-2 text-sm"
            />
          </div>
          <input
            v-model="ctaConfig.description"
            placeholder="Phrase d'accroche"
            class="w-full border rounded p-2 text-sm mb-3"
          />
          <button
            @click="insertCTA"
            class="w-full bg-white border border-purple-200 text-purple-700 py-2 rounded-lg text-sm font-semibold hover:bg-purple-100 shadow-sm"
          >
            Insérer le bloc CTA en bas
          </button>
        </div>
      </div>

      <!-- Right: Real-time Preview -->
      <div class="w-1/2 bg-gray-100 overflow-y-auto p-8 relative">
        <div
          class="absolute top-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50 uppercase tracking-widest"
        >
          Aperçu
        </div>
        <div class="bg-white rounded-2xl shadow-xl min-h-[800px] overflow-hidden">
          <!-- Fake Hero -->
          <div class="h-48 relative bg-gray-200">
            <img
              v-if="formData.image"
              :src="getImageUrl(formData.image.url || formData.image)"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute bottom-0 left-0 p-6 text-white bg-gradient-to-t from-black/60 to-transparent w-full"
            >
              <h1 class="text-2xl font-bold">{{ formData.title || "Titre de l'article" }}</h1>
            </div>
          </div>
          <!-- Content -->
          <div class="p-8 prose prose-purple max-w-none">
            <div v-html="previewContent"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flash Selection Modal -->
    <div
      v-if="showFlashModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="showFlashModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 class="font-bold text-gray-800">Sélectionner un Flash à intégrer</h3>
          <button @click="showFlashModal = false" class="text-gray-500 hover:text-gray-800">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4">
          <div
            v-for="flash in flashStore.flashTattoos"
            :key="flash.id"
            class="border rounded-lg overflow-hidden cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
            @click="insertFlash(flash)"
          >
            <img :src="getImageUrl(flash.images[0])" class="w-full h-32 object-cover" />
            <div class="p-2">
              <p class="font-medium text-sm truncate">{{ flash.title }}</p>
              <p class="text-xs text-gray-500">{{ flash.price }}€</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar polish */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
textarea {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}
</style>

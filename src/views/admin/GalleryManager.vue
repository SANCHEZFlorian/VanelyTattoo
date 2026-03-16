<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/lib/api'
import { useRouter, useRoute } from 'vue-router'
import { useGalleryStore } from '../../stores/gallery'
import { useFlashStore } from '../../stores/flash'
import { useCategoryStore } from '../../stores/category'
import { useBookingStore } from '../../stores/booking'
import { useNotificationStore } from '../../stores/notification'
import { useI18n } from 'vue-i18n'
import BaseModal from '../../components/ui/BaseModal.vue'
import CategoryManager from '../../components/admin/CategoryManager.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseFileUpload from '../../components/ui/BaseFileUpload.vue'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import { usePagination } from '../../composables/usePagination'
import { normalizeString } from '../../utils/stringUtils'

const router = useRouter()
const route = useRoute()
const galleryStore = useGalleryStore()
const flashStore = useFlashStore()
const categoryStore = useCategoryStore()
const bookingStore = useBookingStore()
const notificationStore = useNotificationStore()
const { t } = useI18n()

const search = ref('')
const categoryFilter = ref('')
const showModal = ref(false)
const showCategoryModal = ref(false)
const isEditing = ref(false)
const newCategory = ref('')
const uploading = ref(false)

// Confirm Modal state
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  type: 'danger',
  action: null,
})

const openConfirmModal = (title, message, type, action) => {
  confirmModal.value = { isOpen: true, title, message, type, action }
}

const handleConfirm = () => {
  if (confirmModal.value.action) confirmModal.value.action()
  confirmModal.value.isOpen = false
}

// Flash Linking State
const flashSearch = ref('')
const showFlashResults = ref(false)

const formData = ref({
  id: null,
  title: '',
  description: '', // Added description
  categories: [],
  images: [],
  status: 'active',
  flashId: null, // Added flashId
  flashData: null, // Store full flash data for display
  price: null,
})

const sortKey = ref('title')
const sortOrder = ref('asc') // 'asc' | 'desc' | null

const sortBy = (key) => {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') sortOrder.value = 'desc'
    else if (sortOrder.value === 'desc') sortOrder.value = null
    else sortOrder.value = 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const getSortIcon = (key) => {
  if (sortKey.value !== key) return 'fas fa-sort text-gray-300'
  if (sortOrder.value === 'asc') return 'fas fa-sort-up text-purple-600'
  if (sortOrder.value === 'desc') return 'fas fa-sort-down text-purple-600'
  return 'fas fa-sort text-gray-300'
}

const filteredItems = computed(() => {
  let items = galleryStore.galleryItems.filter((item) => {
    const searchLower = normalizeString(search.value)

    // Support searching by #ID
    const isIdSearch = search.value.startsWith('#')
    const searchId = isIdSearch ? search.value.substring(1) : search.value

    // Linked Flash Title Lookup
    let flashTitle = ''
    if (item.flash_id) {
      const f = flashStore.flashTattoos.find((ft) => ft.id === item.flash_id)
      if (f) flashTitle = normalizeString(f.title)
    }

    const matchesSearch =
      normalizeString(item.title).includes(searchLower) ||
      item.id.toString() === searchId ||
      item.categories.some((cat) => normalizeString(cat).includes(searchLower)) ||
      (flashTitle && flashTitle.includes(searchLower))

    const matchesCategory = categoryFilter.value
      ? item.categories.includes(categoryFilter.value)
      : true
    return matchesSearch && matchesCategory
  })

  // Sort logic
  if (sortOrder.value) {
    items.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return items
})

const resetForm = () => {
  formData.value = {
    id: null,
    title: '',
    description: '',
    categories: [],
    images: [],
    status: 'active',
    flashId: null,
    flashData: null,
    price: null,
  }
  flashSearch.value = ''
  isEditing.value = false
}

const openModal = (item = null) => {
  if (item) {
    isEditing.value = true
    formData.value = {
      ...item,
      categories: [...item.categories],
      images: [...item.images],
      flashId: item.flash_id || item.flashId, // Map snake_case from DB
    }
    // If there is a linked flash
    if (formData.value.flashId) {
      const found = flashStore.flashTattoos.find((f) => f.id === formData.value.flashId)
      if (found) formData.value.flashData = found
    }
  } else {
    resetForm()
  }
  showModal.value = true
}

// Flash Search Logic
const filteredFlash = computed(() => {
  if (!flashSearch.value) return []
  return flashStore.flashTattoos
    .filter((f) => f.title.toLowerCase().includes(flashSearch.value.toLowerCase()))
    .slice(0, 5) // Limit to 5 results
})

const selectFlash = (flash) => {
  formData.value.flashId = flash.id
  formData.value.flashData = flash
  flashSearch.value = ''
  showFlashResults.value = false
}

const removeFlash = () => {
  formData.value.flashId = null
  formData.value.flashData = null
}

const handleImagesChange = (newImages) => {
  formData.value.images = newImages
}

const saveItem = async () => {
  uploading.value = true
  notificationStore.addNotification('Sauvegarde', 'Traitement en cours...', 'info')

  try {
    // 1. Upload new images if any
    const finalImageUrls = []

    for (const img of formData.value.images) {
      if (typeof img === 'string') {
        finalImageUrls.push(img)
      } else if (img.file) {
        // Upload to our local API
        const uploadData = new FormData()
        uploadData.append('image', img.file)

        const { data: uploadRes } = await api.post('/upload', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        finalImageUrls.push(uploadRes.url)
      } else {
        finalImageUrls.push(img.url)
      }
    }

    const itemData = {
      title: formData.value.title,
      description: formData.value.description,
      categories: formData.value.categories,
      images: finalImageUrls, // Updated with public URLs
      status: formData.value.status,
      flash_id: formData.value.flashId,
      price: formData.value.price,
    }

    if (isEditing.value) {
      await galleryStore.updateGalleryItem(formData.value.id, itemData)
    } else {
      itemData.views = 0
      await galleryStore.addGalleryItem(itemData)

      // If it's a flash, mark it as tattooed
      if (formData.value.flashId) {
        await flashStore.updateFlash(formData.value.flashId, { status: 'tattooed' })
      }

      // If it comes from Bilan du jour, mark the booking as processed
      if (route.query.refId) {
        await bookingStore.markAsProcessed(Number(route.query.refId))
      }

      // Intelligent redirect
      if (route.query.fromBilan) {
        notificationStore.addNotification(
          'Publié !',
          'Entrée ajoutée et redirection vers le dashboard.',
          'success',
        )
        showModal.value = false
        resetForm()
        router.push('/admin/dashboard')
        return // Stop here
      }
    }
    showModal.value = false
    resetForm()
  } catch (err) {
    console.error('Error saving gallery item:', err)
    notificationStore.addNotification('Erreur', 'Échec de la sauvegarde', 'error')
  } finally {
    uploading.value = false
  }
}

const selectedItems = ref([])

const toggleSelectAll = () => {
  if (selectedItems.value.length === paginatedItems.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = paginatedItems.value.map((i) => i.id)
  }
}

const deleteSelected = async () => {
  if (selectedItems.value.length === 0) return

  openConfirmModal(
    t('gallery.deleteConfirm'),
    `Voulez-vous vraiment supprimer ${selectedItems.value.length} élément(s) ?`,
    'danger',
    async () => {
      const ids = [...selectedItems.value]
      for (const id of ids) {
        await galleryStore.deleteGalleryItem(id)
      }
      selectedItems.value = []
      notificationStore.addNotification('Succès', 'Éléments supprimés', 'success')
    },
  )
}

const deleteItem = async (id) => {
  openConfirmModal(
    t('gallery.deleteConfirm'),
    t('gallery.deleteConfirmMessage', 'Cette action supprimera définitivement cet élément.'),
    'danger',
    () => galleryStore.deleteGalleryItem(id),
  )
}

// Quick Actions Logic
const quickAddCategory = async (item, category) => {
  if (!category || item.categories.includes(category)) return

  const newCategories = [...item.categories, category]
  await galleryStore.updateGalleryItem(item.id, { categories: newCategories })
  activeCategoryDropdown.value = null
}

const quickRemoveCategory = async (item, category) => {
  const newCategories = item.categories.filter((c) => c !== category)
  await galleryStore.updateGalleryItem(item.id, { categories: newCategories })
}

const quickUpdateStatus = async (item, newStatus) => {
  if (item.status === newStatus) return
  await galleryStore.updateGalleryItem(item.id, { status: newStatus })
  notificationStore.addNotification('Statut', `Statut mis à jour : ${newStatus}`, 'info')
}

// Dropdown State
const activeCategoryDropdown = ref(null)

const toggleCategoryDropdown = (id) => {
  if (activeCategoryDropdown.value === id) {
    activeCategoryDropdown.value = null
  } else {
    activeCategoryDropdown.value = id
  }
}

const availableCategoriesFor = (item) => {
  return categoryStore.categories.filter((c) => !item.categories.includes(c))
}

const statusOptions = [
  { value: 'active', label: 'Disponible', class: 'text-green-600 bg-green-50' },
  { value: 'draft', label: 'Brouillon', class: 'text-gray-600 bg-gray-50' },
  { value: 'hidden', label: 'Caché', class: 'text-red-600 bg-red-50' },
]

const getStatusClass = (status) => {
  const opt = statusOptions.find((o) => o.value === status)
  return opt ? opt.class : 'bg-gray-100 text-gray-500'
}

// Category Management
const isCategoryUsed = (name) => {
  return galleryStore.galleryItems.some((item) => item.categories && item.categories.includes(name))
}
// Deep Linking
const initializeFromQuery = () => {
  if (route.query.search) {
    search.value = route.query.search
  } else if (route.query.highlight) {
    const hId = Number(route.query.highlight)
    const item = galleryStore.galleryItems.find((g) => g.id === hId)
    if (item) {
      search.value = item.title
    } else {
      search.value = `#${hId}`
    }
  }

  // Pre-fill for Bilan du jour publish
  if (route.query.title && !isEditing.value) {
    formData.value.title = route.query.title
    if (route.query.flashId) {
      const flash = flashStore.flashTattoos.find((f) => f.id === Number(route.query.flashId))
      if (flash) {
        formData.value.flashId = flash.id
        formData.value.flashData = flash
        formData.value.categories = [...(flash.categories || [])]
      }
    }
    if (route.query.price) {
      formData.value.price = Number(route.query.price)
    }
    showModal.value = true
  }
}

watch(
  () => route.query,
  () => {
    initializeFromQuery()
  },
  { immediate: true },
)

const { paginatedItems, currentPage, pageSize, totalPages, nextPage, prevPage } = usePagination(
  filteredItems,
  10,
)

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-3">
      <button
        v-if="selectedItems.length > 0"
        @click="deleteSelected"
        class="bg-red-50 text-red-600 border border-red-200 px-4 py-3 rounded-xl hover:bg-red-100 transition-all font-bold shadow-sm flex items-center gap-2"
      >
        <i class="fas fa-trash"></i>
        Supprimer ({{ selectedItems.length }})
      </button>
      <button
        @click="showCategoryModal = true"
        class="bg-white text-gray-600 border border-gray-200 px-4 py-3 rounded-xl hover:bg-gray-50 hover:text-purple-600 hover:border-purple-200 transition-all duration-300 font-medium shadow-sm flex items-center gap-2"
      >
        <i class="fas fa-tags"></i>
        <span class="hidden sm:inline">{{ $t('flash.categories') }}</span>
      </button>
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        {{ $t('gallery.addTitle') }}
      </button>
    </div>

    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div class="flex flex-wrap gap-4 w-full md:w-auto flex-1">
          <div class="flex-1 min-w-[200px] max-w-md relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="search"
              type="text"
              :placeholder="$t('flash.filters.search')"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <div class="w-full md:w-48">
            <select
              v-model="categoryFilter"
              class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-gray-50 focus:bg-white transition-colors"
            >
              <option value="">{{ $t('flash.filters.allCategories') }}</option>
              <option v-for="cat in categoryStore.categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>
        </div>

        <!-- Top Pagination Controls -->
        <div
          class="flex items-center space-x-4 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
        >
          <div class="flex items-center space-x-2">
            <span>Afficher</span>
            <select
              v-model="pageSize"
              class="bg-transparent font-semibold focus:outline-none text-purple-600 cursor-pointer"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
              <option value="all">Tout</option>
            </select>
          </div>
          <div class="h-4 w-px bg-gray-300"></div>
          <div class="flex space-x-1">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              <i class="fas fa-chevron-left text-xs"></i>
            </button>
            <span class="flex items-center font-medium">{{ currentPage }} / {{ totalPages }}</span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              <i class="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="w-full">
          <thead
            class="bg-gray-50/50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-100"
          >
            <tr>
              <th class="p-4 text-left w-12">
                <input
                  type="checkbox"
                  @change="toggleSelectAll"
                  :checked="
                    selectedItems.length === paginatedItems.length && paginatedItems.length > 0
                  "
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('id')"
              >
                <div class="flex items-center space-x-2">
                  <span>ID</span>
                  <i :class="getSortIcon('id')"></i>
                </div>
              </th>
              <th class="text-left p-4">{{ $t('flash.table.image') }}</th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('title')"
              >
                <div class="flex items-center space-x-2">
                  <span>{{ $t('flash.table.title') }}</span>
                  <i :class="getSortIcon('title')"></i>
                </div>
              </th>
              <th class="text-left p-4">{{ $t('flash.table.category') }}</th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('views')"
              >
                <div class="flex items-center space-x-2">
                  <span>{{ $t('flash.table.views') }}</span>
                  <i :class="getSortIcon('views')"></i>
                </div>
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('status')"
              >
                <div class="flex items-center space-x-2">
                  <span>{{ $t('flash.table.status') }}</span>
                  <i :class="getSortIcon('status')"></i>
                </div>
              </th>
              <th class="text-right p-4">{{ $t('flash.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="item in paginatedItems"
              :key="item.id"
              class="hover:bg-purple-50/30 transition-colors group"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  v-model="selectedItems"
                  :value="item.id"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
              </td>
              <td
                class="p-4 text-xs text-gray-400 group-hover:text-purple-400 cursor-pointer"
                @click="openModal(item)"
              >
                #{{ item.id }}
              </td>
              <td class="p-4 cursor-pointer" @click="openModal(item)">
                <div
                  class="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100 group-hover:border-purple-200 transition-colors"
                >
                  <img :src="item.images[0]" class="w-full h-full object-cover" />
                  <div
                    v-if="item.images.length > 1"
                    class="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg"
                  >
                    +{{ item.images.length - 1 }}
                  </div>
                </div>
              </td>
              <td
                class="p-4 font-semibold text-gray-800 cursor-pointer group-hover:text-purple-700"
                @click="openModal(item)"
              >
                {{ item.title }}
              </td>
              <td class="p-4 text-gray-600">
                <div class="flex flex-wrap gap-1 items-center">
                  <div
                    v-for="cat in item.categories"
                    :key="cat"
                    class="group/tag inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide text-gray-600 border border-transparent hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors cursor-pointer"
                    @click="quickRemoveCategory(item, cat)"
                    title="Cliquer pour supprimer"
                  >
                    <span>{{ cat }}</span>
                    <i
                      class="fas fa-times text-[8px] opacity-0 group-hover/tag:opacity-100 transition-opacity"
                    ></i>
                  </div>

                  <!-- Add Category Dropdown -->
                  <div class="relative">
                    <button
                      @click.stop="toggleCategoryDropdown(item.id)"
                      class="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 text-gray-400 hover:text-purple-600 hover:border-purple-200 flex items-center justify-center transition-all"
                      title="Ajouter une catégorie"
                    >
                      <i class="fas fa-plus text-[10px]"></i>
                    </button>

                    <div
                      v-if="activeCategoryDropdown === item.id"
                      class="absolute left-0 top-full mt-1 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div class="p-2 border-b border-gray-50 bg-gray-50/50">
                        <p class="text-[10px] font-bold text-gray-500 uppercase">Ajouter</p>
                      </div>
                      <div class="max-h-40 overflow-y-auto">
                        <button
                          v-for="cat in availableCategoriesFor(item)"
                          :key="cat"
                          @click="quickAddCategory(item, cat)"
                          class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors block"
                        >
                          {{ cat }}
                        </button>
                        <p
                          v-if="availableCategoriesFor(item).length === 0"
                          class="px-3 py-2 text-xs text-gray-400 italic"
                        >
                          Aucune catégorie dispo
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="p-4 text-gray-500 text-sm">
                <i class="fas fa-eye mr-1 text-gray-300"></i>{{ item.views || 0 }}
              </td>
              <td class="p-4">
                <div class="relative w-32">
                  <select
                    :value="item.status"
                    @change="quickUpdateStatus(item, $event.target.value)"
                    class="w-full appearance-none pl-3 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer transition-all border"
                    :class="getStatusClass(item.status)"
                  >
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                  >
                    <i
                      class="fas fa-chevron-down text-[10px]"
                      :class="
                        item.status === 'active' || item.status === 'available'
                          ? 'text-green-700'
                          : 'text-gray-500'
                      "
                    ></i>
                  </div>
                </div>
              </td>
              <td class="p-4">
                <div
                  class="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    @click="openModal(item)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Modifier"
                  >
                    <i class="fas fa-pen text-xs"></i>
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-red-500 hover:text-red-600 hover:border-red-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Bottom Pagination -->
      <div
        class="flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-6 mt-4"
      >
        <div class="flex items-center font-medium text-sm text-gray-500">
          {{ currentPage }} / {{ totalPages }}
        </div>
        <div class="flex space-x-1">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <i class="fas fa-chevron-left text-xs"></i>
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <i class="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit/Add Modal -->
    <BaseModal
      :show="showModal"
      :title="isEditing ? $t('gallery.editTitle') : $t('gallery.addTitle')"
      @close="showModal = false"
    >
      <div class="grid gap-4">
        <div>
          <BaseInput v-model="formData.title" :label="$t('gallery.form.title')" type="text" />
        </div>

        <!-- Description Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Description du tatouage..."
          ></textarea>
        </div>

        <!-- Flash Linking Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Lier à un Flash</label>

          <!-- Selected Flash Display -->
          <div
            v-if="formData.flashData"
            class="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg mb-2"
          >
            <div class="flex items-center gap-3">
              <img :src="formData.flashData.images?.[0]" class="w-10 h-10 rounded object-cover" />
              <div>
                <div class="font-medium text-purple-900">{{ formData.flashData.title }}</div>
                <div class="text-xs text-purple-700">{{ formData.flashData.price }}€</div>
              </div>
            </div>
            <button @click="removeFlash" class="text-red-500 hover:text-red-700 p-1">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Search Input -->
          <div v-else class="relative">
            <div class="relative">
              <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input
                v-model="flashSearch"
                @focus="showFlashResults = true"
                type="text"
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Rechercher un flash..."
              />
            </div>

            <!-- Results Dropdown -->
            <div
              v-if="showFlashResults && filteredFlash.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                v-for="flash in filteredFlash"
                :key="flash.id"
                @click="selectFlash(flash)"
                class="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
              >
                <img :src="flash.images?.[0]" class="w-8 h-8 rounded object-cover" />
                <div class="text-sm">
                  <div class="font-medium">{{ flash.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <BaseInput
            v-model.number="formData.price"
            label="Prix Réalisé (Optionnel)"
            type="number"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('gallery.form.category')
          }}</label>
          <div
            class="flex flex-col space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3"
          >
            <label
              v-for="cat in categoryStore.categories"
              :key="'form-' + cat"
              class="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="cat"
                v-model="formData.categories"
                class="rounded text-purple-600 focus:ring-purple-500"
              />
              <span class="text-sm text-gray-700">{{ cat }}</span>
            </label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('gallery.form.status')
          }}</label>
          <select
            v-model="formData.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="active">{{ $t('status.active') }}</option>
            <option value="standby">{{ $t('status.standby') }}</option>
          </select>
        </div>
        <div>
          <BaseFileUpload
            v-model="formData.images"
            :label="$t('gallery.form.image')"
            multiple
            @change="handleImagesChange"
          />
        </div>
      </div>
      <template #footer>
        <button
          @click="showModal = false"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-3"
        >
          {{ $t('general.cancel') }}
        </button>
        <button
          @click="saveItem"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          {{ $t('general.save') }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      :show="showCategoryModal"
      title="Gestion des Catégories"
      @close="showCategoryModal = false"
      max-width="md"
    >
      <CategoryManager :is-used-callback="isCategoryUsed" />

      <template #footer>
        <button
          @click="showCategoryModal = false"
          class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Fermer
        </button>
      </template>
    </BaseModal>

    <!-- Global Confirm Modal -->
    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      @confirm="handleConfirm"
      @cancel="confirmModal.isOpen = false"
    />
  </div>
</template>

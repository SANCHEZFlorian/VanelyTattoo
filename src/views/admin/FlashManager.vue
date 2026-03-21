<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '@/lib/api'
import { useRoute } from 'vue-router'
import { useFlashStore } from '../../stores/flash'
import { useCategoryStore } from '../../stores/category'
import { useNotificationStore } from '../../stores/notification'
import { useI18n } from 'vue-i18n'
import BaseModal from '../../components/ui/BaseModal.vue'
import CategoryManager from '../../components/admin/CategoryManager.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseFileUpload from '../../components/ui/BaseFileUpload.vue'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import { usePagination } from '../../composables/usePagination'
import { normalizeString } from '../../utils/stringUtils'
import { getImageUrl } from '../../utils/imageUtils'

const route = useRoute()
const flashStore = useFlashStore()
const categoryStore = useCategoryStore()
const notificationStore = useNotificationStore()
const { t } = useI18n()

const search = ref('')
const categoryFilter = ref([])
const showModal = ref(false)
const showCategoryModal = ref(false)
const isEditing = ref(false)
const uploading = ref(false)
const newCategoryInput = ref('')

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

const formData = ref({
  id: null,
  title: '',
  categories: [],
  size: [],
  color: 'color',
  standardPrice: 0,
  promoPrice: 0,
  discount: 0,
  images: [],
  status: 'active',
  description: '',
  duration: 60,
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
  let items = flashStore.flashTattoos.filter((item) => {
    const searchLower = normalizeString(search.value)

    // Support searching by #ID
    const isIdSearch = search.value.startsWith('#')
    const searchId = isIdSearch ? search.value.substring(1) : search.value

    const matchesSearch =
      normalizeString(item.title).includes(searchLower) ||
      item.id.toString() === searchId ||
      item.categories.some((cat) => normalizeString(cat).includes(searchLower))

    const matchesCategory = categoryFilter.value && categoryFilter.value.length > 0
      ? categoryFilter.value.every(c => item.categories && item.categories.includes(c))
      : true
    return matchesSearch && matchesCategory
  })

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
  newCategoryInput.value = ''
  formData.value = {
    id: null,
    title: '',
    categories: [],
    size: [],
    color: [],
    standardPrice: 0,
    promoPrice: 0,
    discount: 0,
    images: [],
    status: 'active',
    description: '',
    duration: 60,
  }
  isEditing.value = false
}

const openModal = (item = null) => {
  if (item) {
    isEditing.value = true
    // Logic:
    // If original_price is set, it means there is a promo.
    // So Standard = original_price, Promo = price
    // Else
    // Standard = price, Promo = empty

    let stdPrice = item.price
    let prmPrice = 0

    if (item.original_price && item.original_price > item.price) {
      stdPrice = item.original_price
      prmPrice = item.price
    }

    let parsedSize = []
    if (item.size) {
        try {
            parsedSize = JSON.parse(item.size)
            if (!Array.isArray(parsedSize)) parsedSize = [parsedSize]
        } catch {
            parsedSize = item.size.split(',').map(s => s.trim()).filter(Boolean)
        }
    }

    formData.value = {
      ...item,
      standardPrice: stdPrice,
      promoPrice: prmPrice,
      size: parsedSize,
      categories: [...(item.categories || [])], // Clone array
      images: [...(item.images || [])], // Clone array
    }
  } else {
    resetForm()
  }
  showModal.value = true
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

    // 2. Determine DB mapping
    let dbPrice = formData.value.standardPrice
    let dbOriginalPrice = null

    if (
      formData.value.promoPrice &&
      formData.value.promoPrice > 0 &&
      formData.value.promoPrice < formData.value.standardPrice
    ) {
      dbPrice = formData.value.promoPrice
      dbOriginalPrice = formData.value.standardPrice
    }

    const itemData = {
      title: formData.value.title,
      categories: formData.value.categories,
      size: JSON.stringify(formData.value.size),
      color: formData.value.color,
      price: dbPrice,
      original_price: dbOriginalPrice,
      discount: formData.value.discount,
      status: formData.value.status,
      description: formData.value.description,
      duration: formData.value.duration || 60,
      images: finalImageUrls, // Updated with public URLs
    }

    if (isEditing.value && formData.value.id) {
      const success = await flashStore.updateFlash(formData.value.id, itemData)
      if (success) notificationStore.addNotification('Succès', 'Flash mis à jour', 'success')
    } else {
      itemData.views = 0
      const newItem = await flashStore.addFlash(itemData)
      if (newItem) notificationStore.addNotification('Succès', 'Nouveau flash créé', 'success')
    }
    showModal.value = false
    resetForm()
  } catch (err) {
    console.error('Error saving flash:', err)
    notificationStore.addNotification('Erreur', 'Échec de la sauvegarde', 'error')
  } finally {
    uploading.value = false
  }
}

const deleteItem = async (id) => {
  openConfirmModal(
    t('flash.deleteConfirm'),
    t('flash.deleteConfirmMessage', 'Cette action supprimera définitivement le flash.'),
    'danger',
    () => flashStore.deleteFlash(id),
  )
}

const addNewCategoryToModal = async () => {
  if (!newCategoryInput.value.trim()) return
  const name = newCategoryInput.value.trim()
  const success = await categoryStore.addCategory(name)
  if (success || categoryStore.categories.includes(name)) {
    if (!formData.value.categories.includes(name)) {
        formData.value.categories.push(name)
    }
    newCategoryInput.value = ''
  }
}

const handleDrop = (event) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
     const newFiles = Array.from(files).map(file => ({ file, url: URL.createObjectURL(file) }))
     formData.value.images = [...formData.value.images, ...newFiles]
     if (!formData.value.title && files[0].name) {
         formData.value.title = files[0].name.split('.')[0].replace(/[-_]/g, ' ')
     }
  }
}

// Category Management
const isCategoryUsed = (name) => {
  return flashStore.flashTattoos.some((item) => item.categories && item.categories.includes(name))
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
    t('flash.deleteConfirm'),
    `Voulez-vous vraiment supprimer ${selectedItems.value.length} élément(s) ?`,
    'danger',
    async () => {
      const ids = [...selectedItems.value]
      for (const id of ids) {
        await flashStore.deleteFlash(id)
      }
      selectedItems.value = []
      notificationStore.addNotification('Succès', 'Éléments supprimés', 'success')
    },
  )
}

// Categories are now managed via CategoryManager component

// Quick Actions Logic
const quickAddCategory = async (flash, category) => {
  if (!category || flash.categories.includes(category)) return

  const newCategories = [...flash.categories, category]
  await flashStore.updateFlash(flash.id, { categories: newCategories })
  activeCategoryDropdown.value = null
}

const quickRemoveCategory = async (flash, category) => {
  const newCategories = flash.categories.filter((c) => c !== category)
  await flashStore.updateFlash(flash.id, { categories: newCategories })
}

const quickUpdateStatus = async (flash, newStatus) => {
  if (flash.status === newStatus) return
  await flashStore.updateFlash(flash.id, { status: newStatus })
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

// Close dropdown when clicking outside
// (Simplified: relies on clicking another or the toggle logic for now,
//  a proper click-outside directive would be better but keeping it simple)

const availableCategoriesFor = (flash) => {
  return categoryStore.categories.filter((c) => !flash.categories.includes(c))
}

const statusOptions = [
  { value: 'active', label: 'Disponible', class: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'reserved', label: 'Réservé', class: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'tattooed', label: 'Tatoué', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'hidden', label: 'Caché', class: 'bg-gray-100 text-gray-700 border-gray-200' },
]

const getStatusClass = (status) => {
  const opt = statusOptions.find((o) => o.value === status)
  return opt ? opt.class : 'bg-gray-100 text-gray-500'
}

const updateItemPrices = async (item, newStandard, newPromo) => {
  let dbPrice = newStandard
  let dbOriginalPrice = null // Default: no promo

  if (newPromo && newPromo > 0 && newPromo < newStandard) {
    dbPrice = newPromo
    dbOriginalPrice = newStandard
  } else if (newPromo !== null && newPromo >= newStandard) {
    notificationStore.addNotification(
      'Erreur de prix',
      'Le prix promo doit être inférieur au prix standard.',
      'error',
    )
    return
  }

  const updates = {
    price: dbPrice,
    original_price: dbOriginalPrice,
  }

  await flashStore.updateFlash(item.id, updates)
}

const toggleFeatured = async (item) => {
  const newValue = !item.is_featured
  const success = await flashStore.updateFlash(item.id, { is_featured: newValue })
  if (success) {
    notificationStore.addNotification(
      'Mise à jour',
      newValue ? `"${item.title}" mis à la une` : `"${item.title}" retiré de la une`,
      'success',
    )
  }
}

const initializeFromQuery = () => {
  if (route.query.search) {
    search.value = route.query.search
  } else if (route.query.highlight) {
    const hId = Number(route.query.highlight)
    const item = flashStore.flashTattoos.find((f) => f.id === hId)
    if (item) {
      search.value = item.title
    } else {
      search.value = `#${hId}`
    }
  }
}

watch(
  () => route.query,
  () => {
    initializeFromQuery()
  },
  { immediate: true },
)

// Pagination

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
    <!-- Actions Toolbar -->
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
        {{ $t('flash.addTitle') }}
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
          <div class="w-full md:w-64">
            <select
              multiple
              v-model="categoryFilter"
              class="w-full h-24 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-gray-50 focus:bg-white transition-colors custom-scrollbar"
            >
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
                @click="sortBy('price')"
              >
                <div class="flex items-center space-x-2">
                  <span>Prix Standard</span>
                  <i :class="getSortIcon('price')"></i>
                </div>
              </th>
              <th class="text-left p-4">
                <span>Prix Promo</span>
              </th>
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
                @click="sortBy('is_featured')"
              >
                <div class="flex items-center space-x-2">
                  <span>À la une</span>
                  <i :class="getSortIcon('is_featured')"></i>
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
              <td class="p-4" @click.stop>
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
                  <img :src="getImageUrl(item.images[0])" class="w-full h-full object-cover" />
                  <div
                    v-if="item.images.length > 1"
                    class="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg"
                  >
                    +{{ item.images.length - 1 }}
                  </div>
                </div>
              </td>
              <td
                class="p-4 font-semibold text-gray-800 group-hover:text-purple-700 cursor-pointer"
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
              <td class="p-4 font-semibold text-gray-900" @click.stop>
                <div class="flex items-center gap-1">
                  <input
                    :value="item.original_price || item.price"
                    @change="
                      (e) =>
                        updateItemPrices(
                          item,
                          Number(e.target.value),
                          item.original_price ? item.price : null,
                        )
                    "
                    type="number"
                    class="w-20 px-2 py-1 border border-transparent hover:border-gray-200 focus:border-purple-400 rounded bg-transparent focus:bg-white text-right text-sm font-bold text-gray-700 focus:outline-none transition-all"
                  />
                  <span class="text-gray-400 text-sm">€</span>
                </div>
              </td>
              <td class="p-4 font-semibold text-gray-900" @click.stop>
                <div class="flex items-center gap-1">
                  <input
                    :value="item.original_price ? item.price : ''"
                    @change="
                      (e) =>
                        updateItemPrices(
                          item,
                          item.original_price || item.price,
                          e.target.value === '' ? null : Number(e.target.value),
                        )
                    "
                    placeholder="-"
                    type="number"
                    class="w-20 px-2 py-1 border border-transparent hover:border-gray-200 focus:border-red-400 rounded bg-transparent focus:bg-white text-right text-sm font-bold text-red-600 focus:outline-none transition-all placeholder-gray-300"
                  />
                  <span class="text-gray-400 text-sm">€</span>
                </div>
              </td>
              <td class="p-4 text-gray-500 text-sm">
                <i class="fas fa-eye mr-1 text-gray-300"></i>{{ item.views || 0 }}
              </td>
              <td class="p-4 text-center" @click.stop>
                <button
                  @click="toggleFeatured(item)"
                  class="text-xl transition-all transform hover:scale-110 focus:outline-none"
                  :class="
                    item.is_featured ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'
                  "
                  :title="item.is_featured ? 'Retirer de la une' : 'Mettre à la une'"
                >
                  <i class="fas fa-star"></i>
                </button>
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
              <td class="p-4" @click.stop>
                <div class="flex justify-end space-x-2">
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
    </div>

    <!-- Edit/Add Modal -->
    <BaseModal
      :show="showModal"
      :title="isEditing ? $t('flash.editTitle') : $t('flash.addTitle')"
      @close="showModal = false"
      max-width="4xl"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" @dragover.prevent @drop.prevent="handleDrop">
        <div class="col-span-1 md:col-span-2">
          <BaseInput
            v-model="formData.title"
            :label="$t('flash.form.title')"
            type="text"
            required
          />
        </div>

        <!-- Split Categories (Left) and Details (Right) -->
        <div class="md:col-span-1 flex flex-col h-full">
          <div class="flex items-center justify-between mb-1">
            <label class="block text-sm font-medium text-gray-700">{{ $t('flash.form.category') }}</label>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <input v-model="newCategoryInput" type="text" placeholder="Nouvelle" class="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" @keyup.enter="addNewCategoryToModal" />
            <button @click="addNewCategoryToModal" type="button" class="px-2 py-1 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm"><i class="fas fa-plus text-purple-600"></i></button>
          </div>
          <div
            class="flex-1 flex flex-col space-y-2 overflow-y-auto border border-gray-300 rounded-lg p-3 min-h-[200px]"
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
                class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span class="text-sm text-gray-700">{{ cat }}</span>
            </label>
          </div>
        </div>

        <div class="md:col-span-1 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{
              $t('flash.form.status')
            }}</label>
            <select
              v-model="formData.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="active">Disponible (Actif)</option>
              <option value="reserved">Réservé</option>
              <option value="tattooed">Tatoué (Portfolio)</option>
              <option value="standby">Caché (Standby)</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              <div class="flex flex-wrap gap-4 mt-1">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" value="small" v-model="formData.size" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"/>
                  <span class="text-sm text-gray-700">Petit</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" value="medium" v-model="formData.size" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"/>
                  <span class="text-sm text-gray-700">Moyen</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" value="large" v-model="formData.size" class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"/>
                  <span class="text-sm text-gray-700">Grand</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
              <div class="flex flex-wrap gap-4 mt-1">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value="blackwork"
                    v-model="formData.color"
                    class="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span class="text-sm text-gray-700">Noir & Blanc</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value="color"
                    v-model="formData.color"
                    class="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span class="text-sm text-gray-700">Couleur</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <BaseInput
              v-model.number="formData.standardPrice"
              label="Prix Standard (Hors Promo)"
              type="number"
            />
          </div>
          <div>
            <BaseInput
              v-model.number="formData.promoPrice"
              label="Prix Promotionnel (Optionnel)"
              type="number"
            />
          </div>
          <div>
            <BaseInput
              v-model.number="formData.duration"
              label="Durée estimée (minutes)"
              type="number"
            />
          </div>
        </div>
        <div class="col-span-1 md:col-span-2">
          <BaseFileUpload
            v-model="formData.images"
            :label="$t('flash.form.image')"
            multiple
            @change="handleImagesChange"
          />
        </div>
        <div class="col-span-1 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('flash.form.description')
          }}</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
          ></textarea>
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

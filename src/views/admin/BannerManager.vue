<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex justify-end gap-3">
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        {{ $t('flash.addTitle') || 'Nouvelle Bannière' }}
      </button>
    </div>

    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <!-- Filters (Search only here) -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div class="flex flex-wrap gap-4 w-full md:w-auto flex-1">
          <div class="flex-1 min-w-[300px] max-w-md relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="search"
              type="text"
              :placeholder="$t('flash.filters.search')"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
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
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
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

      <div v-if="bannerStore.loading" class="text-gray-600 text-center">Chargement...</div>
      <div v-else-if="bannerStore.error" class="text-red-500 text-center">
        {{ bannerStore.error }}
      </div>

      <div v-else class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="w-full">
          <thead
            class="bg-gray-50/50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-100"
          >
            <tr>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('id')"
              >
                <div class="flex items-center space-x-2">
                  <span>ID</span>
                  <i :class="getSortIcon('id')"></i>
                </div>
              </th>
              <th class="text-left p-4">{{ $t('settings.carousel.image') }}</th>
              <th class="text-left p-4">{{ $t('settings.carousel.title') }}</th>
              <th class="text-left p-4">Ordre</th>
              <th class="text-left p-4">{{ $t('flash.table.status') }}</th>
              <th class="text-right p-4">{{ $t('flash.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="banner in paginatedItems"
              :key="banner.id"
              class="hover:bg-purple-50/30 transition-colors group cursor-pointer"
              @click="openModal(banner)"
            >
              <td class="p-4 text-xs text-gray-400 group-hover:text-purple-400">
                #{{ banner.id }}
              </td>
              <td class="p-4" @click.stop>
                <div
                  class="w-24 h-12 rounded bg-gray-100 border border-gray-100 overflow-hidden shadow-sm"
                >
                  <img
                    :src="getImageUrl(banner.image_url)"
                    :alt="banner.title"
                    class="w-full h-full object-cover"
                  />
                </div>
              </td>
              <td class="p-4" @click="openModal(banner)">
                <div class="font-bold text-gray-800">{{ banner.title }}</div>
                <div class="text-xs text-gray-500">{{ banner.description }}</div>
              </td>
              <td class="p-4 text-gray-600 font-medium">{{ banner.display_order }}</td>
              <td class="p-4">
                <span
                  :class="
                    banner.active
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  "
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm"
                >
                  {{ banner.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="p-4" @click.stop>
                <div class="flex justify-end space-x-2">
                  <button
                    @click="openModal(banner)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Modifier"
                  >
                    <i class="fas fa-pen text-xs"></i>
                  </button>
                  <button
                    @click="confirmDelete(banner.id)"
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

    <!-- Modal -->
    <BaseModal
      :show="showModal"
      :title="isEditing ? 'Modifier une bannière' : 'Ajouter une bannière'"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <BaseInput
            v-model="form.title"
            :label="$t('settings.carousel.title')"
            placeholder="Titre de la bannière"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{
            $t('settings.carousel.subtitle')
          }}</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-3 py-2 border outline-none"
            placeholder="Description..."
          ></textarea>
        </div>

        <div>
          <BaseFileUpload
            v-model="form.image_url"
            :label="$t('settings.carousel.image')"
            :multiple="false"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <BaseInput v-model="form.button_text" label="Texte Bouton" />
          </div>
          <div>
            <BaseInput v-model="form.button_link" label="Lien Bouton" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <BaseInput v-model.number="form.display_order" label="Ordre" type="number" />
          </div>
          <div class="flex items-center pt-6">
            <label class="flex items-center cursor-pointer">
              <input v-model="form.active" type="checkbox" class="sr-only peer" />
              <div
                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
              ></div>
              <span class="ms-3 text-sm font-medium text-gray-700">Actif</span>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="closeModal"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-2"
        >
          {{ $t('general.cancel') }}
        </button>
        <button
          @click="saveBanner"
          class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition"
        >
          {{ isEditing ? 'Mettre à jour' : $t('general.save') }}
        </button>
      </template>
    </BaseModal>

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

<script setup>
import { ref, onMounted, computed } from 'vue' // Added computed, watch
import api from '@/lib/api'
import { useBannerStore } from '@/stores/banner'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import BaseFileUpload from '../../components/ui/BaseFileUpload.vue'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import { usePagination } from '../../composables/usePagination'
import { normalizeString } from '../../utils/stringUtils'
import { getImageUrl } from '../../utils/imageUtils'

const bannerStore = useBannerStore()
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
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

const search = ref('') // Search Ref

// Filter Logic
const filteredBanners = computed(() => {
  const searchLower = normalizeString(search.value)
  let items = bannerStore.banners.filter((b) => normalizeString(b.title).includes(searchLower))

  // Sort logic
  if (sortKey.value) {
    items.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]

      // Handle strings
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return items
})

const sortKey = ref('id') // Default sort by ID
const sortOrder = ref('asc')

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

// Pagination Logic
const { paginatedItems, currentPage, pageSize, totalPages, nextPage, prevPage } = usePagination(
  filteredBanners,
  10,
)

const form = ref({
  title: '',
  description: '',
  image_url: '',
  button_text: 'En savoir plus',
  button_link: '/',
  display_order: 0,
  active: true,
})

onMounted(() => {
  bannerStore.fetchBanners()
})

const openModal = (banner = null) => {
  if (banner) {
    isEditing.value = true
    editingId.value = banner.id
    form.value = { ...banner }
  } else {
    isEditing.value = false
    editingId.value = null
    form.value = {
      title: '',
      description: '',
      image_url: '',
      button_text: 'En savoir plus',
      button_link: '/',
      display_order: 0,
      active: true,
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveBanner = async () => {
  uploading.value = true
  try {
    let finalImageUrl = form.value.image_url

    // Handle file upload if it's a new file object from BaseFileUpload
    if (
      form.value.image_url &&
      typeof form.value.image_url === 'object' &&
      form.value.image_url.file
    ) {
      const file = form.value.image_url.file
      const uploadData = new FormData()
      uploadData.append('image', file)

      const { data: uploadRes } = await api.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      finalImageUrl = uploadRes.url
    } else if (form.value.image_url && typeof form.value.image_url === 'object') {
      finalImageUrl = form.value.image_url.url
    }

    const bannerData = {
      ...form.value,
      image_url: finalImageUrl,
    }

    if (isEditing.value) {
      await bannerStore.updateBanner(editingId.value, bannerData)
    } else {
      await bannerStore.addBanner(bannerData)
    }
    closeModal()
  } catch (err) {
    console.error('Error saving banner:', err)
  } finally {
    uploading.value = false
  }
}

const confirmDelete = async (id) => {
  openConfirmModal(
    'Supprimer la bannière',
    'Êtes-vous sûr de vouloir supprimer cette bannière ?',
    'danger',
    () => bannerStore.deleteBanner(id),
  )
}
</script>

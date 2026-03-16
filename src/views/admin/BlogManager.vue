<script setup>
import { ref, computed } from 'vue'
import { useBlogStore } from '../../stores/blog'
// import BaseModal from '../../components/ui/BaseModal.vue'
// import BaseInput from '../../components/ui/BaseInput.vue'
// import BaseFileUpload from '../../components/ui/BaseFileUpload.vue'
import { normalizeString } from '../../utils/stringUtils'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'

const blogStore = useBlogStore()
// const { t } = useI18n()
const filterStatus = ref('')
const search = ref('')
// const showModal = ref(false)
// const isEditing = ref(false)
// const uploading = ref(false)

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

// Sorting
const sortKey = ref('date')
const sortOrder = ref('desc')

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

const filteredPosts = computed(() => {
  let items = blogStore.posts.filter((p) => {
    const matchesStatus = filterStatus.value ? p.status === filterStatus.value : true
    const matchesSearch = normalizeString(p.title).includes(normalizeString(search.value))
    return matchesStatus && matchesSearch
  })

  if (sortOrder.value) {
    items.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]
      if (sortKey.value === 'date') {
        valA = new Date(valA).getTime()
        valB = new Date(valB).getTime()
      }
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return items
})

// Modal logic removed in favor of BlogEditor view

const deletePost = async (id) => {
  openConfirmModal(
    "Supprimer l'article",
    'Voulez-vous vraiment supprimer cet article ?',
    'danger',
    () => blogStore.deletePost(id),
  )
}

// Bulk Actions
const selectedItems = ref([])
// const notificationStore = useNotificationStore() // Assuming I can auto-import or need to add it.
// Checking imports again from view_file, line 1-8. It's not there.
// I'll add `import { useNotificationStore } from '../../stores/notification'` maybe?
// Let's assume typical patterns.

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
    'Supprimer la sélection',
    `Voulez-vous vraiment supprimer ${selectedItems.value.length} article(s) ?`,
    'danger',
    async () => {
      const ids = [...selectedItems.value]
      for (const id of ids) {
          await blogStore.deletePost(id)
      }
      selectedItems.value = []
      // notificationStore.addNotification('Succès', 'Éléments supprimés', 'success')
      // Notification might be missing, I'll risk it or leave it out if store not present.
      // Blog store likely handles minimal notification or I should add it.
    },
  )
}

// Pagination
import { usePagination } from '../../composables/usePagination'
const { paginatedItems, currentPage, pageSize, totalPages, nextPage, prevPage } = usePagination(
  filteredPosts,
  10,
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-3">
      <button
        @click="$router.push('/admin/blog/new')"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        Ajouter un article
      </button>
    </div>

    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <!-- Filters -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div class="flex flex-wrap gap-4 w-full md:w-auto flex-1 items-center">
            <!-- Bulk Delete Button -->
          <button
            v-if="selectedItems.length > 0"
            @click="deleteSelected"
            class="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-all font-bold shadow-sm flex items-center gap-2 text-sm"
          >
            <i class="fas fa-trash"></i>
            Supprimer ({{ selectedItems.length }})
          </button>

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
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-gray-50 focus:bg-white transition-colors"
            >
              <option value="">Tous les statuts</option>
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
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
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('title')"
              >
                <div class="flex items-center space-x-2">
                  <span>Titre</span>
                  <i :class="getSortIcon('title')"></i>
                </div>
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('date')"
              >
                <div class="flex items-center space-x-2">
                  <span>Date</span>
                  <i :class="getSortIcon('date')"></i>
                </div>
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('views')"
              >
                <div class="flex items-center space-x-2">
                  <span>Vues</span>
                  <i :class="getSortIcon('views')"></i>
                </div>
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('status')"
              >
                <div class="flex items-center space-x-2">
                  <span>Status</span>
                  <i :class="getSortIcon('status')"></i>
                </div>
              </th>
              <th class="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="post in paginatedItems"
              :key="post.id"
              class="hover:bg-purple-50/30 transition-colors group cursor-pointer"
              @click="$router.push(`/admin/blog/edit/${post.id}`)"
            >
              <td class="p-4" @click.stop>
                 <input type="checkbox" v-model="selectedItems" :value="post.id" class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4" />
              </td>
              <td class="p-4 text-xs text-gray-400 group-hover:text-purple-400">#{{ post.id }}</td>
              <td
                class="p-4 font-bold text-gray-800 cursor-pointer group-hover:text-purple-700"
                @click="$router.push(`/admin/blog/edit/${post.id}`)"
              >
                {{ post.title }}
              </td>
              <td class="p-4 text-gray-600 text-sm">{{ post.date }}</td>
              <td class="p-4 text-gray-500 text-sm">
                <i class="fas fa-eye mr-1 text-gray-300"></i>{{ post.views }}
              </td>
              <td class="p-4">
                <span
                  :class="{
                    'bg-green-100 text-green-700 border border-green-200':
                      post.status === 'published',
                    'bg-gray-100 text-gray-700 border border-gray-200': post.status === 'draft',
                  }"
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm"
                >
                  {{ post.status === 'published' ? 'Publié' : 'Brouillon' }}
                </span>
              </td>
              <td class="p-4" @click.stop>
                <div
                  class="flex justify-end space-x-2"
                >
                  <button
                    @click="$router.push(`/admin/blog/edit/${post.id}`)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Modifier"
                  >
                    <i class="fas fa-pen text-xs"></i>
                  </button>
                  <button
                    @click="deletePost(post.id)"
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

    <!-- Modal Removed -->

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

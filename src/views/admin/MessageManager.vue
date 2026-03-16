<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMessageStore } from '../../stores/message'
import { usePagination } from '../../composables/usePagination'
import { normalizeString } from '../../utils/stringUtils'
import { useRoute } from 'vue-router'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import MessageDetailsModal from '../../components/admin/MessageDetailsModal.vue'

// Basic State
const messageStore = useMessageStore()
const route = useRoute()
const search = ref('')
const filterStatus = ref('')
const selectedItems = ref([])
const showDetailsModal = ref(false)
const selectedMessage = ref(null)

// Confirm Modal state
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  type: 'danger',
  action: null,
})

// Sorting state
const sortKey = ref('date')
const sortOrder = ref('desc')

// --- Functions ---

function toggleRead(msg) {
  msg.read = !msg.read
  if (msg.read) messageStore.markAsRead(msg.id)
}

function openDetails(msg) {
  selectedMessage.value = msg
  if (!msg.read) {
    toggleRead(msg)
  }
  showDetailsModal.value = true
}

function openConfirmModal(title, message, type, action) {
  confirmModal.value = { isOpen: true, title, message, type, action }
}

function handleConfirm() {
  if (confirmModal.value.action) confirmModal.value.action()
  confirmModal.value.isOpen = false
}

function deleteMsg(id) {
  openConfirmModal(
    'Supprimer le message',
    'Voulez-vous vraiment supprimer ce message ?',
    'danger',
    () => messageStore.deleteMessage(id),
  )
}

function deleteSelected() {
  if (selectedItems.value.length === 0) return
  openConfirmModal(
    'Supprimer la sélection',
    `Voulez-vous vraiment supprimer ${selectedItems.value.length} message(s) ?`,
    'danger',
    async () => {
      const ids = [...selectedItems.value]
      for (const id of ids) {
        await messageStore.deleteMessage(id)
      }
      selectedItems.value = []
    },
  )
}

function toggleSelectAll() {
  if (selectedItems.value.length === paginatedItems.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = paginatedItems.value.map((i) => i.id)
  }
}

function sortBy(key) {
  if (sortKey.value === key) {
    if (sortOrder.value === 'asc') sortOrder.value = 'desc'
    else if (sortOrder.value === 'desc') sortOrder.value = null
    else sortOrder.value = 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function getSortIcon(key) {
  if (sortKey.value !== key) return 'fas fa-sort text-gray-300'
  if (sortOrder.value === 'asc') return 'fas fa-sort-up text-purple-600'
  if (sortOrder.value === 'desc') return 'fas fa-sort-down text-purple-600'
  return 'fas fa-sort text-gray-300'
}

function formatDate(iso) {
  return new Date(iso).toLocaleString()
}

function initializeFromQuery() {
  if (route.query.search) {
    search.value = route.query.search
  } else if (route.query.highlight) {
    const hId = Number(route.query.highlight)
    const msg = messageStore.messages.find((m) => m.id === hId)
    if (msg) {
      search.value = msg.from
      openDetails(msg)
    } else {
      search.value = `#${hId}`
    }
  }
}

// --- Lifecycle & Watchers ---

onMounted(() => {
  messageStore.fetchMessages()
})

watch(
  () => route.query,
  () => initializeFromQuery(),
  { immediate: true },
)

watch(
  () => messageStore.messages.length,
  () => {
    if (route.query.highlight && search.value.startsWith('#')) {
      initializeFromQuery()
    }
  },
)

// --- Computed ---

const filteredMessages = computed(() => {
  let items = messageStore.messages.filter((msg) => {
    const searchLower = normalizeString(search.value)
    const isIdSearch = search.value.startsWith('#')
    const searchId = isIdSearch ? search.value.substring(1) : search.value

    const matchesSearch =
      normalizeString(msg.from).includes(searchLower) ||
      normalizeString(msg.email).includes(searchLower) ||
      normalizeString(msg.subject).includes(searchLower) ||
      msg.id.toString() === searchId

    let matchesStatus = true
    if (filterStatus.value === 'read') matchesStatus = msg.read
    if (filterStatus.value === 'unread') matchesStatus = !msg.read

    return matchesSearch && matchesStatus
  })

  if (sortOrder.value) {
    items.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]
      if (sortKey.value === 'date') {
        valA = new Date(a.date).getTime()
        valB = new Date(b.date).getTime()
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase()
        valB = valB.toLowerCase()
      }
      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return items
})

const { paginatedItems, currentPage, pageSize, totalPages, nextPage, prevPage } = usePagination(
  filteredMessages,
  10,
)

</script>

<template>
  <div class="space-y-6">
    <!-- Header Card removed -->

    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <!-- Filters and Bulk -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div class="flex flex-wrap gap-4 w-full md:w-auto flex-1 items-center">
          <!-- Bulk Delete -->
          <button
            v-if="selectedItems.length > 0"
            @click="deleteSelected"
            class="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-100 transition-all font-bold shadow-sm flex items-center gap-2 text-sm"
          >
            <i class="fas fa-trash"></i>
            Supprimer ({{ selectedItems.length }})
          </button>

          <!-- Search -->
          <div class="flex-1 min-w-[200px] max-w-md relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              v-model="search"
              type="text"
              placeholder="Rechercher (Nom, Email, Sujet)..."
              class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <!-- Status Filter -->
          <div class="w-full md:w-48">
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm bg-gray-50 focus:bg-white transition-colors"
            >
              <option value="">Tous les messages</option>
              <option value="unread">Non lus</option>
              <option value="read">Lus</option>
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
                @click="sortBy('from')"
              >
                <div class="flex items-center space-x-2">
                  <span>Expéditeur</span>
                  <i :class="getSortIcon('from')"></i>
                </div>
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('subject')"
              >
                <div class="flex items-center space-x-2">
                  <span>Sujet</span>
                  <i :class="getSortIcon('subject')"></i>
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
                @click="sortBy('read')"
              >
                <div class="flex items-center space-x-2">
                  <span>Statut</span>
                  <i :class="getSortIcon('read')"></i>
                </div>
              </th>
              <th class="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="msg in paginatedItems"
              :key="msg.id"
              class="hover:bg-purple-50/30 transition-colors group cursor-pointer"
              :class="{ 'bg-blue-50/50': !msg.read }"
              @click="openDetails(msg)"
            >
              <td class="p-4" @click.stop>
                <input
                  type="checkbox"
                  v-model="selectedItems"
                  :value="msg.id"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
              </td>
              <td class="p-4 text-xs text-gray-400 group-hover:text-purple-400">#{{ msg.id }}</td>
              <td class="p-4">
                <div class="font-bold text-gray-800">{{ msg.from }}</div>
                <div class="text-gray-500 text-xs">{{ msg.email }}</div>
              </td>
              <td class="p-4">
                <div class="font-medium text-gray-800 mb-1">{{ msg.subject }}</div>
                <div class="text-gray-500 text-xs truncate max-w-md">{{ msg.message }}</div>
              </td>
              <td class="p-4 text-gray-600 whitespace-nowrap text-sm">
                {{ formatDate(msg.date) }}
              </td>
              <td class="p-4">
                <span
                  :class="
                    msg.read
                      ? 'bg-gray-100 text-gray-700 border border-gray-200'
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  "
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm"
                >
                  {{ msg.read ? 'Lu' : 'Nouveau' }}
                </span>
              </td>
              <td class="p-4" @click.stop>
                <div class="flex justify-end space-x-2">
                  <button
                    @click="toggleRead(msg)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    :class="
                      msg.read
                        ? 'text-gray-400 hover:text-blue-500 hover:border-blue-200'
                        : 'text-blue-500 hover:text-blue-600 hover:border-blue-200'
                    "
                    :title="msg.read ? 'Marquer comme non lu' : 'Marquer comme lu'"
                  >
                    <i :class="msg.read ? 'fas fa-envelope' : 'fas fa-envelope-open text-xs'"></i>
                  </button>
                  <button
                    @click="deleteMsg(msg.id)"
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
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none"
          >
            <i class="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      @confirm="handleConfirm"
      @cancel="confirmModal.isOpen = false"
    />

    <MessageDetailsModal
      :show="showDetailsModal"
      :message="selectedMessage"
      @close="showDetailsModal = false"
    />
  </div>
</template>

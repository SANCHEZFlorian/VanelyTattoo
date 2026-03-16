<script setup>
import { ref, computed, watch } from 'vue'
import { useBookingStore } from '../../stores/booking'
import { useNotificationStore } from '../../stores/notification'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { usePagination } from '../../composables/usePagination'
import { normalizeString } from '../../utils/stringUtils'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'
import BookingDetailsModal from '../../components/admin/BookingDetailsModal.vue'

const bookingStore = useBookingStore()
const notificationStore = useNotificationStore()
useI18n()
const route = useRoute()

const filterStatus = ref('')
const search = ref('')

// Deep Linking Initialization
if (route.query.search) {
  search.value = route.query.search
}

// Watch route for highlight to prefill search
const initializeSearchFromHighlight = () => {
  const hId = route.query.highlight ? Number(route.query.highlight) : null
  if (hId) {
    const booking = bookingStore.bookings.find((b) => b.id === hId)
    if (booking) {
      search.value = booking.client
    }
  }
}
watch(() => route.query.highlight, initializeSearchFromHighlight, { immediate: true })

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
  if (sortOrder.value === 'asc') return 'fas fa-sort-up text-pink-600'
  if (sortOrder.value === 'desc') return 'fas fa-sort-down text-pink-600'
  return 'fas fa-sort text-gray-300'
}

const filteredBookings = computed(() => {
  let items = bookingStore.bookings.filter((b) => {
    const matchesStatus = filterStatus.value ? b.status === filterStatus.value : true
    const searchLower = normalizeString(search.value)
    const matchesSearch =
      normalizeString(b.client).includes(searchLower) ||
      normalizeString(b.tattoo).includes(searchLower) ||
      (b.project && normalizeString(b.project).includes(searchLower))

    return matchesStatus && matchesSearch
  })

  // Sort logic
  if (sortOrder.value) {
    items.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]

      if (sortKey.value === 'date') {
        valA = new Date(a.date).getTime()
        valB = new Date(b.date).getTime()
      }

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return items
})

const updateStatus = (id, status) => {
  if (status === 'cancelled') {
    openConfirmModal(
      'Annuler le rendez-vous',
      'Voulez-vous vraiment annuler ce rendez-vous ? Un mail de confirmation pourra être envoyé plus tard.',
      'danger',
      () => bookingStore.updateStatus(id, status),
    )
  } else {
    bookingStore.updateStatus(id, status)
  }
}

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

// Modal Logic
const showModal = ref(false)
const selectedBooking = ref(null)

const openBookingDetails = (booking) => {
  selectedBooking.value = booking
  showModal.value = true
}

const handleModalSave = () => {
  // Modal handles saving logic, we just might need to refresh or notify
  notificationStore.addNotification('Succès', 'Rendez-vous mis à jour', 'success')
}

// Bulk Actions
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
    'Supprimer la sélection',
    `Voulez-vous vraiment supprimer ${selectedItems.value.length} réservation(s) ?`,
    'danger',
    async () => {
      const ids = [...selectedItems.value]
      for (const id of ids) {
        if (bookingStore.deleteBooking) {
          await bookingStore.deleteBooking(id)
        } else {
          await bookingStore.updateStatus(id, 'cancelled')
        }
      }
      selectedItems.value = []
      notificationStore.addNotification('Succès', 'Éléments traités', 'success')
    },
  )
}

// Pagination
const { paginatedItems, currentPage, pageSize, totalPages, nextPage, prevPage } = usePagination(
  filteredBookings,
  10,
)
</script>

<template>
  <div class="space-y-6">
    <!-- Header Card removed -->

    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <!-- Filters and Bulk Actions -->
      <div class="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <!-- Left Side: Search, Filter, Bulk Actions -->
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
              <option value="">{{ $t('booking.filters.all') }}</option>
              <option value="pending">{{ $t('status.pending') }}</option>
              <option value="confirmed">{{ $t('status.confirmed') }}</option>
              <option value="cancelled">{{ $t('status.cancelled') }}</option>
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
                @click="sortBy('client')"
              >
                <div class="flex items-center space-x-2">
                  <span>{{ $t('booking.table.client') }}</span>
                  <i :class="getSortIcon('client')"></i>
                </div>
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('project')"
              >
                <div class="flex items-center space-x-2">
                  <span>{{ $t('booking.table.project') }}</span>
                  <i :class="getSortIcon('project')"></i>
                </div>
              </th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('date')"
              >
                <div class="flex items-center space-x-2">
                  <span>{{ $t('booking.table.date') }}</span>
                  <i :class="getSortIcon('date')"></i>
                </div>
              </th>
              <th class="text-left p-4">{{ $t('booking.table.email') }}</th>
              <th
                class="text-left p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('status')"
              >
                <div class="flex items-center space-x-2">
                  <span>{{ $t('booking.table.status') }}</span>
                  <i :class="getSortIcon('status')"></i>
                </div>
              </th>
              <th class="text-right p-4">{{ $t('booking.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="booking in paginatedItems"
              :key="booking.id"
              class="hover:bg-purple-50/30 transition-colors group cursor-pointer"
              @click="openEditModal(booking)"
            >
              <td class="p-4" @click.stop>
                <input
                  type="checkbox"
                  v-model="selectedItems"
                  :value="booking.id"
                  class="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
              </td>
              <td class="p-4 text-xs text-gray-400 group-hover:text-purple-400">
                #{{ booking.id }}
              </td>
              <td class="p-4 font-medium text-gray-900">{{ booking.client }}</td>
              <td class="p-4 text-gray-600 flex items-center gap-2">
                <img
                  v-if="booking.image"
                  :src="booking.image"
                  class="w-10 h-10 rounded object-cover border border-gray-200"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400 border border-gray-200"
                >
                  <i class="fas fa-user"></i>
                </div>
                <div class="flex flex-col">
                  <span class="font-medium text-gray-800">{{
                    booking.project || booking.tattoo
                  }}</span>
                  <div
                    v-if="booking.size || booking.placement || booking.budget"
                    class="text-[10px] text-purple-500 font-medium"
                  >
                    {{ booking.size }} | {{ booking.placement }} | {{ booking.budget }}
                  </div>
                  <div
                    v-if="booking.description"
                    class="text-[10px] text-gray-400 max-w-[200px] truncate"
                    :title="booking.description"
                  >
                    {{ booking.description }}
                  </div>
                </div>
              </td>
              <td class="p-4 text-gray-600">
                <div class="font-medium text-gray-700">{{ booking.date }}</div>
                <div class="text-xs text-purple-600 font-medium">
                  {{ booking.time }} - {{ booking.endTime || '?' }}
                </div>
              </td>
              <td class="p-4 text-blue-500 hover:text-blue-700 cursor-pointer text-sm" @click.stop>
                {{ booking.email }}
              </td>
              <td class="p-4">
                <span
                  :class="{
                    'bg-yellow-100 text-yellow-700 border border-yellow-200':
                      booking.status === 'pending',
                    'bg-green-100 text-green-700 border border-green-200':
                      booking.status === 'confirmed',
                    'bg-red-100 text-red-700 border border-red-200': booking.status === 'cancelled',
                  }"
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm"
                >
                  {{ $t(`status.${booking.status}`) }}
                </span>
              </td>
              <td class="p-4" @click.stop>
                <div class="flex justify-end space-x-2">
                  <button
                    @click="openEditModal(booking)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Modifier Date"
                  >
                    <i class="fas fa-calendar-alt text-xs"></i>
                  </button>
                  <button
                    v-if="booking.status !== 'confirmed'"
                    @click="updateStatus(booking.id, 'confirmed')"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-green-500 hover:text-green-600 hover:border-green-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Confirmer"
                  >
                    <i class="fas fa-check text-xs"></i>
                  </button>
                  <button
                    v-if="booking.status !== 'cancelled'"
                    @click="updateStatus(booking.id, 'cancelled')"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-red-500 hover:text-red-600 hover:border-red-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Annuler"
                  >
                    <i class="fas fa-times text-xs"></i>
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

    <!-- Edit Date Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 class="text-lg font-bold mb-4">Modifier le créneau</h3>
        <p class="text-sm text-gray-600 mb-4">
          Client: <span class="font-medium">{{ editingBooking?.client }}</span>
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Date</label>
            <input v-model="editForm.date" type="date" class="w-full border rounded p-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Heure de début</label>
            <select v-model="editForm.time" class="w-full border rounded p-2 text-sm">
              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Heure de fin</label>
            <select v-model="editForm.endTime" class="w-full border rounded p-2 text-sm">
              <option value="">-</option>
              <option v-for="t in timeSlots" :key="'end-' + t" :value="t">{{ t }}</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            @click="showModal = false"
            class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Annuler
          </button>
          <button
            @click="saveBookingChanges(false)"
            class="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
          >
            Enregistrer
          </button>
          <button
            v-if="editingBooking?.status !== 'confirmed'"
            @click="saveBookingChanges(true)"
            class="px-3 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm font-bold shadow-sm"
          >
            Enregistrer & Confirmer
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
  </div>
</template>

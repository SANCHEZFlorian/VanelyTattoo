<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/lib/api'
import LogDetailsModal from '../../components/admin/LogDetailsModal.vue'

const logs = ref([])
const loading = ref(false)
const filters = ref({
  action: '',
  table: '',
})

// Sorting
const sortKey = ref('created_at')
const sortOrder = ref('desc') // 'asc' | 'desc'

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

const fetchLogs = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/logs')
    logs.value = data
  } catch (error) {
    console.error('Error fetching logs:', error)
  } finally {
    loading.value = false
  }
}

const filteredLogs = computed(() => {
  let items = logs.value.filter((log) => {
    const matchAction = filters.value.action ? log.action_type.includes(filters.value.action) : true
    const target = log.table_name || log.details?.table || log.details?.context || ''
    const matchTable = filters.value.table ? target.includes(filters.value.table) : true
    return matchAction && matchTable
  })

  if (sortOrder.value) {
    items.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]

      // Handle nested or specific keys
      if (sortKey.value === 'target') {
        valA = a.table_name || a.details?.table || a.details?.context || ''
        valB = b.table_name || b.details?.table || b.details?.context || ''
      }

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return items
})

const getActionClass = (action) => {
  if (!action) return 'bg-gray-100 text-gray-700 border-gray-200'
  if (action.includes('create')) return 'bg-green-100 text-green-700 border-green-200'
  if (action.includes('update')) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (action.includes('delete')) return 'bg-red-100 text-red-700 border-red-200'
  if (action.includes('auth')) return 'bg-purple-100 text-purple-700 border-purple-200'
  if (action.includes('error')) return 'bg-red-50 text-red-600 border-red-100'
  return 'bg-gray-100 text-gray-700 border-gray-200'
}

const formatDetails = (details) => {
  if (!details) return ''
  if (typeof details === 'string') return details

  // Extract common fields
  const { title, name, email, ...rest } = details
  let summary = []

  if (title) summary.push(`Title: "${title}"`)
  if (name) summary.push(`Nom: "${name}"`)
  if (email) summary.push(`Email: "${email}"`)

  // Check for specific change sets (updates)
  if (details.updates) {
    const changes = Object.keys(details.updates)
      .map((k) => `${k}: ${details.updates[k]}`)
      .join(', ')
    if (changes) summary.push(`Modif: ${changes}`)
  }

  // Clean up technical updates if they exist directly
  if (details.error) {
    summary.push(`Erreur: ${details.error.message || details.error}`)
  }

  if (summary.length > 0) {
    return summary.join(' | ')
  }

  // Fallback for other fields, excluding internal ones
  const { table, id, context, user_id, ...cleanRest } = details
  const remainder = Object.entries(cleanRest)
    .filter(([key]) => !['error', 'updates'].includes(key))
    .map(([key, val]) => `${key}: ${val}`)
    .join(', ')

  if (remainder) return remainder
  return id ? `Ref ID: ${id}` : 'Détails non disponibles'
}

// Modal state
const showModal = ref(false)
const selectedLog = ref(null)

const openDetails = (log) => {
  selectedLog.value = log
  showModal.value = true
}

onMounted(() => {
  fetchLogs()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex flex-col md:flex-row justify-between items-center gap-4"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl"
        >
          <i class="fas fa-list"></i>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Logs Système</h1>
          <p class="text-gray-500 text-sm">Visualisez les actions et événements du site.</p>
        </div>
      </div>
      <button
        @click="fetchLogs"
        class="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2"
      >
        <i class="fas fa-sync-alt" :class="{ 'animate-spin': loading }"></i>
        Actualiser
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1">Action</label>
        <select
          v-model="filters.action"
          class="w-full rounded-lg border-gray-200 text-sm focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Toutes</option>
          <option value="create">Création</option>
          <option value="update">Mise à jour</option>
          <option value="delete">Suppression</option>
          <option value="auth">Authentification</option>
          <option value="error">Erreur</option>
        </select>
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
          >Table / Cible</label
        >
        <select
          v-model="filters.table"
          class="w-full rounded-lg border-gray-200 text-sm focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Toutes</option>
          <option value="gallery">Galerie</option>
          <option value="flash">Flash</option>
          <option value="bookings">Réservations</option>
          <option value="blog">Blog</option>
          <option value="login">Connexion</option>
        </select>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="text-center py-12 text-gray-400">
        <i class="fas fa-circle-notch animate-spin text-2xl mb-2"></i>
        <p>Chargement des logs...</p>
      </div>

      <div v-else-if="filteredLogs.length === 0" class="text-center py-12 text-gray-400">
        <p>Aucun log trouvé.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="bg-gray-50/50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-100"
          >
            <tr>
              <th
                class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('created_at')"
              >
                <div class="flex items-center space-x-2">
                  <span>Date</span>
                  <i :class="getSortIcon('created_at')"></i>
                </div>
              </th>
              <th
                class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('action_type')"
              >
                <div class="flex items-center space-x-2">
                  <span>Action</span>
                  <i :class="getSortIcon('action_type')"></i>
                </div>
              </th>
              <th
                class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('target')"
              >
                <div class="flex items-center space-x-2">
                  <span>Cible</span>
                  <i :class="getSortIcon('target')"></i>
                </div>
              </th>
              <th class="p-4">Détails</th>
              <th
                class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('user_id')"
              >
                <div class="flex items-center space-x-2">
                  <span>Utilisateur</span>
                  <i :class="getSortIcon('user_id')"></i>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="log in filteredLogs"
              :key="log.id"
              class="hover:bg-purple-50/10 transition-colors cursor-pointer"
              @click="openDetails(log)"
            >
              <td class="p-4 text-xs text-gray-500 whitespace-nowrap">
                {{ new Date(log.created_at).toLocaleString('fr-FR') }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border"
                  :class="getActionClass(log.action_type)"
                >
                  {{ log.action_type }}
                </span>
              </td>
              <td class="p-4 text-sm font-medium text-gray-700">
                {{ log.table_name || log.details?.table || log.details?.context || '-' }}
              </td>
              <td
                class="p-4 text-sm text-gray-600 max-w-xs truncate"
                :title="JSON.stringify(log.details)"
              >
                {{ formatDetails(log.details) }}
              </td>
              <td class="p-4 text-xs text-gray-500">
                {{ log.user_id ? String(log.user_id).slice(0, 8) + '...' : 'Système' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <LogDetailsModal :show="showModal" :log="selectedLog" @close="showModal = false" />
  </div>
</template>

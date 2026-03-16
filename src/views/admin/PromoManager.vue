<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-3">
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        Nouvelle Promotion
      </button>
    </div>

    <!-- Info Box -->
    <div
      class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-800 text-sm flex items-start gap-3"
    >
      <i class="fas fa-info-circle mt-0.5 text-blue-500"></i>
      <p>
        Les promotions actives s'appliquent automatiquement aux prix affichés sur la galerie. Si
        plusieurs promotions s'appliquent au même flash, la réduction la plus avantageuse est
        retenue.
      </p>
    </div>

    <div v-if="promoStore.loading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-purple-500 text-2xl"></i>
    </div>

    <div
      v-else-if="promoStore.error"
      class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center"
    >
      {{ promoStore.error }}
    </div>

    <!-- Content Card -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr
            class="bg-gray-50/50 text-gray-700 text-xs font-semibold uppercase border-b border-gray-100"
          >
            <th
              class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
              @click="sortBy('id')"
            >
              <div class="flex items-center space-x-2">
                <span>ID</span>
                <i :class="getSortIcon('id')"></i>
              </div>
            </th>
            <th
              class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
              @click="sortBy('name')"
            >
              <div class="flex items-center space-x-2">
                <span>Nom</span>
                <i :class="getSortIcon('name')"></i>
              </div>
            </th>
            <th
              class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
              @click="sortBy('discount_percent')"
            >
              <div class="flex items-center space-x-2">
                <span>Réduction</span>
                <i :class="getSortIcon('discount_percent')"></i>
              </div>
            </th>
            <th
              class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
              @click="sortBy('is_global')"
            >
              <div class="flex items-center space-x-2">
                <span>Cible</span>
                <i :class="getSortIcon('is_global')"></i>
              </div>
            </th>
            <th
              class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
              @click="sortBy('start_date')"
            >
              <div class="flex items-center space-x-2">
                <span>Dates</span>
                <i :class="getSortIcon('start_date')"></i>
              </div>
            </th>
            <th
              class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
              @click="sortBy('active')"
            >
              <div class="flex items-center space-x-2">
                <span>Statut</span>
                <i :class="getSortIcon('active')"></i>
              </div>
            </th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="promo in sortedPromotions"
            :key="promo.id"
            class="hover:bg-purple-50/30 transition-colors group"
          >
            <td
              class="p-4 text-gray-400 text-xs group-hover:text-purple-400 cursor-pointer"
              @click="openModal(promo)"
            >
              #{{ promo.id }}
            </td>
            <td
              class="p-4 text-gray-800 font-bold cursor-pointer hover:text-purple-700 transition-colors"
              @click="openModal(promo)"
            >
              {{ promo.name }}
            </td>
            <td class="p-4">
              <span
                class="bg-green-100 text-green-700 border border-green-200 px-2 py-1 rounded-md text-xs font-bold shadow-sm"
              >
                -{{ promo.discount_percent }}%
              </span>
            </td>
            <td class="p-4 text-sm text-gray-600">
              <span v-if="promo.is_global" class="flex items-center gap-1"
                ><i class="fas fa-globe text-gray-400"></i> Tous les flashs</span
              >
              <span v-else class="flex items-center gap-1">
                <i class="fas fa-bullseye text-gray-400"></i>
                {{ (promo.target_flashes || []).length }} flash(s)
              </span>
            </td>
            <td class="p-4 text-sm text-gray-600">
              <div v-if="promo.start_date" class="whitespace-nowrap">
                <span class="text-xs text-gray-400">Du</span> {{ formatDate(promo.start_date) }}
              </div>
              <div v-if="promo.end_date" class="whitespace-nowrap">
                <span class="text-xs text-gray-400">Au</span> {{ formatDate(promo.end_date) }}
              </div>
              <div v-if="!promo.start_date && !promo.end_date" class="text-gray-400 italic text-xs">
                Permanent
              </div>
            </td>
            <td class="p-4" @click.stop>
              <div class="relative group/status">
                <select
                  :value="promo.active"
                  @change="quickUpdateStatus(promo, $event.target.value === 'true')"
                  class="appearance-none pl-3 pr-8 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer transition-all border"
                  :class="
                    promo.active
                      ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                  "
                >
                  <option :value="true">Actif</option>
                  <option :value="false">Inactif</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <i
                    class="fas fa-chevron-down text-[10px]"
                    :class="promo.active ? 'text-green-700' : 'text-gray-500'"
                  ></i>
                </div>
              </div>
            </td>
            <td class="p-4 text-right">
              <div
                class="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2"
              >
                <button
                  @click="openModal(promo)"
                  class="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                  title="Modifier"
                >
                  <i class="fas fa-pen text-xs"></i>
                </button>
                <button
                  @click="confirmDelete(promo.id)"
                  class="w-8 h-8 rounded-full bg-white border border-gray-200 text-red-500 hover:text-red-600 hover:border-red-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                  title="Supprimer"
                >
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="promoStore.promotions.length === 0">
            <td colspan="7" class="p-12 text-center text-gray-400">
              <div class="flex flex-col items-center">
                <i class="fas fa-percentage text-4xl mb-4 text-gray-200"></i>
                <p>Aucune promotion configurée.</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <BaseModal
      :show="showModal"
      :title="editingId ? 'Modifier la promotion' : 'Nouvelle promotion'"
      @close="closeModal"
    >
      <div class="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <BaseInput
              v-model="form.name"
              label="Nom de la promotion"
              placeholder="Ex: Black Friday"
              required
            />
          </div>
          <div>
            <BaseInput
              v-model.number="form.discount_percent"
              label="Réduction (%)"
              type="number"
              min="1"
              max="100"
              required
            />
          </div>
          <div class="flex items-center pt-6">
            <!-- Align with input -->
            <label class="flex items-center cursor-pointer select-none">
              <input v-model="form.active" type="checkbox" class="sr-only peer" />
              <div
                class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
              ></div>
              <span class="ms-3 text-sm font-medium text-gray-700">Promotion Active</span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.start_date" label="Date de début" type="date" />
          <BaseInput v-model="form.end_date" label="Date de fin" type="date" />
        </div>

        <hr class="border-gray-100 my-2" />

        <!-- Targeting -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cible de la promotion</label>
          <div class="flex space-x-4 mb-4">
            <label class="flex items-center">
              <input
                type="radio"
                v-model="form.is_global"
                :value="true"
                class="text-purple-600 focus:ring-purple-500"
              />
              <span class="ml-2 text-sm text-gray-700">Tous les flashs</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="form.is_global"
                :value="false"
                class="text-purple-600 focus:ring-purple-500"
              />
              <span class="ml-2 text-sm text-gray-700">Sélectionner des flashs spécifiques</span>
            </label>
          </div>

          <!-- Flash Selection List -->
          <div v-if="!form.is_global" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-semibold text-gray-500 uppercase">Flashs disponibles</span>
              <div class="space-x-2">
                <button
                  @click.prevent="selectAll"
                  class="text-xs text-purple-600 hover:text-purple-800"
                >
                  Tout cocher
                </button>
                <span class="text-gray-300">|</span>
                <button
                  @click.prevent="deselectAll"
                  class="text-xs text-gray-500 hover:text-gray-700"
                >
                  Tout décocher
                </button>
              </div>
            </div>

            <div
              class="max-h-48 overflow-y-auto space-y-2 bg-white p-2 border border-gray-100 rounded"
            >
              <div v-if="flashStore.loading" class="text-center text-sm text-gray-500 py-2">
                Chargement des flashs...
              </div>
              <label
                v-else
                v-for="flash in flashStore.flashTattoos"
                :key="flash.id"
                class="flex items-center p-2 hover:bg-purple-50 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  :value="flash.id"
                  v-model="form.target_flashes"
                  class="rounded text-purple-600 focus:ring-purple-500 mr-3"
                />
                <img
                  v-if="flash.images && flash.images.length > 0"
                  :src="flash.images[0]"
                  alt=""
                  class="w-8 h-8 object-cover rounded mr-3 bg-gray-200"
                />
                <img
                  v-else-if="flash.image_url"
                  :src="flash.image_url"
                  alt=""
                  class="w-8 h-8 object-cover rounded mr-3 bg-gray-200"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded mr-3 bg-gray-200 flex items-center justify-center"
                >
                  <i class="fas fa-bolt text-gray-400 text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">
                    {{ flash.title || 'Flash sans titre' }}
                  </p>
                  <p class="text-xs text-gray-500">{{ flash.price }}€</p>
                </div>
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-2 text-right">
              {{ form.target_flashes.length }} flash(s) sélectionné(s)
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="closeModal"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-2"
        >
          Annuler
        </button>
        <button
          @click="savePromo"
          :disabled="promoStore.loading"
          class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ promoStore.loading ? 'Enregistrement...' : 'Enregistrer' }}
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
import { ref, onMounted, computed } from 'vue'
import { usePromoStore } from '@/stores/promo'
import { useFlashStore } from '@/stores/flash'
import { useNotificationStore } from '@/stores/notification'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'

const promoStore = usePromoStore()
const flashStore = useFlashStore()
const notificationStore = useNotificationStore()

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

const quickUpdateStatus = async (promo, newStatus) => {
  // Optimistic UI update
  const originalStatus = promo.active
  promo.active = newStatus

  const res = await promoStore.savePromo({ id: promo.id, active: newStatus })

  if (res.success) {
    notificationStore.addNotification('Succès', 'Statut mis à jour.', 'success')
  } else {
    // Revert
    promo.active = originalStatus
    notificationStore.addNotification('Erreur', res.message, 'error')
  }
}

const showModal = ref(false)
const editingId = ref(null)

// Sorting
const sortKey = ref('id')
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

const sortedPromotions = computed(() => {
  let items = [...promoStore.promotions]
  if (sortOrder.value) {
    items.sort((a, b) => {
      let valA = a[sortKey.value]
      let valB = b[sortKey.value]

      if (typeof valA === 'string') {
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

const form = ref({
  name: '',
  discount_percent: 10,
  start_date: '',
  end_date: '',
  active: true,
  is_global: true,
  target_flashes: [],
})

onMounted(() => {
  promoStore.fetchPromotions()
  // We need flashes to display selection list
  flashStore.fetchFlashTattoos()
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const openModal = (promo = null) => {
  if (promo) {
    editingId.value = promo.id
    // Clone logic to avoid direct reference mutation
    form.value = {
      ...promo,
      target_flashes: promo.target_flashes ? [...promo.target_flashes] : [], // Ensure new array
    }
  } else {
    editingId.value = null
    form.value = {
      name: '',
      discount_percent: 10,
      start_date: '',
      end_date: '',
      active: true,
      is_global: true,
      target_flashes: [],
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const selectAll = () => {
  form.value.target_flashes = flashStore.flashTattoos.map((f) => f.id)
}

const deselectAll = () => {
  form.value.target_flashes = []
}

const savePromo = async () => {
  if (!form.value.name) {
    notificationStore.addNotification('Erreur', 'Veuillez donner un nom à la promotion.', 'error')
    return
  }

  // Ensure target_flashes is an array (even if empty) to prevent JSON errors
  if (!Array.isArray(form.value.target_flashes)) {
    form.value.target_flashes = []
  }

  const res = await promoStore.savePromo(form.value)
  if (res.success) {
    closeModal()
  } else {
    notificationStore.addNotification('Erreur', res.message, 'error')
  }
}

const confirmDelete = async (id) => {
  openConfirmModal(
    'Supprimer la promotion',
    'Êtes-vous sûr de vouloir supprimer cette promotion ? Cette action est irréversible.',
    'danger',
    () => promoStore.deletePromo(id),
  )
}
</script>

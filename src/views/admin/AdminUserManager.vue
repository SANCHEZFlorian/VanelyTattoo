<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-3">
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        Ajouter un administrateur
      </button>
    </div>

    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <div
        class="bg-purple-50/50 border border-purple-100 rounded-xl p-4 mb-6 text-purple-800 text-sm flex items-start gap-3"
      >
        <i class="fas fa-user-plus mt-0.5 text-purple-500"></i>
        <p>
          Gestion des comptes utilisateurs. Vous pouvez créer de nouveaux comptes pour les tatoueurs
          ou d'autres administrateurs. Ils pourront ensuite se connecter avec leurs identifiants.
        </p>
      </div>

      <div v-if="userStore.loading" class="text-gray-500 text-center py-8">
        Chargement en cours...
      </div>
      <div v-else-if="userStore.error" class="text-red-500 text-center py-8">
        {{ userStore.error }}
      </div>

      <div v-else class="overflow-x-auto rounded-xl border border-gray-100">
        <table class="w-full text-left">
          <thead
            class="bg-gray-50/50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-100"
          >
            <tr>
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
                @click="sortBy('full_name')"
              >
                <div class="flex items-center space-x-2">
                  <span>Nom</span>
                  <i :class="getSortIcon('full_name')"></i>
                </div>
              </th>
              <th
                class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('email')"
              >
                <div class="flex items-center space-x-2">
                  <span>Email</span>
                  <i :class="getSortIcon('email')"></i>
                </div>
              </th>
              <th
                class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('role')"
              >
                <div class="flex items-center space-x-2">
                  <span>Rôle</span>
                  <i :class="getSortIcon('role')"></i>
                </div>
              </th>
              <th
                class="p-4 cursor-pointer hover:bg-gray-100 hover:text-purple-600 transition-colors"
                @click="sortBy('created_at')"
              >
                <div class="flex items-center space-x-2">
                  <span>Date de création</span>
                  <i :class="getSortIcon('created_at')"></i>
                </div>
              </th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="user in sortedUsers"
              :key="user.id"
              class="hover:bg-purple-50/30 transition-colors group"
            >
              <td class="p-4 text-gray-400 text-xs" :title="user.id">
                {{ user.id.slice(0, 8) }}...
              </td>
              <td class="p-4 text-gray-800">
                <div class="flex items-center">
                  <div
                    class="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3 text-xs"
                  >
                    <i class="fas fa-user"></i>
                  </div>
                  <span class="font-medium">{{ user.full_name || '-' }}</span>
                </div>
              </td>
              <td class="p-4 text-gray-600">
                <span class="text-sm">{{ user.email }}</span>
              </td>
              <td class="p-4">
                <span
                  class="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-purple-200"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="p-4 text-gray-600 text-sm">
                {{ new Date(user.created_at).toLocaleDateString() }}
              </td>
              <td class="p-4 text-right">
                <div
                  class="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity gap-2"
                >
                  <button
                    @click="openModal(user)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-blue-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Modifier le rôle"
                  >
                    <i class="fas fa-user-tag text-xs"></i>
                  </button>
                  <button
                    @click="confirmDelete(user.id)"
                    class="w-8 h-8 rounded-full bg-white border border-gray-200 text-red-500 hover:text-red-600 hover:border-red-200 hover:shadow-md flex items-center justify-center transition-all transform hover:scale-110"
                    title="Supprimer"
                  >
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="userStore.users.length === 0">
              <td colspan="5" class="p-12 text-center text-gray-400 italic">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <BaseModal
      :show="showModal"
      :title="isEditing ? 'Modifier le rôle' : 'Ajouter un administrateur'"
      @close="closeModal"
    >
      <div class="space-y-4">
        <div>
          <BaseInput
            v-model="form.email"
            label="Email"
            type="email"
            required
            :disabled="isEditing"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
          <select
            v-model="form.role"
            class="w-full rounded-lg border-gray-200 focus:ring-purple-500 focus:border-purple-500 text-sm"
          >
            <option value="admin">Administrateur</option>
            <option value="artist">Artiste</option>
            <option value="user">Utilisateur</option>
          </select>
        </div>

        <div>
          <BaseInput
            v-model="form.full_name"
            label="Nom complet"
            type="text"
            placeholder="Ex: Jean Dupont"
          />
        </div>

        <div v-if="!isEditing">
          <BaseInput
            v-model="form.password"
            label="Mot de passe"
            type="password"
            required
            placeholder="********"
          />
          <p class="text-xs text-gray-500 mt-1">
            Définissez un mot de passe initial pour l'utilisateur.
          </p>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="closeModal"
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-2 transition-colors font-medium"
        >
          Annuler
        </button>
        <button
          @click="saveUser"
          class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
        >
          {{ isEditing ? 'Mettre à jour' : 'Ajouter' }}
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
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'

const userStore = useUserStore()
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

const showModal = ref(false)
const isEditing = ref(false)
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

const sortedUsers = computed(() => {
  let items = [...userStore.users]
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
  email: '',
  full_name: '',
  password: '',
  role: 'admin',
})

onMounted(() => {
  userStore.fetchUsers()
})

const openModal = (user = null) => {
  if (user) {
    isEditing.value = true
    editingId.value = user.id
    form.value = {
      email: user.email,
      full_name: user.full_name || '',
      password: '',
      role: user.role || 'admin',
    }
  } else {
    isEditing.value = false
    editingId.value = null
    form.value = {
      email: '',
      full_name: '',
      password: '',
      role: 'artist',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveUser = async () => {
  if (isEditing.value) {
    const res = await userStore.updateUserRole(editingId.value, form.value.role)
    if (res.success) closeModal()
    else notificationStore.addNotification('Erreur', res.message, 'error')
  } else {
    const res = await userStore.createUser(form.value.email, form.value.password, form.value.role, form.value.full_name)
    if (res.success) closeModal()
    else notificationStore.addNotification('Erreur', res.message, 'error')
  }
}

const confirmDelete = async (id) => {
  openConfirmModal(
    "Supprimer l'utilisateur",
    'Êtes-vous sûr de vouloir supprimer cet utilisateur admin ?',
    'danger',
    () => userStore.deleteUser(id),
  )
}
</script>

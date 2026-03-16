<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '../../stores/category'
import ConfirmModal from '../ui/ConfirmModal.vue'

const props = defineProps({
  isUsedCallback: {
    type: Function,
    required: true,
  },
})

const categoryStore = useCategoryStore()
const newCategoryName = ref('')
const editingCategory = ref({ original: null, current: '' })
const loading = ref(false)

const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  action: null,
})

const openConfirmModal = (title, message, action) => {
  confirmModal.value = { isOpen: true, title, message, action }
}

const handleConfirm = () => {
  if (confirmModal.value.action) confirmModal.value.action()
  confirmModal.value.isOpen = false
}

const addCategory = async () => {
  if (!newCategoryName.value.trim()) return
  loading.value = true
  const success = await categoryStore.addCategory(newCategoryName.value.trim())
  if (success) {
    newCategoryName.value = ''
  }
  loading.value = false
}

const startEditing = (name) => {
  editingCategory.value = { original: name, current: name }
}

const cancelEditing = () => {
  editingCategory.value = { original: null, current: '' }
}

const submitRename = async () => {
  const { original, current } = editingCategory.value
  if (!current.trim() || current.trim() === original) {
    cancelEditing()
    return
  }

  loading.value = true
  const success = await categoryStore.renameCategory(original, current.trim())
  if (success) {
    cancelEditing()
  }
  loading.value = false
}

const deleteCategory = (name) => {
  openConfirmModal(
    'Supprimer la catégorie',
    `Voulez-vous vraiment supprimer la catégorie "${name}" ?`,
    () => categoryStore.deleteCategory(name, props.isUsedCallback),
  )
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<template>
  <div class="space-y-4">
    <div class="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-4">
      <p class="text-xs text-purple-700 font-medium leading-relaxed">
        <i class="fas fa-info-circle mr-1"></i>
        Les catégories permettent de classer vos flashs et éléments de galerie. Vous ne pouvez pas
        supprimer une catégorie si elle est actuellement utilisée.
      </p>
    </div>

    <!-- Add Category Form -->
    <div class="flex gap-2">
      <div class="relative flex-1">
        <i class="fas fa-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="newCategoryName"
          type="text"
          placeholder="Nouvelle catégorie..."
          @keyup.enter="addCategory"
          class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all"
        />
      </div>
      <button
        @click="addCategory"
        :disabled="loading || !newCategoryName.trim()"
        class="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-plus'"></i>
        <span>Ajouter</span>
      </button>
    </div>

    <!-- Category List -->
    <div class="overflow-hidden rounded-xl border border-gray-100">
      <div
        v-if="categoryStore.loading && categoryStore.categories.length === 0"
        class="p-8 text-center bg-gray-50"
      >
        <i class="fas fa-spinner fa-spin text-purple-600 text-xl mb-2"></i>
        <p class="text-sm text-gray-500">Chargement des catégories...</p>
      </div>

      <div v-else-if="categoryStore.categories.length === 0" class="p-8 text-center bg-gray-50">
        <i class="fas fa-tags text-gray-300 text-3xl mb-2"></i>
        <p class="text-sm text-gray-500">Aucune catégorie définie.</p>
      </div>

      <div v-else class="max-h-80 overflow-y-auto divide-y divide-gray-50">
        <div
          v-for="cat in categoryStore.categories"
          :key="cat"
          class="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group"
        >
          <div class="flex items-center gap-3 flex-1 overflow-hidden">
            <span
              class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors"
            >
              <i class="fas fa-hashtag text-xs"></i>
            </span>
            <div v-if="editingCategory.original === cat" class="flex-1 flex gap-2">
              <input
                v-model="editingCategory.current"
                type="text"
                class="flex-1 px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                @keyup.enter="submitRename"
                @keyup.esc="cancelEditing"
                autoFocus
              />
              <button @click="submitRename" class="text-green-600 hover:text-green-700">
                <i class="fas fa-check text-xs"></i>
              </button>
              <button @click="cancelEditing" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <span v-else class="text-sm font-medium text-gray-700 truncate">{{ cat }}</span>
          </div>

          <div class="flex gap-1">
            <button
              v-if="editingCategory.original !== cat"
              @click="startEditing(cat)"
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-purple-600 hover:bg-purple-50 transition-all opacity-0 group-hover:opacity-100"
              title="Renommer"
            >
              <i class="fas fa-edit text-xs"></i>
            </button>
            <button
              @click="deleteCategory(cat)"
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              title="Supprimer"
            >
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats summary -->
    <div
      class="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider px-1"
    >
      <span>Total: {{ categoryStore.categories.length }} catégories</span>
      <span>API Synchronisée</span>
    </div>

    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      type="danger"
      @confirm="handleConfirm"
      @close="confirmModal.isOpen = false"
    />
  </div>
</template>

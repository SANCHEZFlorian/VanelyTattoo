<script setup>
import { ref, onMounted, computed } from 'vue'
import { useNoteStore } from '../../stores/note'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import BaseModal from '../../components/ui/BaseModal.vue'
import BaseInput from '../../components/ui/BaseInput.vue'
import ConfirmModal from '../../components/ui/ConfirmModal.vue'

const noteStore = useNoteStore()
const router = useRouter()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const colors = [
  { name: 'Yellow', value: 'bg-yellow-200' },
  { name: 'Blue', value: 'bg-blue-200' },
  { name: 'Green', value: 'bg-green-200' },
  { name: 'Pink', value: 'bg-pink-200' },
  { name: 'Purple', value: 'bg-purple-200' },
  { name: 'Orange', value: 'bg-orange-200' },
]

const formData = ref({
  title: '',
  content: '',
  color: 'bg-yellow-200',
})

// Confirm Modal
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

onMounted(() => {
  noteStore.fetchNotes()
})

const openModal = (note = null) => {
  if (note) {
    isEditing.value = true
    editingId.value = note.id
    formData.value = { ...note } // Clone
  } else {
    isEditing.value = false
    editingId.value = null
    formData.value = {
      title: '',
      content: '',
      color: 'bg-yellow-200',
    }
  }
  showModal.value = true
}

const saveNote = async () => {
  if (isEditing.value) {
    await noteStore.updateNote(editingId.value, formData.value)
  } else {
    await noteStore.addNote(formData.value)
  }
  showModal.value = false
}

const deleteNote = (id) => {
  openConfirmModal('Supprimer la note', 'Voulez-vous vraiment jeter ce post-it ?', 'danger', () =>
    noteStore.deleteNote(id),
  )
}

const transformToEvent = (note) => {
  // Redirect to calendar with title prefilled
  router.push({
    path: '/admin/calendar',
    query: {
      action: 'create',
      title: note.title,
      description: note.content,
    },
  })
}

const toggleDone = async (note) => {
  await noteStore.updateNote(note.id, { is_done: !note.is_done })
}

// Drag functionality
const onDragEnd = () => {
  noteStore.updateNotesOrder(noteStore.notes)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-3">
      <button
        @click="openModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        Nouvelle Idée
      </button>
    </div>

    <!-- Draggable Grid -->
    <div
      v-if="noteStore.loading && noteStore.notes.length === 0"
      class="text-center py-10 text-gray-500"
    >
      <i class="fas fa-spinner fa-spin mr-2"></i> Chargement des notes...
    </div>

    <draggable
      v-else
      v-model="noteStore.notes"
      item-key="id"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 items-start"
      handle=".drag-handle"
      @end="onDragEnd"
      :animation="200"
      ghost-class="ghost-card"
    >
      <template #item="{ element: note }">
        <div
          :class="[note.color, note.is_done ? 'opacity-60 grayscale' : '']"
          class="relative shadow-sm transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 min-h-[220px] flex flex-col group rounded-sm border border-black/5"
          style="box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.05)"
        >
          <!-- Pin (Visual Only) -->
          <div
            class="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-sm border border-red-600 z-20 pointer-events-none"
          ></div>

          <!-- Drag Handle -->
          <div
            class="drag-handle absolute top-0 left-0 w-full h-8 cursor-move z-10"
            title="Déplacer"
          ></div>

          <!-- Content -->
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex justify-between items-start mb-3 pt-2">
              <h3
                class="font-bold text-lg text-gray-800 leading-tight handwriting z-20 relative break-words w-full pr-8"
                :class="{ 'line-through': note.is_done }"
              >
                {{ note.title }}
              </h3>

              <!-- Action Button (Delete) - Absolute Position to prevent overflow -->
              <div
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex flex-col gap-1"
              >
                <button
                  @click.stop="openModal(note)"
                  class="text-gray-600 hover:text-blue-600 bg-white/60 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-sm"
                  title="Modifier"
                >
                  <i class="fas fa-pencil-alt text-[10px]"></i>
                </button>
                <button
                  @click.stop="deleteNote(note.id)"
                  class="text-gray-600 hover:text-red-600 bg-white/60 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center transition-colors shadow-sm"
                  title="Jeter"
                >
                  <i class="fas fa-times text-[10px]"></i>
                </button>
              </div>
            </div>

            <p
              class="text-gray-700 whitespace-pre-wrap text-sm mb-4 leading-relaxed handwriting flex-1"
              :class="{ 'line-through': note.is_done }"
            >
              {{ note.content }}
            </p>

            <!-- Footer Actions -->
            <div
              class="flex justify-between items-center border-t border-black/10 pt-3 mt-auto relative z-20"
            >
              <button
                @click="toggleDone(note)"
                class="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-green-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-black/5 transaction-colors"
                title="Marquer comme fait"
              >
                <i class="fas" :class="note.is_done ? 'fa-check-square' : 'fa-square'"></i>
                {{ note.is_done ? 'Fait' : 'À faire' }}
              </button>

              <button
                @click="transformToEvent(note)"
                class="text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 flex items-center gap-1 px-2 py-1 rounded hover:bg-purple-100/50 transition-colors"
                title="Créer un événement"
              >
                <i class="fas fa-calendar-plus"></i>
                Planifier
              </button>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Empty State -->
    <div
      v-if="!noteStore.loading && noteStore.notes.length === 0"
      class="text-center py-20 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200 mx-auto max-w-lg"
    >
      <i class="fas fa-sticky-note text-4xl mb-4 text-gray-300"></i>
      <p class="font-medium">Aucune note pour le moment.</p>
      <p class="text-sm mt-1">Cliquez sur "Nouvelle Idée" pour commencer.</p>
    </div>

    <!-- Modal -->
    <BaseModal
      :show="showModal"
      :title="isEditing ? 'Modifier le Post-it' : 'Nouveau Post-it'"
      @close="showModal = false"
    >
      <div class="space-y-4">
        <div>
          <BaseInput
            v-model="formData.title"
            label="Titre (Idée, Tâche...)"
            placeholder="Ex: Flash idée loup"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
          <textarea
            v-model="formData.content"
            rows="5"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-shadow handwriting text-lg"
            placeholder="Détails..."
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
          <div class="flex gap-3">
            <button
              v-for="color in colors"
              :key="color.name"
              @click="formData.color = color.value"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
              :class="[
                color.value,
                formData.color === color.value
                  ? 'border-gray-600 scale-110 shadow-md'
                  : 'border-transparent',
              ]"
              :title="color.name"
            ></button>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          @click="showModal = false"
          class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-3"
        >
          Annuler
        </button>
        <button
          @click="saveNote"
          class="px-4 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-lg hover:bg-yellow-500 shadow-sm"
        >
          {{ isEditing ? 'Mettre à jour' : 'Coller' }}
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

<style scoped>
.whiteboard-bg {
  background-color: #f3f4f6;
  background-image:
    radial-gradient(#d1d5db 1px, transparent 1px), linear-gradient(#f3f4f6 1px, transparent 1px);
  background-size: 20px 20px;
}

.handwriting {
  font-family: 'Patrick Hand', 'Segoe UI', sans-serif;
}

.ghost-card {
  opacity: 0.5;
  transform: scale(0.95);
  box-shadow: none;
}
</style>

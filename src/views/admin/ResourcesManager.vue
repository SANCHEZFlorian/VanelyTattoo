<script setup>
import { ref } from 'vue'
import api from '@/lib/api'
import { useInfoStore } from '@/stores/info'
import { useNotificationStore } from '@/stores/notification'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const infoStore = useInfoStore()
const notificationStore = useNotificationStore()

const showConfirm = ref(false)
const resourceToDelete = ref(null)
const uploading = ref(false)

const addResource = () => {
  infoStore.resources.push({
    id: Date.now(),
    title: '',
    url: '',
    fileName: '',
  })
}

const confirmDelete = (index) => {
  resourceToDelete.value = index
  showConfirm.value = true
}

const removeResource = () => {
  if (resourceToDelete.value !== null) {
    infoStore.resources.splice(resourceToDelete.value, 1)
    notificationStore.addNotification('Supprimé', 'Document retiré de la liste.', 'info')
    showConfirm.value = false
    resourceToDelete.value = null
  }
}

const handleFileUpload = async (event, resource) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    notificationStore.addNotification('Erreur', 'Le fichier est trop volumineux (max 5Mo)', 'error')
    return
  }

  uploading.value = true
  notificationStore.addNotification('Téléchargement', 'Envoi du document en cours...', 'info')

  try {
    const uploadData = new FormData()
    uploadData.append('image', file) // Backend expects 'image' field for now, maybe we should rename it to 'file' but let's stick with 'image' as we used it before

    const { data: uploadRes } = await api.post('/upload', uploadData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    resource.fileName = file.name
    resource.url = uploadRes.url

    notificationStore.addNotification(
      'Succès',
      `Fichier "${file.name}" enregistré avec succès`,
      'success',
    )
  } catch (error) {
    console.error('Upload error:', error)
    notificationStore.addNotification('Erreur', "Échec de l'envoi du fichier", 'error')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end gap-3">
      <button
        @click="addResource"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        Nouveau document
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(resource, index) in infoStore.resources"
        :key="resource.id"
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all hover:-translate-y-1"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="bg-pink-50 p-3 rounded-xl text-pink-500">
            <i class="fas fa-file-pdf text-2xl"></i>
          </div>
          <div class="flex gap-2">
            <a
              v-if="resource.url"
              :href="resource.url"
              target="_blank"
              class="w-8 h-8 flex items-center justify-center rounded-full text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              title="Télécharger / Voir"
            >
              <i class="fas fa-download"></i>
            </a>
            <button
              @click="confirmDelete(index)"
              class="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1"
              >Titre du document</label
            >
            <input
              v-model="resource.title"
              type="text"
              placeholder="Ex: Soins après séance"
              class="w-full px-4 py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1"
              >Document (PDF ou Image)</label
            >
            <div class="space-y-3">
              <!-- File Upload (For Contract & Aftercare) -->
              <div class="relative group/upload">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  @change="handleFileUpload($event, resource)"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  :class="
                    resource.fileName
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-100 group-hover/upload:border-purple-200 group-hover/upload:bg-purple-50'
                  "
                  class="border-2 border-dashed rounded-xl p-4 text-center transition-colors"
                >
                  <p v-if="resource.fileName" class="text-xs text-green-700 font-medium">
                    <i class="fas fa-check-circle mr-1"></i>
                    Fichier chargé : {{ resource.fileName }}
                  </p>
                  <p v-else class="text-xs text-gray-400 group-hover/upload:text-purple-500">
                    <i class="fas fa-cloud-upload-alt mr-1"></i>
                    Uploader un fichier (.pdf, .jpg, .png)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
          <span v-if="resource.fileName" class="text-green-600 font-bold flex items-center gap-1">
            <i class="fas fa-check-circle"></i> Prêt
          </span>
          <span v-else class="text-gray-400 italic">En attente de fichier...</span>
          <span class="text-gray-300 font-mono">ID: {{ resource.id.toString().slice(-4) }}</span>
        </div>
      </div>

      <div
        v-if="infoStore.resources.length === 0"
        class="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400"
      >
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <i class="fas fa-cloud-upload-alt text-2xl text-gray-300"></i>
        </div>
        <p class="font-medium text-gray-600">Aucun document pour le moment</p>
        <button
          @click="addResource"
          class="mt-2 text-purple-600 hover:text-purple-700 font-medium hover:underline"
        >
          Ajouter votre premier PDF
        </button>
      </div>
    </div>

    <ConfirmModal
      :is-open="showConfirm"
      title="Supprimer la ressource"
      message="Êtes-vous sûr de vouloir supprimer ce document ? Cette action est irréversible."
      confirm-label="Supprimer"
      @confirm="removeResource"
      @cancel="showConfirm = false"
    />
  </div>
</template>

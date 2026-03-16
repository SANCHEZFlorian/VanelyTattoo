<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/lib/api'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'
import BaseFileUpload from '../../components/ui/BaseFileUpload.vue'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const loading = ref(false)
const user = ref({
  email: '',
  avatar_url: '',
  full_name: '',
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

const avatarPreview = computed(() => {
  if (!user.value.avatar_url)
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTMem0wIDE0LjJjLTIuNSAwLTQuNzEtMS4yOC02LTMuMjIuMDMtMS45OSA0LTMuMDggNi0zLjA4IDEuOTkgMCA1Ljk3IDEuMDkgNiAzLjA4LTEuMjktMS45NC0zLjUgMy4yMi02IDMuMjJ6Ii8+PC9zdmc+'
  if (typeof user.value.avatar_url === 'string') return user.value.avatar_url
  return user.value.avatar_url.url
})

onMounted(async () => {
  try {
    const data = await authStore.fetchProfile()
    console.log('Fetched profile data:', data)
    if (data) {
      user.value = {
        email: data.email,
        avatar_url: data.avatar_url || '',
        full_name: data.full_name || '',
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
})

const updateProfile = async () => {
  loading.value = true
  try {
    let finalAvatarUrl = user.value.avatar_url

    // 1. Upload new image if it's an object from BaseFileUpload
    if (
      user.value.avatar_url &&
      typeof user.value.avatar_url === 'object' &&
      user.value.avatar_url.file
    ) {
      const uploadData = new FormData()
      uploadData.append('image', user.value.avatar_url.file)

      const { data: uploadRes } = await api.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      finalAvatarUrl = uploadRes.url
    } else if (user.value.avatar_url && typeof user.value.avatar_url === 'object') {
      // Fallback for object without file (just url)
      finalAvatarUrl = user.value.avatar_url.url
    }

    const updates = {
      full_name: user.value.full_name,
      avatar_url: finalAvatarUrl,
    }

    await api.put('/auth/me', updates)

    // Update local state to the new string URL
    user.value.avatar_url = finalAvatarUrl

    // Update store
    if (authStore.profile) {
      authStore.profile.avatar_url = finalAvatarUrl
      authStore.profile.full_name = user.value.full_name
    }
    if (authStore.user) {
      authStore.user.avatar_url = finalAvatarUrl
      authStore.user.full_name = user.value.full_name
    }

    notificationStore.addNotification('Succès', 'Profil mis à jour avec succès.', 'success')
  } catch (error) {
    console.error('Error updating profile:', error)
    notificationStore.addNotification(
      'Erreur',
      error.response?.data?.message || error.message,
      'error',
    )
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    notificationStore.addNotification(
      'Erreur',
      'Les mots de passe ne correspondent pas.',
      'warning',
    )
    return
  }

  loading.value = true
  try {
    await api.put('/auth/password', { password: passwordForm.value.new })
    notificationStore.addNotification('Succès', 'Mot de passe mis à jour.', 'success')
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (error) {
    notificationStore.addNotification(
      'Erreur',
      error.response?.data?.message || error.message,
      'error',
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <!-- Header Card (To be removed later if we move to global header, but keeping for standalone for now) -->
    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Mon Profil</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Profile Info -->
        <div class="space-y-6">
          <h3 class="text-lg font-bold text-gray-700 border-b border-gray-100 pb-2">
            Informations
          </h3>

          <div class="flex justify-center mb-6">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-50 shadow-md">
              <img :src="avatarPreview" class="w-full h-full object-cover" />
            </div>
          </div>

          <BaseFileUpload
            v-model="user.avatar_url"
            label="Photo de profil"
            :multiple="false"
            :show-preview="false"
          />

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
            <input
              v-model="user.full_name"
              type="text"
              placeholder="Ex: Ridley Scott"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              v-model="user.email"
              type="email"
              disabled
              class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p class="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
          </div>

          <button
            @click="updateProfile"
            :disabled="loading"
            class="w-full bg-purple-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>

        <!-- Security -->
        <div class="space-y-6">
          <h3 class="text-lg font-bold text-gray-700 border-b border-gray-100 pb-2">Sécurité</h3>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
            <input
              v-model="passwordForm.new"
              type="password"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2"
              >Confirmer le mot de passe</label
            >
            <input
              v-model="passwordForm.confirm"
              type="password"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            />
          </div>

          <button
            @click="updatePassword"
            :disabled="loading || !passwordForm.new"
            class="w-full bg-gray-800 text-white py-3 rounded-xl font-bold shadow-md hover:bg-gray-900 transition-all disabled:opacity-50"
          >
            Mettre à jour le mot de passe
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

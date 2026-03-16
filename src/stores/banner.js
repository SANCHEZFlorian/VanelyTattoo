import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'

export const useBannerStore = defineStore('banner', () => {
  const banners = ref([])
  const loading = ref(false)
  const error = ref(null)
  const notificationStore = useNotificationStore()

  const fetchBanners = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/banners')
      banners.value = data || []
    } catch (err) {
      console.error('Error fetching banners:', err)
      error.value = err.message
      notificationStore.addNotification("Erreur", "Impossible de charger les bannières", 'error')
    } finally {
      loading.value = false
    }
  }

  const addBanner = async (bannerData) => {
    try {
      const { data } = await api.post('/banners', bannerData)
      banners.value.push(data)
      notificationStore.addNotification("Succès", "Bannière ajoutée", 'success')
      return { success: true }
    } catch (err) {
      console.error('Error adding banner:', err)
      notificationStore.addNotification("Erreur", err.response?.data?.message || err.message, 'error')
      return { success: false, message: err.message }
    }
  }

  const updateBanner = async (id, bannerData) => {
    try {
      const { data } = await api.put(`/banners/${id}`, bannerData)
      const index = banners.value.findIndex(b => b.id === id)
      if (index !== -1) {
        banners.value[index] = data
      }
      notificationStore.addNotification("Succès", "Bannière mise à jour", 'success')
      return { success: true }
    } catch (err) {
      console.error('Error updating banner:', err)
      notificationStore.addNotification("Erreur", err.response?.data?.message || err.message, 'error')
      return { success: false, message: err.message }
    }
  }

  const deleteBanner = async (id) => {
    try {
      await api.delete(`/banners/${id}`)
      banners.value = banners.value.filter(b => b.id !== id)
      notificationStore.addNotification("Succès", "Bannière supprimée", 'success')
      return { success: true }
    } catch (err) {
      console.error('Error deleting banner:', err)
      notificationStore.addNotification("Erreur", err.response?.data?.message || err.message, 'error')
      return { success: false, message: err.message }
    }
  }

  const activeBanners = computed(() => {
    return banners.value.filter(b => b.active === true || b.active === 1)
  })

  return {
    banners,
    loading,
    error,
    fetchBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    activeBanners
  }
})

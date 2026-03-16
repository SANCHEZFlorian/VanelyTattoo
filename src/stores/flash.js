import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'
import { logger } from '@/services/LoggerService'

export const useFlashStore = defineStore('flash', () => {
  const flashTattoos = ref([])
  const loading = ref(false)
  const notificationStore = useNotificationStore()



  const fetchFlashTattoos = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/flash')
      flashTattoos.value = data
    } catch (error) {
      console.error('Error fetching flash tattoos:', error)
    } finally {
      loading.value = false
    }
  }

  // Initial fetch
  fetchFlashTattoos()

  const incrementView = async (id) => {
    // Optimistic update
    const flash = flashTattoos.value.find(f => f.id === id)
    if (flash) flash.views++

    try {
      await api.post(`/flash/${id}/increment-view`)
    } catch (error) {
      console.error('Error incrementing view:', error)
    }
  }

  const addFlash = async (flashData) => {
    try {
      const { data } = await api.post('/flash', flashData)
      flashTattoos.value.unshift(data)
      await logger.log('create', 'flash_tattoos', data.id, { title: flashData.title })
      return data
    } catch (error) {
      console.error('Error adding flash:', error)
      notificationStore.addNotification("Erreur d'ajout", error.response?.data?.message || error.message, 'error')
      await logger.logError('create', 'flash_tattoos', error)
      return null
    }
  }

  const updateFlash = async (id, updates) => {
    try {
      const { data } = await api.put(`/flash/${id}`, updates)

      const index = flashTattoos.value.findIndex(f => f.id === id)
      let changes = {}

      if (index !== -1) {
        const oldItem = flashTattoos.value[index]
        Object.keys(updates).forEach(key => {
          const isArray = Array.isArray(updates[key])
          const valA = isArray ? JSON.stringify(updates[key]) : updates[key]
          const valB = isArray ? JSON.stringify(oldItem[key]) : oldItem[key]

          if (valA !== valB) {
            changes[key] = updates[key]
          }
        })

        if (Object.keys(changes).length === 0) changes = { note: 'No content changes detected' }
        flashTattoos.value[index] = data
      }

      await logger.log('update', 'flash_tattoos', id, { updates: changes, title: data.title })
      return true
    } catch (error) {
      console.error('Error updating flash:', error)
      notificationStore.addNotification("Erreur de mise à jour", error.response?.data?.message || error.message, 'error')
      await logger.logError('update', 'flash_tattoos', error, { id })
      return false
    }
  }

  const deleteFlash = async (id) => {
    try {
      await api.delete(`/flash/${id}`)
      flashTattoos.value = flashTattoos.value.filter(f => f.id !== id)
      await logger.log('delete', 'flash_tattoos', id)
      return true
    } catch (error) {
      console.error('Error deleting flash:', error)
      notificationStore.addNotification("Erreur de suppression", error.response?.data?.message || error.message, 'error')
      await logger.logError('delete', 'flash_tattoos', error, { id })
      return false
    }
  }



  return {
    flashTattoos,
    loading,
    fetchFlashTattoos,
    incrementView,
    addFlash,
    updateFlash,
    deleteFlash
  }
})

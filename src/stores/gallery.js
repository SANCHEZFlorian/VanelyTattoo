import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'
import { logger } from '@/services/LoggerService'

export const useGalleryStore = defineStore('gallery', () => {
  const galleryItems = ref([])
  const notificationStore = useNotificationStore()
  const loading = ref(false)



  const fetchGalleryItems = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/gallery')
      galleryItems.value = data
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    } finally {
      loading.value = false
    }
  }

  // Initial fetch
  fetchGalleryItems()

  const incrementView = async (id) => {
    // Optimistic update
    const item = galleryItems.value.find(i => i.id === id)
    if (item) item.views = (item.views || 0) + 1

    try {
      await api.post(`/gallery/${id}/increment-view`)
    } catch (error) {
      console.error('Error incrementing view:', error)
    }
  }

  const addGalleryItem = async (item) => {
    try {
      const { data } = await api.post('/gallery', item)
      galleryItems.value.unshift(data)
      notificationStore.addNotification("Succès", "Élément ajouté à la galerie", 'success')
      await logger.log('create', 'gallery_items', data.id, { title: item.title })
      return true
    } catch (error) {
      console.error('Error adding gallery item:', error)
      notificationStore.addNotification("Erreur", "Impossible d'ajouter l'élément", 'error')
      await logger.logError('create', 'gallery_items', error)
      return false
    }
  }

  const updateGalleryItem = async (id, updates) => {
    try {
      const { data } = await api.put(`/gallery/${id}`, updates)

      // Calculate diffs for logger
      const index = galleryItems.value.findIndex(i => i.id === id)
      let changes = {}

      if (index !== -1) {
        const oldItem = galleryItems.value[index]
        Object.keys(updates).forEach(key => {
          const isArray = Array.isArray(updates[key])
          const valA = isArray ? JSON.stringify(updates[key]) : updates[key]
          const valB = isArray ? JSON.stringify(oldItem[key]) : oldItem[key]

          if (valA !== valB) {
            changes[key] = updates[key]
          }
        })
        if (Object.keys(changes).length === 0) changes = { note: 'No changes detected' }
        galleryItems.value[index] = data
      }

      notificationStore.addNotification("Succès", "Élément mis à jour", 'success')
      await logger.log('update', 'gallery_items', id, { updates: changes, title: data.title })
      return true
    } catch (error) {
      console.error('Error updating gallery item:', error)
      notificationStore.addNotification("Erreur", "Impossible de mettre à jour", 'error')
      await logger.logError('update', 'gallery_items', error, { id })
      return false
    }
  }

  const deleteGalleryItem = async (id) => {
    try {
      await api.delete(`/gallery/${id}`)
      galleryItems.value = galleryItems.value.filter(i => i.id !== id)
      notificationStore.addNotification("Succès", "Élément supprimé", 'success')
      await logger.log('delete', 'gallery_items', id)
      return true
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      notificationStore.addNotification("Erreur", "Impossible de supprimer", 'error')
      await logger.logError('delete', 'gallery_items', error, { id })
      return false
    }
  }



  return {
    galleryItems,
    loading,
    fetchGalleryItems,
    incrementView,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem
  }
})

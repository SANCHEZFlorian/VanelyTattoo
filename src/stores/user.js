import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const notificationStore = useNotificationStore()

  const fetchUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/users')
      users.value = data
    } catch (err) {
      console.error('Error fetching users:', err)
      error.value = err.response?.data?.message || err.message
    } finally {
      loading.value = false
    }
  }

  const createUser = async (email, password, role = 'admin', full_name = '') => {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/users', { email, password, role, full_name })

      users.value.unshift(data)
      notificationStore.addNotification("Succès", "Utilisateur créé", 'success')
      return { success: true }
    } catch (err) {
      console.error('Error creating user:', err)
      error.value = err.response?.data?.message || err.message
      notificationStore.addNotification("Erreur", error.value, 'error')
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateUserRole = async (id, role) => {
    loading.value = true
    try {
      await api.put(`/users/${id}/role`, { role })

      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index].role = role
      }
      notificationStore.addNotification("Succès", "Rôle mis à jour", 'success')
      return { success: true }
    } catch (err) {
      console.error('Error updating role:', err)
      notificationStore.addNotification("Erreur", err.response?.data?.message || err.message, 'error')
      return { success: false, message: err.response?.data?.message || err.message }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    loading.value = true
    try {
      await api.delete(`/users/${id}`)

      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) users.value.splice(index, 1)
      notificationStore.addNotification("Succès", "Utilisateur supprimé", 'success')
      return { success: true }
    } catch (err) {
      console.error('Error deleting user:', err)
      notificationStore.addNotification("Erreur", err.response?.data?.message || err.message, 'error')
      return { success: false, message: err.response?.data?.message || err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUserRole,
    deleteUser
  }
})

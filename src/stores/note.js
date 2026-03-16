import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'

export const useNoteStore = defineStore('note', () => {
    const notes = ref([])
    const loading = ref(false)
    const error = ref(null)
    const notificationStore = useNotificationStore()

    const fetchNotes = async () => {
        loading.value = true
        error.value = null
        try {
            const { data } = await api.get('/notes')
            notes.value = data
        } catch (err) {
            console.error('Error fetching notes:', err)
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const addNote = async (note) => {
        loading.value = true
        try {
            const { data } = await api.post('/notes', note)
            notes.value.unshift(data)
            notificationStore.addNotification('Note ajoutée', 'Note créée avec succès', 'success')
            return true
        } catch (err) {
            console.error('Error adding note:', err)
            notificationStore.addNotification('Erreur', 'Impossible de créer la note', 'error')
            return false
        } finally {
            loading.value = false
        }
    }

    const updateNote = async (id, updates) => {
        try {
            const { data } = await api.put(`/notes/${id}`, updates)
            const index = notes.value.findIndex((n) => n.id === id)
            if (index !== -1) {
                notes.value[index] = data
            }
            return true
        } catch (err) {
            console.error('Error updating note:', err)
            notificationStore.addNotification('Erreur', 'Mise à jour échouée', 'error')
            return false
        }
    }

    const deleteNote = async (id) => {
        try {
            await api.delete(`/notes/${id}`)
            notes.value = notes.value.filter((n) => n.id !== id)
            notificationStore.addNotification('Suppression', 'Note supprimée', 'info')
            return true
        } catch (err) {
            console.error('Error deleting note:', err)
            notificationStore.addNotification('Erreur', 'Suppression échouée', 'error')
            return false
        }
    }

    const updateNotesOrder = async (newNotes) => {
        notes.value = newNotes
        try {
            // Note: Our generic CRUD doesn't support bulk upsert easily,
            // but we can update individually or just update the local state for now.
            // For a better implementation, we'd need a specific route in the backend.
            for (let i = 0; i < newNotes.length; i++) {
                await api.put(`/notes/${newNotes[i].id}`, { display_order: i })
            }
        } catch (err) {
            console.error('Error updating order:', err)
            notificationStore.addNotification('Erreur', 'Impossible de sauvegarder l\'ordre', 'error')
        }
    }

    return {
        notes,
        loading,
        error,
        fetchNotes,
        addNote,
        updateNote,
        deleteNote,
        updateNotesOrder,
    }
})

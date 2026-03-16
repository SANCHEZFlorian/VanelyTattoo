import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'

export const useClientStore = defineStore('client', () => {
    const wishlist = ref([]) // Array of flash IDs or objects
    const clientProfile = ref(null)

    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()

    const fetchClientProfile = async () => {
        if (!authStore.user) return
        try {
            const data = await authStore.fetchProfile()
            clientProfile.value = data
            if (data) {
                await fetchWishlist()
            }
        } catch (error) {
            console.error('Error fetching client profile:', error)
        }
    }

    const fetchWishlist = async () => {
        if (!authStore.user) return
        try {
            const { data } = await api.get('/wishlist')
            wishlist.value = data
        } catch (error) {
            console.error('Error fetching wishlist:', error)
        }
    }

    const addToWishlist = async (flashId) => {
        if (!authStore.user) {
            notificationStore.addNotification("Connexion requise", "Veuillez vous connecter pour ajouter aux favoris.", 'warning')
            return false
        }

        try {
            await api.post('/wishlist', { flash_id: flashId })
            notificationStore.addNotification("Favori ajouté", "Flash ajouté à votre liste de souhaits.", 'success')
            await fetchWishlist()
            return true
        } catch (error) {
            if (error.response?.status === 400) {
                notificationStore.addNotification("Déjà favori", "Ce flash est déjà dans votre liste.", 'info')
            } else {
                console.error('Error adding to wishlist:', error)
                notificationStore.addNotification("Erreur", "Impossible d'ajouter aux favoris.", 'error')
            }
            return false
        }
    }

    const removeFromWishlist = async (flashId) => {
        if (!authStore.user) return
        try {
            await api.delete(`/wishlist/${flashId}`)
            wishlist.value = wishlist.value.filter(f => (f.id !== flashId && f.flash_id !== flashId))
            notificationStore.addNotification("Retiré", "Flash retiré de votre liste.", 'info')
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            notificationStore.addNotification("Erreur", "Impossible de retirer des favoris.", 'error')
        }
    }

    const isInWishlist = (flashId) => {
        return wishlist.value.some(f => (f.id === flashId || f.flash_id === flashId))
    }

    const registerClient = async (email, password, fullName, phone) => {
        // Registration not yet implemented in backend, would be POST /api/auth/register
        notificationStore.addNotification("Info", "L'inscription n'est pas encore disponible sur cette version.", 'info')
        return false
    }

    return {
        clientProfile,
        wishlist,
        fetchClientProfile,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        registerClient
    }
})

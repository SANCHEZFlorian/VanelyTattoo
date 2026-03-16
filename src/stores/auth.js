import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/api'
import { useNotificationStore } from './notification'
import { logger } from '@/services/LoggerService'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const profile = ref(null)
    const isInitialized = ref(false)
    const router = useRouter()
    const notificationStore = useNotificationStore()

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/me')
            profile.value = data
            user.value = { ...data } // Ensure all fields like full_name are available
            return data
        } catch (error) {
            console.error('Error fetching profile:', error)
            return null
        }
    }

    // Initialize session from token
    const initPromise = (async () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            const data = await fetchProfile()
            if (!data) {
                localStorage.removeItem('auth_token')
                user.value = null
                profile.value = null
            }
        }
        isInitialized.value = true
    })()

    const waitInit = () => initPromise

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password })

            localStorage.setItem('auth_token', data.token)
            user.value = data.user
            profile.value = data.user

            notificationStore.addNotification("Bienvenue !", "Connexion réussie", 'success')
            await logger.log('auth', 'login', data.user.id, { email })
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || "Erreur de connexion"
            console.error('Login error:', error)
            notificationStore.addNotification("Erreur de connexion", message, 'error')
            await logger.logError('auth', 'login', error)
            return { success: false, message }
        }
    }

    const logout = async () => {
        if (user.value) {
            await logger.log('auth', 'logout', user.value.id)
        }
        localStorage.removeItem('auth_token')
        user.value = null
        profile.value = null
        notificationStore.addNotification("Déconnexion", "À bientôt !", 'info')
        router.push('/admin/login')
    }

    const isAuthenticated = () => !!user.value || !!localStorage.getItem('auth_token')

    // Helper to check roles/permissions
    const hasRole = (role) => {
        return profile.value && profile.value.role === role
    }

    const hasPermission = (permission) => {
        if (!profile.value) return false
        if (profile.value.role === 'admin') return true // Admin has all permissions
        return profile.value.permissions && profile.value.permissions[permission]
    }

    return { user, profile, isInitialized, waitInit, fetchProfile, login, logout, isAuthenticated, hasRole, hasPermission }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
    const toasts = ref([])
    const history = ref([])

    const addNotification = (title, message = '', type = 'info') => {
        const id = Date.now()
        const notification = {
            id,
            title,
            message,
            type,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        }

        // Add to active toasts
        toasts.value.push(notification)

        // Add to history (limit to last 50 items)
        history.value.unshift(notification)
        if (history.value.length > 50) {
            history.value.pop()
        }

        // Persist history to localStorage
        localStorage.setItem('vt_notification_history', JSON.stringify(history.value))

        return id
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    const clearHistory = () => {
        history.value = []
        localStorage.setItem('vt_notification_history', JSON.stringify([]))
    }

    // Load history from localStorage
    const savedHistory = localStorage.getItem('vt_notification_history')
    if (savedHistory) {
        history.value = JSON.parse(savedHistory)
    }

    return {
        toasts,
        history,
        addNotification,
        removeToast,
        clearHistory
    }
})

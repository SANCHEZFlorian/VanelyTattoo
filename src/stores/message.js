import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'

export const useMessageStore = defineStore('message', () => {
    const messages = ref([])
    const loading = ref(false)
    const notificationStore = useNotificationStore()

    const fetchMessages = async () => {
        loading.value = true
        try {
            const { data } = await api.get('/messages')
            messages.value = data.map(m => ({
                id: m.id,
                from: m.from_name,
                email: m.email,
                subject: m.subject,
                message: m.message_body,
                date: m.created_at,
                read: m.is_read,
                phone: m.phone
            }))
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            loading.value = false
        }
    }

    // Initial fetch
    fetchMessages()

    const markAsRead = async (id) => {
        try {
            await api.put(`/messages/${id}`, { is_read: true })
            const msg = messages.value.find(m => m.id === id)
            if (msg) msg.read = true
            notificationStore.addNotification("Message lu", "Le message a été marqué comme lu", 'info')
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const deleteMessage = async (id) => {
        try {
            await api.delete(`/messages/${id}`)
            const index = messages.value.findIndex(m => m.id === id)
            if (index !== -1) messages.value.splice(index, 1)
            notificationStore.addNotification("Succès", "Message supprimé", 'success')
        } catch (error) {
            console.error('Error deleting message:', error)
        }
    }

    const sendMessage = async (messageData) => {
        try {
            await api.post('/messages', {
                from_name: messageData.name,
                email: messageData.email,
                subject: messageData.subject,
                message_body: messageData.message,
                phone: messageData.phone,
            })
            notificationStore.addNotification("Succès", "Message envoyé avec succès", 'success')
            return true
        } catch (error) {
            console.error('Error sending message:', error)
            notificationStore.addNotification("Erreur", "Impossible d'envoyer le message", 'error')
            return false
        }
    }

    return { messages, loading, fetchMessages, markAsRead, deleteMessage, sendMessage }
})

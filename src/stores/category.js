import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'

export const useCategoryStore = defineStore('category', () => {
    const categories = ref([])
    const loading = ref(false)
    const notificationStore = useNotificationStore()

    const fetchCategories = async () => {
        loading.value = true
        try {
            const { data } = await api.get('/categories')
            categories.value = data.map(c => c.name).sort((a, b) => a.localeCompare(b))
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            loading.value = false
        }
    }

    const addCategory = async (name) => {
        try {
            const { data } = await api.post('/categories', { name })
            if (!categories.value.includes(data.name)) {
                categories.value.push(data.name)
                categories.value.sort((a, b) => a.localeCompare(b))
            }
            notificationStore.addNotification("Succès", `Catégorie "${data.name}" ajoutée`, 'success')
            return true
        } catch (error) {
            console.error('Error adding category:', error)
            notificationStore.addNotification("Erreur", "Impossible d'ajouter la catégorie", 'error')
            return false
        }
    }

    const deleteCategory = async (name, isUsedCallback) => {
        if (isUsedCallback && isUsedCallback(name)) {
            notificationStore.addNotification("Attention", `Catégorie utilisée. Impossible de supprimer "${name}".`, 'error')
            return false
        }

        try {
            const { data: allCats } = await api.get('/categories')
            const cat = allCats.find(c => c.name === name)
            if (cat) {
                await api.delete(`/categories/${cat.id}`)
                categories.value = categories.value.filter(c => c !== name)
                notificationStore.addNotification("Succès", `Catégorie "${name}" supprimée`, 'success')
                return true
            }
        } catch (error) {
            console.error('Error deleting category:', error)
            notificationStore.addNotification("Erreur", "Impossible de supprimer la catégorie", 'error')
            return false
        }
        return false
    }

    const renameCategory = async (oldName, newName) => {
        try {
            await api.post('/categories/rename', { oldName, newName })
            categories.value = categories.value.map(c => c === oldName ? newName : c)
            notificationStore.addNotification("Succès", `Catégorie renommée en "${newName}"`, 'success')
            return true
        } catch (error) {
            console.error('Error renaming category:', error)
            notificationStore.addNotification("Erreur", "Impossible de renommer la catégorie", 'error')
            return false
        }
    }

    return {
        categories,
        loading,
        fetchCategories,
        addCategory,
        deleteCategory,
        renameCategory
    }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'

export const usePromoStore = defineStore('promo', () => {
  const promotions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const notificationStore = useNotificationStore()

  const fetchPromotions = async () => {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/promos')
      promotions.value = data || []
    } catch (err) {
      console.error('Error fetching promotions:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const savePromo = async (promoData) => {
    loading.value = true
    try {
      let result
      if (promoData.id) {
        const { data } = await api.put(`/promos/${promoData.id}`, promoData)
        result = data

        const index = promotions.value.findIndex(p => p.id === promoData.id)
        if (index !== -1) {
          promotions.value[index] = result
        }
        notificationStore.addNotification("Succès", "Promotion enregistrée", 'success')
      } else {
        const { data } = await api.post('/promos', promoData)
        result = data
        promotions.value.unshift(result)
        notificationStore.addNotification("Succès", "Nouvelle promotion créée", 'success')
      }
      return { success: true }
    } catch (err) {
      console.error('Error saving promo:', err)
      notificationStore.addNotification("Erreur", err.response?.data?.message || err.message, 'error')
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const deletePromo = async (id) => {
    loading.value = true
    try {
      await api.delete(`/promos/${id}`)
      promotions.value = promotions.value.filter(p => p.id !== id)
      notificationStore.addNotification("Succès", "Promotion supprimée", 'success')
      return { success: true }
    } catch (err) {
      console.error('Error deleting promo:', err)
      notificationStore.addNotification("Erreur", err.message, 'error')
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  const getDiscountedPrice = (currentPrice, flashId, itemDiscount = 0, originalPrice = null) => {
    if (!currentPrice) return currentPrice

    const now = new Date().toISOString().split('T')[0]
    const basePrice = originalPrice || currentPrice

    const activePromos = promotions.value.filter(p =>
      p.active &&
      (!p.start_date || p.start_date <= now) &&
      (!p.end_date || p.end_date >= now)
    )

    const applicablePromos = activePromos.filter(p => {
      if (p.is_global) return true
      if (p.target_flashes && Array.isArray(p.target_flashes)) {
        return p.target_flashes.includes(flashId)
      }
      return false
    })

    let maxPromoPercent = 0
    if (applicablePromos.length > 0) {
      maxPromoPercent = Math.max(...applicablePromos.map(p => p.discount_percent))
    }

    const maxPercent = Math.max(maxPromoPercent, itemDiscount || 0)

    if (maxPercent === 0) return currentPrice
    const calculatedPromoPrice = Math.floor(basePrice * (1 - maxPercent / 100))
    return Math.min(currentPrice, calculatedPromoPrice)
  }

  const activePromo = ref(null)

  const fetchActiveGlobalPromo = async () => {
    loading.value = true
    try {
      const now = new Date().toISOString().split('T')[0]
      // Use the generic /promos and filter
      const { data } = await api.get('/promos')

      if (data && data.length > 0) {
        const currentPromos = data.filter(p => {
          const started = !p.start_date || p.start_date <= now
          const notEnded = !p.end_date || p.end_date >= now
          return p.active && p.is_global && started && notEnded
        })
        activePromo.value = currentPromos.length > 0 ? currentPromos[0] : null
      } else {
        activePromo.value = null
      }
    } catch (err) {
      console.error('Error fetching active global promo:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    promotions,
    activePromo,
    loading,
    error,
    fetchPromotions,
    fetchActiveGlobalPromo,
    savePromo,
    deletePromo,
    getDiscountedPrice
  }
})

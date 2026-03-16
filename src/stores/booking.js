import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/lib/api'
import { useNotificationStore } from './notification'
import { logger } from '@/services/LoggerService'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref([])
  const slotExceptions = ref([])
  const loading = ref(false)
  const notificationStore = useNotificationStore()

  const fetchBookings = async () => {
    loading.value = true
    try {
      const { data } = await api.get('/bookings')
      // Map DB fields to store fields
      bookings.value = data.map(b => ({
        id: b.id,
        client: b.client_name,
        email: b.email,
        date: b.booking_date,
        time: b.booking_time?.slice(0, 5),
        project: b.project_type,
        tattoo: b.project_type,
        description: b.description,
        status: b.status,
        notes: b.notes,
        image: b.reference_image,
        endTime: b.booking_end_time?.slice(0, 5),
        size: b.size,
        placement: b.placement,
        budget: b.budget,
        price: b.price,
        processed: b.processed_for_gallery,
        phone: b.phone
      }))
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchExceptions = async () => {
    try {
      const { data } = await api.get('/bookings/exceptions') // Note: We need a backend route for this or use a generic one
      slotExceptions.value = data.map(e => ({
        id: e.id,
        date: e.exception_date,
        time: e.exception_time?.slice(0, 5),
        status: e.status,
        title: e.title,
        description: e.description
      }))
    } catch (error) {
      // If /bookings/exceptions doesn't exist yet, we might need to implement it in the generic crud
      console.error('Error fetching exceptions:', error)
    }
  }

  // Initial fetch
  fetchBookings()
  // fetchExceptions() // We'll need to make sure the endpoint exists

  const submitBooking = async (bookingData) => {
    const dbPayload = {
      client_name: bookingData.name,
      email: bookingData.email || `client-${Date.now()}@vanely-local.com`,
      booking_date: bookingData.date,
      booking_time: bookingData.time.includes(':') && bookingData.time.split(':').length === 2 ? `${bookingData.time}:00` : bookingData.time,
      project_type: bookingData.description ? bookingData.description.slice(0, 50) : "Projet Tatouage",
      description: bookingData.description,
      status: "pending",
      notes: "",
      booking_end_time: bookingData.endTime ? (bookingData.endTime.includes(':') && bookingData.endTime.split(':').length === 2 ? `${bookingData.endTime}:00` : bookingData.endTime) : null,
      size: bookingData.size,
      placement: bookingData.placement,
      budget: bookingData.budget,
      processed_for_gallery: false,
      phone: bookingData.phone
    }

    try {
      const { data } = await api.post('/bookings', dbPayload)
      bookings.value.push({
        id: data.id,
        client: data.client_name,
        email: data.email,
        date: data.booking_date,
        time: data.booking_time?.slice(0, 5),
        project: data.project_type,
        tattoo: data.project_type,
        description: data.description,
        status: data.status,
        notes: data.notes,
        image: data.reference_image,
        endTime: data.booking_end_time?.slice(0, 5),
        size: data.size,
        placement: data.placement,
        budget: data.budget,
        processed: data.processed_for_gallery,
        phone: data.phone
      })
      notificationStore.addNotification("Réservation ajoutée", `Rendez-vous créé pour ${data.client_name}`, 'success')
      await logger.log('create', 'bookings', data.id, { client: data.client_name })
      return true
    } catch (error) {
      console.error('Error submitting booking:', error)
      notificationStore.addNotification("Erreur de réservation", error.response?.data?.message || error.message, 'error')
      await logger.logError('create', 'bookings', error)
      return false
    }
  }

  const checkAvailability = (date, time) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (new Date(date) < now) return false;

    const exception = slotExceptions.value.find(s => s.date === date && s.time === time);
    if (exception) {
      if (exception.status === 'blocked') return false;
    }

    const requestedTimeVal = parseInt(time.replace(':', ''))

    if (bookings.value.some(b => {
      if (b.date !== date || b.status === 'cancelled') return false

      const startTimeVal = parseInt(b.time.replace(':', ''))
      const endTimeVal = b.endTime ? parseInt(b.endTime.replace(':', '')) : startTimeVal + 60

      return requestedTimeVal >= startTimeVal && requestedTimeVal < endTimeVal
    })) {
      return false;
    }

    return true;
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/bookings/${id}`, { status: newStatus })
      const booking = bookings.value.find(b => b.id === id)
      if (booking) {
        booking.status = newStatus
        notificationStore.addNotification("Statut mis à jour", `Réservation #${id} est maintenant ${newStatus}`, 'success')
        await logger.log('update', 'bookings', id, { status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      notificationStore.addNotification("Erreur", error.response?.data?.message || error.message, 'error')
      await logger.logError('update', 'bookings', error, { id })
    }
  }

  const markAsProcessed = async (id) => {
    try {
      await api.put(`/bookings/${id}`, { processed_for_gallery: true })
      const booking = bookings.value.find(b => b.id === id)
      if (booking) {
        booking.processed = true
      }
      await logger.log('update', 'bookings', id, { processed: true })
      return true
    } catch (error) {
      console.error('Error marking as processed:', error)
      notificationStore.addNotification("Erreur", "Impossible de marquer comme traité", 'error')
      await logger.logError('update', 'bookings', error, { id })
      return false
    }
  }

  const updateBookingDate = async (id, newDate, newTime, newEndTime) => {
    try {
      await api.put(`/bookings/${id}`, {
        booking_date: newDate,
        booking_time: newTime,
        booking_end_time: newEndTime || null
      })
      const booking = bookings.value.find(b => b.id === id)
      if (booking) {
        booking.date = newDate
        booking.time = newTime
        booking.endTime = newEndTime
        notificationStore.addNotification("Rendez-vous déplacé", `Nouveau créneau: ${newDate} à ${newTime}`, 'success')
      }
    } catch (error) {
      console.error('Error updating booking date:', error)
      notificationStore.addNotification("Erreur de mise à jour", error.response?.data?.message || error.message, 'error')
    }
  }

  // Placeholder for missing exceptions route
  // toggleSlotAvailability, addEvent, deleteException, etc.
  // will need backend adjustments if we use booking_exceptions table separately.

  const timeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

  // Returns the exception-based status for a given slot, or null if no exception
  const getSlotExceptionStatus = (date, time) => {
    const exception = slotExceptions.value.find(s => s.date === date && s.time === time)
    if (!exception) return null
    return exception.status // e.g. 'blocked' | 'available'
  }

  return {
    bookings,
    slotExceptions,
    loading,
    fetchBookings,
    fetchExceptions,
    submitBooking,
    checkAvailability,
    getSlotExceptionStatus,
    updateStatus,
    updateBookingDate,
    markAsProcessed
  }
})

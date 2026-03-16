<script setup>
import { ref, computed } from 'vue'
const loading = ref(false)
import { useBookingStore } from '../../stores/booking'
import { useInfoStore } from '../../stores/info'
import { useFlashStore } from '../../stores/flash'
import { useNotificationStore } from '../../stores/notification'
import { useRoute } from 'vue-router'

const notificationStore = useNotificationStore()
const bookingStore = useBookingStore()
const infoStore = useInfoStore()
const flashStore = useFlashStore()
const route = useRoute()

const selectedFlash = computed(() => {
  const id = route.query.flash
  if (!id) return null
  return flashStore.flashTattoos.find((f) => f.id === Number(id))
})

const getMonday = (d) => {
  d = new Date(d)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const selectedDate = ref(new Date().toISOString().split('T')[0])
const today = new Date().toISOString().split('T')[0]
const currentWeekStart = ref(getMonday(new Date()))

const isCurrentWeek = computed(() => {
  const now = new Date()
  const monday = getMonday(now)
  return currentWeekStart.value.toISOString().split('T')[0] === monday.toISOString().split('T')[0]
})

const showBookingForm = ref(false)
const bookingForm = ref({
  date: '',
  time: '',
  name: '',
  email: '',
  phone: '',
  description: selectedFlash.value ? `Réservation pour le flash: ${selectedFlash.value.title}` : '',
  size: '',
  placement: '',
  inspirations: '',
  terms: false,
})

// Calendar navigation
const previousWeek = () => {
  if (isCurrentWeek.value) return
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
}

const nextWeek = () => {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
}

const goToDate = () => {
  const newDate = new Date(selectedDate.value)
  currentWeekStart.value = getMonday(newDate)
}

// Calendar data
const weekDays = computed(() => {
  const days = []
  const current = new Date(currentWeekStart.value)
  for (let i = 0; i < 7; i++) {
    const date = new Date(current)
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' })
    const displayDate = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    // Check if open in general info
    const dayKey = dayName.charAt(0).toUpperCase() + dayName.slice(1)
    const dayInfo = infoStore.generalInfo.openingHours[dayKey]

    if (dayInfo && dayInfo.isOpen) {
      days.push({
        name: dayKey,
        displayDate: displayDate,
        date: date.toISOString().split('T')[0],
      })
    }
    current.setDate(current.getDate() + 1)
  }
  return days
})

const businessHours = computed(() => {
  const hours = infoStore.generalInfo.openingHours
  let minHour = 24
  let maxHour = 0

  Object.values(hours).forEach((day) => {
    if (day.isOpen) {
      if (day.morning?.start) {
        const start = parseInt(day.morning.start.split(':')[0])
        minHour = Math.min(minHour, start)
      }
      if (day.afternoon?.end) {
        const end = parseInt(day.afternoon.end.split(':')[0])
        maxHour = Math.max(maxHour, end)
      }
    }
  })

  // Fallback if none open
  if (minHour === 24)
    return ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

  const slots = []
  for (let h = minHour; h < maxHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
  }
  return slots
})

const formatHour = (hour) => hour

const isSlotAvailable = (date, hour) => {
  // 1. Check Standard Availability
  const d = new Date(date)
  const daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const dayName = daysFr[d.getDay()]
  const hours = infoStore.generalInfo.openingHours[dayName]

  let isStandardAvailable = false
  if (hours && hours.isOpen) {
    const checkTime = parseInt(hour.replace(':', ''))

    const isWithinSlot = (slot) => {
      if (!slot || !slot.start || !slot.end) return false
      const start = parseInt(slot.start.replace(':', ''))
      const end = parseInt(slot.end.replace(':', ''))
      return checkTime >= start && checkTime < end
    }

    isStandardAvailable = isWithinSlot(hours.morning) || isWithinSlot(hours.afternoon)
  }

  // 2. Check Exceptions
  const exceptionStatus = bookingStore.getSlotExceptionStatus(date, hour)
  if (exceptionStatus) {
    if (exceptionStatus === 'blocked') return false
    // If 'available' exception, we treat it as open even if standard closes it.
    isStandardAvailable = true
  }

  if (!isStandardAvailable) return false

  // 3. Check existing Bookings (Store Logic)
  return bookingStore.checkAvailability(date, hour)
}

const formatBookingDateTime = computed(() => {
  if (!bookingForm.value.date || !bookingForm.value.time) return ''
  const date = new Date(bookingForm.value.date)
  const duration = selectedFlash.value?.duration || 60

  const [hours, minutes] = bookingForm.value.time.split(':').map(Number)
  const endMinutesTotal = hours * 60 + minutes + duration
  const endHours = Math.floor(endMinutesTotal / 60)
  const endMinutes = endMinutesTotal % 60
  const endTimeFormatted = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`

  return `${date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })} de ${bookingForm.value.time} à ${endTimeFormatted}`
})

// Booking form handlers
const openBookingForm = (date, time) => {
  bookingForm.value.date = date
  bookingForm.value.time = time
  showBookingForm.value = true
}

const closeBookingForm = () => {
  showBookingForm.value = false
}

const submitBooking = async () => {
  const duration = selectedFlash.value?.duration || 60
  const [hours, minutes] = bookingForm.value.time.split(':').map(Number)
  const endMinutesTotal = hours * 60 + minutes + duration
  const endHours = Math.floor(endMinutesTotal / 60)
  const endMinutes = endMinutesTotal % 60
  const endTimeFormatted = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`

  loading.value = true
  try {
    const success = await bookingStore.submitBooking({
      ...bookingForm.value,
      endTime: endTimeFormatted,
    })

    if (success) {
      notificationStore.addNotification(
        'Demande envoyée',
        'Votre demande de réservation a été envoyée avec succès !',
        'success',
      )

      // Reset form and close modal
      bookingForm.value = {
        date: '',
        time: '',
        name: '',
        email: '',
        phone: '',
        description: '',
        size: '',
        placement: '',
        budget: '',
        inspirations: '',
        terms: false,
      }
      showBookingForm.value = false
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-12">Réserver votre séance</h1>
    <div class="max-w-6xl mx-auto">
      <!-- Calendar Navigation -->
      <div class="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div class="flex items-center space-x-4">
          <button
            @click="previousWeek"
            :disabled="isCurrentWeek"
            :class="[
              'bg-gray-100 text-gray-700 px-4 py-2 rounded-full transition-colors !rounded-button whitespace-nowrap',
              isCurrentWeek ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 cursor-pointer',
            ]"
          >
            <i class="fas fa-chevron-left mr-2"></i>Semaine précédente
          </button>
          <button
            @click="nextWeek"
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors !rounded-button cursor-pointer whitespace-nowrap"
          >
            Semaine suivante<i class="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
        <div class="flex items-center space-x-4">
          <input
            type="date"
            v-model="selectedDate"
            :min="today"
            class="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            @click="goToDate"
            class="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-colors !rounded-button cursor-pointer whitespace-nowrap"
          >
            Aller à la date
          </button>
        </div>
      </div>
      <!-- Weekly Calendar -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Calendar Header -->
        <div
          class="grid border-b"
          :style="{ gridTemplateColumns: `minmax(80px, 0.5fr) repeat(${weekDays.length}, 1fr)` }"
        >
          <div class="p-4 font-semibold text-gray-500 border-r">Heure</div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            class="p-4 font-semibold text-center border-r"
          >
            <div class="text-gray-800">{{ day.name }}</div>
            <div class="text-sm text-gray-500">{{ day.displayDate }}</div>
          </div>
        </div>
        <!-- Calendar Body -->
        <div class="divide-y">
          <div
            v-for="hour in businessHours"
            :key="hour"
            class="grid"
            :style="{ gridTemplateColumns: `minmax(80px, 0.5fr) repeat(${weekDays.length}, 1fr)` }"
          >
            <div class="p-4 text-sm text-gray-500 border-r">
              {{ formatHour(hour) }}
            </div>
            <div
              v-for="day in weekDays"
              :key="day.date + hour"
              :class="[
                'p-2 border-r transition-colors',
                isSlotAvailable(day.date, hour)
                  ? 'bg-green-100 hover:bg-green-200 cursor-pointer'
                  : 'bg-red-100 cursor-not-allowed opacity-50',
              ]"
              @click="isSlotAvailable(day.date, hour) && openBookingForm(day.date, hour)"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <!-- Booking Form Modal -->
    <div
      v-if="showBookingForm"
      class="fixed inset-0 z-[60] overflow-y-auto"
      @click.self="closeBookingForm"
    >
      <div class="flex items-center justify-center min-h-screen px-4">
        <div
          class="fixed inset-0 bg-black opacity-50 transition-opacity"
          @click="closeBookingForm"
        ></div>
        <div class="relative bg-white rounded-lg max-w-lg w-full mx-auto shadow-xl">
          <div class="p-6">
            <button
              @click="closeBookingForm"
              class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times"></i>
            </button>
            <h3 class="text-2xl font-bold mb-6">Réserver une séance</h3>
            <p class="text-gray-600 mb-6">Créneau sélectionné : {{ formatBookingDateTime }}</p>
            <form @submit.prevent="submitBooking" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input
                  v-model="bookingForm.name"
                  type="text"
                  required
                  placeholder="Jean Dupont"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="bookingForm.email"
                  type="email"
                  required
                  placeholder="jean.dupont@exemple.com"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  v-model="bookingForm.phone"
                  type="tel"
                  placeholder="06 12 34 56 78"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <textarea
                  v-model="bookingForm.description"
                  rows="3"
                  maxlength="500"
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Décrivez votre idée de tatouage..."
                ></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Taille approximative</label
                  >
                  <select
                    v-model="bookingForm.size"
                    class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Sélectionner une taille</option>
                    <option value="Petite (<5cm)">Petite pièce (&lt;5cm)</option>
                    <option value="Moyenne (5-15cm)">Moyenne (5-15cm)</option>
                    <option value="Grande (>15cm)">Grande (>15cm/Pièce complète)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Emplacement du corps</label
                  >
                  <input
                    v-model="bookingForm.placement"
                    type="text"
                    placeholder="Ex: Avant-bras, Dos..."
                    class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Inspirations</label>
                <textarea
                  v-model="bookingForm.inspirations"
                  rows="2"
                  placeholder="Flash vu sur le site, idée perso, références..."
                  class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                ></textarea>
              </div>
              <div>
                <label class="flex items-center">
                  <input v-model="bookingForm.terms" type="checkbox" required class="mr-2" />
                  <span class="text-sm text-gray-600">J'accepte les termes et conditions</span>
                </label>
              </div>
              <button
                type="submit"
                class="w-full bg-blue-400 text-white py-3 rounded-full hover:bg-blue-500 transition-colors !rounded-button cursor-pointer whitespace-nowrap"
              >
                Confirmer la réservation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.\!rounded-button {
  border-radius: 9999px;
}
/* Hide number input arrows */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInfoStore } from '../../stores/info'
import { useBookingStore } from '../../stores/booking'
import { useNotificationStore } from '../../stores/notification'

const bookingStore = useBookingStore()
const notificationStore = useNotificationStore()
const infoStore = useInfoStore()
const route = useRoute()
const router = useRouter()

// Date State
const currentDate = ref(new Date())
const weekStart = computed(() => {
  const d = new Date(currentDate.value)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // align to Monday
  return new Date(d.setDate(diff))
})

const weekDays = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
})

// Time Slots
const timeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
]

// Formatting
const formatDate = (date) => date.toISOString().split('T')[0]

// Navigation
const prevWeek = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() - 7))
}
const nextWeek = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + 7))
}
const goToToday = () => {
  currentDate.value = new Date()
}

// Data Helpers
const getBookingForSlot = (date, time) => {
  const dateStr = formatDate(date)
  const slotTimeVal = parseInt(time.replace(':', ''))

  return bookingStore.bookings.find((b) => {
    if (b.date !== dateStr || b.status === 'cancelled') return false

    const startTimeVal = parseInt(b.time.replace(':', ''))
    const endTimeVal = b.endTime ? parseInt(b.endTime.replace(':', '')) : startTimeVal + 60

    return slotTimeVal >= startTimeVal && slotTimeVal < endTimeVal
  })
}

const getEventForSlot = (date, time) => {
  const dateStr = formatDate(date)
  return bookingStore.slotExceptions.find((e) => e.date === dateStr && e.time === time && e.title)
}

const getEventPosition = (event) => {
  if (!event || !event.title) return null
  const date = event.date

  const dayEvents = bookingStore.slotExceptions.filter(
    (e) => e.date === date && e.title === event.title,
  )
  if (dayEvents.length <= 1) return 'single'

  const sortedTimes = dayEvents.map((e) => e.time).sort()
  const isStart = event.time === sortedTimes[0]
  const isEnd = event.time === sortedTimes[sortedTimes.length - 1]

  if (isStart && isEnd) return 'single'
  if (isStart) return 'start'
  if (isEnd) return 'end'
  return 'middle'
}
const getEventTimeRange = (event) => {
  if (!event || !event.title) return ''
  const dayEvents = bookingStore.slotExceptions.filter(
    (e) => e.date === event.date && e.title === event.title,
  )
  if (dayEvents.length === 0) return ''

  const sortedTimes = dayEvents.map((e) => e.time).sort()
  const startTime = sortedTimes[0]
  const lastSlotTime = sortedTimes[sortedTimes.length - 1]

  // End time is the next slot after the last blocked slot
  const lastIdx = timeSlots.indexOf(lastSlotTime)
  const endTime = lastIdx > -1 && lastIdx < timeSlots.length - 1 ? timeSlots[lastIdx + 1] : '19:00'

  return `${startTime} - ${endTime}`
}

const getBookingPosition = (booking, time) => {
  if (!booking) return null
  const startTimeVal = parseInt(booking.time.replace(':', ''))
  const endTimeVal = booking.endTime
    ? parseInt(booking.endTime.replace(':', ''))
    : startTimeVal + 60

  const isStart = booking.time === time

  // Find which slots are affected
  const affectedSlots = timeSlots.filter((t) => {
    const tVal = parseInt(t.replace(':', ''))
    return tVal >= startTimeVal && tVal < endTimeVal
  })
  const isEnd = time === affectedSlots[affectedSlots.length - 1]

  if (isStart && isEnd) return 'single'
  if (isStart) return 'start'
  if (isEnd) return 'end'
  return 'middle'
}

const getStandardAvailability = (date, time) => {
  const daysFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const dayName = daysFr[date.getDay()]
  const hours = infoStore.generalInfo.openingHours[dayName]

  if (!hours || !hours.isOpen) return false

  // Parse time "10:00" -> 1000
  const checkTime = parseInt(time.replace(':', ''))

  // Helper to check a slot
  const isWithinSlot = (slot) => {
    if (!slot || !slot.start || !slot.end) return false
    const start = parseInt(slot.start.replace(':', ''))
    const end = parseInt(slot.end.replace(':', ''))
    return checkTime >= start && checkTime < end
  }

  // Check Morning OR Afternoon
  return isWithinSlot(hours.morning) || isWithinSlot(hours.afternoon)
}

const getSlotStatus = (date, time) => {
  const isStandard = getStandardAvailability(date, time)
  const exceptionStatus = bookingStore.getSlotExceptionStatus(formatDate(date), time)

  if (exceptionStatus) return exceptionStatus
  return isStandard ? 'available' : 'blocked'
}

const isBlocked = (date, time) => {
  return getSlotStatus(date, time) === 'blocked'
}

onMounted(() => {
  // Check for query params to open event modal
  if (route.query.action === 'create') {
    eventForm.value.title = route.query.title || ''
    eventForm.value.description = route.query.description || ''

    // Clean URL
    router.replace({ query: null })

    showEventModal.value = true
  }
})

// Interaction
const handleSlotClick = (date, time) => {
  const booking = getBookingForSlot(date, time)
  if (booking) {
    openEditModal(booking)
    return
  }

  const event = getEventForSlot(date, time)
  if (event) {
    openEventModal(event)
    return
  }

  // Toggle Availability logic (only if no booking or event)
  const isStandard = getStandardAvailability(date, time)
  bookingStore.toggleSlotAvailability(formatDate(date), time, isStandard, false)
}

const toggleDay = async (date) => {
  const dateStr = formatDate(date)
  const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(date)
  const slots = timeSlots.map((time) => ({
    time,
    status: getSlotStatus(date, time),
    hasBooking: !!getBookingForSlot(date, time),
    isStandard: getStandardAvailability(date, time),
  }))

  // Decide target status: if any non-booked slot is available, we block all. Otherwise we unblock all.
  const anyAvailable = slots.some((s) => s.status === 'available' && !s.hasBooking)
  const targetStatus = anyAvailable ? 'blocked' : 'available'

  for (const slot of slots) {
    if (slot.hasBooking) continue
    if (slot.status !== targetStatus) {
      await bookingStore.toggleSlotAvailability(dateStr, slot.time, slot.isStandard, true)
    }
  }

  const formattedDate = date.toLocaleDateString('fr-FR')
  notificationStore.addNotification(
    'Journée mise à jour',
    `Tous les créneaux de ${dayName} (${formattedDate}) ${targetStatus === 'blocked' ? 'bloqués' : 'débloqués'}`,
    'info',
  )
}

// Booking Modal Logic
const showModal = ref(false)
const editingBooking = ref(null)
const editForm = ref({ date: '', time: '', endTime: '' })

const openEditModal = (booking) => {
  editingBooking.value = booking
  editForm.value = {
    date: booking.date,
    time: booking.time,
    endTime: booking.endTime || '',
  }
  showModal.value = true
}

const saveBookingChanges = () => {
  if (editingBooking.value) {
    bookingStore.updateBookingDate(
      editingBooking.value.id,
      editForm.value.date,
      editForm.value.time,
      editForm.value.endTime,
    )
    showModal.value = false
    editingBooking.value = null
  }
}

const updateStatus = async (status) => {
  if (editingBooking.value) {
    await bookingStore.updateStatus(editingBooking.value.id, status)
    showModal.value = false
    editingBooking.value = null
  }
}

// Event Modal Logic
const showEventModal = ref(false)
const isEditingEvent = ref(false)
const editingEventId = ref(null)
const eventForm = ref({
  type: 'event', // event | tattoo
  title: '',
  description: '',
  date: formatDate(new Date()),
  startTime: '10:00',
  endTime: '11:00',
  price: null,
})

const openEventModal = (event = null) => {
  if (event) {
    isEditingEvent.value = true
    editingEventId.value = event.id
    eventForm.value = {
      title: event.title,
      description: event.description || '',
      date: event.date,
      startTime: event.time,
      endTime: '', // Can't easily determine endTime from a single slot e ID, but we can try to guess or just leave for update
    }
    // Try to find the end time by looking at subsequent slots for this event title
    const daySlots = bookingStore.slotExceptions.filter(
      (s) => s.date === event.date && s.title === event.title,
    )
    if (daySlots.length > 0) {
      const sortedTimes = daySlots.map((s) => s.time).sort()
      const lastTime = sortedTimes[sortedTimes.length - 1]
      const lastIdx = timeSlots.indexOf(lastTime)
      if (lastIdx > -1 && lastIdx < timeSlots.length - 1) {
        eventForm.value.endTime = timeSlots[lastIdx + 1]
      } else {
        eventForm.value.endTime = '19:00' // Fallback
      }
    }
  } else {
    isEditingEvent.value = false
    editingEventId.value = null
    eventForm.value = {
      type: 'event',
      title: '',
      description: '',
      date: formatDate(new Date()),
      startTime: '10:00',
      endTime: '11:00',
      price: null,
    }
  }
  showEventModal.value = true
}

const handleCreateEvent = async () => {
  if (isEditingEvent.value) {
    // For editing, we currently don't have a specific "updateEvent" that handles blocks,
    // so we'll delete the old one and add the new one (simplest without changing store too much today)
    const event = bookingStore.slotExceptions.find((s) => s.id === editingEventId.value)
    if (event) {
      const related = bookingStore.slotExceptions.filter(
        (s) => s.date === event.date && s.title === event.title,
      )
      for (const r of related) {
        await bookingStore.deleteException(r.id)
      }
    }
  }

  if (eventForm.value.type === 'tattoo') {
    // Create Booking
    const success = await bookingStore.submitBooking({
      name: eventForm.value.title,
      email: '', // Not required for admin manual entry
      date: eventForm.value.date,
      time: eventForm.value.startTime,
      endTime: eventForm.value.endTime,
      description: eventForm.value.description || 'Projet Tatouage',
      price: eventForm.value.price || 0,
      status: 'confirmed', // Auto-confirm admin creation
    })

    if (success) {
      showEventModal.value = false
      bookingStore.fetchBookings() // Refresh bookings
    }
  } else {
    // Create Exception Event
    const success = await bookingStore.addEvent(eventForm.value)
    if (success) {
      showEventModal.value = false
    }
  }
}

const handleDeleteEvent = async () => {
  if (editingEventId.value) {
    const event = bookingStore.slotExceptions.find((s) => s.id === editingEventId.value)
    if (event) {
      const related = bookingStore.slotExceptions.filter(
        (s) => s.date === event.date && s.title === event.title,
      )
      for (const r of related) {
        await bookingStore.deleteException(r.id)
      }
    }
    showEventModal.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <div class="flex justify-end gap-3">
      <button
        @click="openEventModal()"
        class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        <i class="fas fa-calendar-plus"></i>
        Ajouter un événement
      </button>
    </div>

    <!-- Content Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
      <!-- Calendar Controls & Navigation -->
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div class="flex items-center gap-4">
          <h2 class="text-xl font-bold text-gray-800 capitalize">
            {{ weekDays[0].toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}
          </h2>
          <div class="flex gap-2">
            <button
              @click="prevWeek"
              class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <i class="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              @click="goToToday"
              class="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              @click="nextWeek"
              class="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <i class="fas fa-chevron-right text-xs"></i>
            </button>
            <input
              type="date"
              :value="formatDate(currentDate)"
              @input="(e) => (currentDate = new Date(e.target.value))"
              class="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </div>

        <div class="text-sm text-gray-400 italic">
          <i class="fas fa-info-circle mr-1"></i> Cliquez sur un créneau libre pour le bloquer.
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="overflow-x-auto rounded-xl border border-gray-100">
        <div class="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] min-w-[800px]">
          <!-- Header Row -->
          <div class="p-4 border-b border-r bg-gray-50/50 text-center font-bold text-gray-500">
            Heure
          </div>
          <div
            v-for="day in weekDays"
            :key="day.toISOString()"
            class="p-4 border-b border-r last:border-r-0 bg-gray-50/50 text-center font-semibold text-gray-700 capitalize group relative cursor-pointer hover:bg-gray-100 transition-colors"
            :class="{ 'bg-pink-50 text-pink-700': formatDate(day) === formatDate(new Date()) }"
            @click="toggleDay(day)"
          >
            <div
              class="absolute top-1 right-1 p-1 text-[10px] text-gray-400 group-hover:text-pink-600 transition-colors"
              title="Tout basculer"
            >
              <i class="fas fa-sync-alt"></i>
            </div>
            <div class="text-lg">
              {{ new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(day) }}
            </div>
            <div class="text-xs font-normal opacity-75">
              {{
                new Intl.DateTimeFormat('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }).format(day)
              }}
            </div>
          </div>

          <!-- Time Rows -->
          <template v-for="time in timeSlots" :key="time">
            <!-- Time Label -->
            <div
              class="p-4 border-b border-r bg-gray-50/50 text-center text-sm text-gray-500 font-medium"
            >
              {{ time }}
            </div>
            <!-- Days Cols -->
            <div
              v-for="day in weekDays"
              :key="day.toISOString() + time"
              class="border-b border-r last:border-r-0 h-24 relative transition-colors px-2"
              :class="{
                'bg-gray-100 cursor-pointer py-2':
                  isBlocked(day, time) &&
                  !getBookingForSlot(day, time) &&
                  !getEventForSlot(day, time),
                'bg-gray-100 cursor-pointer py-0': getEventForSlot(day, time),
                'bg-white hover:bg-gray-50 cursor-pointer py-2':
                  !isBlocked(day, time) && !getBookingForSlot(day, time),
                'bg-white py-0': getBookingForSlot(day, time),
              }"
              @click="handleSlotClick(day, time)"
            >
              <!-- Blocked State -->
              <div v-if="isBlocked(day, time) && !getBookingForSlot(day, time)" class="h-full">
                <div
                  v-if="getEventForSlot(day, time)"
                  :class="[
                    'w-full text-xs overflow-hidden cursor-pointer shadow-sm border-l-4 transition-all px-2 bg-indigo-50 border-indigo-500 flex flex-col justify-center',
                    getEventPosition(getEventForSlot(day, time)) === 'start'
                      ? 'rounded-t-lg mt-2 h-[calc(100%-0.5rem)] pt-1'
                      : '',
                    getEventPosition(getEventForSlot(day, time)) === 'middle'
                      ? 'rounded-none h-full py-1'
                      : '',
                    getEventPosition(getEventForSlot(day, time)) === 'end'
                      ? 'rounded-b-lg mb-2 h-[calc(100%-0.5rem)] pb-1'
                      : '',
                    getEventPosition(getEventForSlot(day, time)) === 'single'
                      ? 'rounded-lg my-2 h-[calc(100%-1rem)] py-1'
                      : '',
                  ]"
                >
                  <div
                    v-if="
                      ['start', 'single'].includes(getEventPosition(getEventForSlot(day, time)))
                    "
                    class="font-bold truncate text-indigo-900"
                  >
                    {{ getEventForSlot(day, time).title }}
                  </div>
                  <div
                    v-if="
                      ['start', 'single'].includes(getEventPosition(getEventForSlot(day, time)))
                    "
                    class="text-[10px] text-indigo-700 font-medium"
                  >
                    {{ getEventTimeRange(getEventForSlot(day, time)) }}
                  </div>
                  <div
                    v-if="
                      ['start', 'single'].includes(getEventPosition(getEventForSlot(day, time)))
                    "
                    class="text-[8px] text-indigo-400 font-bold uppercase mt-0.5"
                  >
                    Événement
                  </div>
                </div>
                <div
                  v-else
                  class="flex flex-col items-center justify-center h-full text-center px-1"
                >
                  <i class="fas fa-ban text-xs text-gray-300 mb-1"></i>
                  <div class="text-[10px] text-gray-400">Indispo.</div>
                </div>
              </div>

              <!-- Booking State -->
              <div
                v-if="getBookingForSlot(day, time)"
                @click="openEditModal(getBookingForSlot(day, time))"
                :class="[
                  'w-full text-xs overflow-hidden cursor-pointer shadow-sm border-l-4 transition-all px-2',
                  getBookingForSlot(day, time).status === 'confirmed'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-yellow-50 border-yellow-500',
                  getBookingPosition(getBookingForSlot(day, time), time) === 'start'
                    ? 'rounded-t-lg mt-2 h-[calc(100%-0.5rem)] pt-1'
                    : '',
                  getBookingPosition(getBookingForSlot(day, time), time) === 'middle'
                    ? 'rounded-none h-full py-1'
                    : '',
                  getBookingPosition(getBookingForSlot(day, time), time) === 'end'
                    ? 'rounded-b-lg mb-2 h-[calc(100%-0.5rem)] pb-1'
                    : '',
                  getBookingPosition(getBookingForSlot(day, time), time) === 'single'
                    ? 'rounded-lg my-2 h-[calc(100%-1rem)] py-1'
                    : '',
                ]"
              >
                <template
                  v-if="
                    ['start', 'single'].includes(
                      getBookingPosition(getBookingForSlot(day, time), time),
                    )
                  "
                >
                  <div class="font-bold truncate text-gray-800">
                    {{ getBookingForSlot(day, time).client }}
                  </div>
                  <div class="text-[10px] text-gray-500 font-medium">
                    {{ getBookingForSlot(day, time).time }} -
                    {{ getBookingForSlot(day, time).endTime || '?' }}
                  </div>
                  <div class="text-gray-500 truncate">
                    {{ getBookingForSlot(day, time).project }}
                  </div>
                </template>
                <div
                  v-if="
                    ['start', 'single'].includes(
                      getBookingPosition(getBookingForSlot(day, time), time),
                    )
                  "
                  class="text-[10px] mt-1 uppercase font-semibold"
                  :class="
                    getBookingForSlot(day, time).status === 'confirmed'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  "
                >
                  {{ $t(`status.${getBookingForSlot(day, time).status}`) }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 class="font-bold">Modifier la réservation</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-6">
          <div class="flex items-center gap-3 mb-6 p-3 bg-blue-50 rounded-lg">
            <div
              class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold"
            >
              {{ editingBooking?.client?.charAt(0) }}
            </div>
            <div>
              <div class="font-bold text-gray-800">{{ editingBooking?.client }}</div>
              <div class="text-xs text-blue-600 uppercase font-semibold">
                {{ $t(`status.${editingBooking?.status}`) }}
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
              <input
                v-model="editForm.date"
                type="date"
                class="w-full border rounded p-2 text-sm"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Début</label>
                <select v-model="editForm.time" class="w-full border rounded p-2 text-sm">
                  <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Fin</label>
                <select v-model="editForm.endTime" class="w-full border rounded p-2 text-sm">
                  <option value="">-</option>
                  <option v-for="t in timeSlots" :key="'end-' + t" :value="t">{{ t }}</option>
                  <option value="19:00">19:00</option>
                  <option value="20:00">20:00</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t flex flex-col gap-2">
              <button
                v-if="editingBooking?.status !== 'confirmed'"
                @click="updateStatus('confirmed')"
                class="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold transition-colors"
              >
                Confirmer la réservation
              </button>
              <button
                v-if="editingBooking?.status !== 'cancelled'"
                @click="updateStatus('cancelled')"
                class="w-full py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 font-bold transition-colors"
              >
                Annuler la réservation
              </button>
            </div>
          </div>

          <div class="mt-8 flex justify-end gap-2">
            <button
              @click="showModal = false"
              class="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
            >
              Fermer
            </button>
            <button
              @click="saveBookingChanges"
              class="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 font-bold"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <div
      v-if="showEventModal"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden">
        <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 class="font-bold">
            {{ isEditingEvent ? "Modifier l'événement" : 'Ajouter un événement' }}
          </h3>
          <button @click="showEventModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
            <div class="flex gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="eventForm.type"
                  value="event"
                  class="text-purple-600 focus:ring-purple-500"
                />
                <span
                  :class="eventForm.type === 'event' ? 'font-bold text-gray-800' : 'text-gray-600'"
                  >Indisponibilité / Autre</span
                >
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="eventForm.type"
                  value="tattoo"
                  class="text-purple-600 focus:ring-purple-500"
                />
                <span
                  :class="eventForm.type === 'tattoo' ? 'font-bold text-gray-800' : 'text-gray-600'"
                  >Séance Tatouage</span
                >
              </label>
            </div>
          </div>

          <div
            v-if="eventForm.type === 'tattoo'"
            class="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-100"
          >
            <div>
              <label class="block text-xs font-bold text-purple-700 uppercase mb-1">Client</label>
              <input
                v-model="eventForm.title"
                type="text"
                placeholder="Nom du client"
                class="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-purple-700 uppercase mb-1">Projet</label>
              <input
                v-model="eventForm.description"
                type="text"
                placeholder="Ex: Bras complet, Fleur..."
                class="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-purple-700 uppercase mb-1"
                >Prix (Est.)</label
              >
              <div class="relative">
                <input
                  v-model.number="eventForm.price"
                  type="number"
                  placeholder="0"
                  class="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none pl-8"
                />
                <span class="absolute left-3 top-2 text-purple-400">€</span>
              </div>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Titre</label>
              <input
                v-model="eventForm.title"
                type="text"
                placeholder="Ex: Rendez-vous perso, Réunion..."
                class="w-full border rounded p-2 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1"
                >Description (Optionnel)</label
              >
              <textarea
                v-model="eventForm.description"
                class="w-full border rounded p-2 text-sm"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
            <input v-model="eventForm.date" type="date" class="w-full border rounded p-2 text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Dès</label>
              <select v-model="eventForm.startTime" class="w-full border rounded p-2 text-sm">
                <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Jusqu'à</label>
              <select v-model="eventForm.endTime" class="w-full border rounded p-2 text-sm">
                <option v-for="t in timeSlots" :key="'event-' + t" :value="t">{{ t }}</option>
                <option value="19:00">19:00</option>
                <option value="20:00">20:00</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-between items-center">
            <button
              v-if="isEditingEvent"
              @click="handleDeleteEvent"
              class="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium transition-colors"
            >
              Supprimer
            </button>
            <div v-else></div>

            <div class="flex gap-2">
              <button @click="showEventModal = false" class="px-4 py-2 text-gray-500 font-medium">
                Annuler
              </button>
              <button
                @click="handleCreateEvent"
                class="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold shadow-sm"
                :disabled="!eventForm.title || !eventForm.date"
              >
                {{ isEditingEvent ? 'Enregistrer' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

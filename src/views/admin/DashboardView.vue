<template>
  <div class="space-y-6">
    <!-- Header Card -->
    <!-- Header Removed -->

    <!-- Stats Cards (Mini) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-pink-500 hover:shadow-md transition-shadow relative group">
        <h3 class="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">Flashs Vus</h3>
        <p class="text-2xl font-bold text-gray-800">{{ totalFlashViews }}</p>
        <router-link to="/admin/flash" class="absolute inset-0 z-10" aria-label="Voir les flashs"></router-link>
        <i class="fas fa-arrow-right absolute right-4 top-1/2 -translate-y-1/2 text-gray-200 group-hover:text-pink-500 transition-colors"></i>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow relative group">
        <h3 class="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">Galerie Vues</h3>
        <p class="text-2xl font-bold text-gray-800">{{ totalGalleryViews }}</p>
         <router-link to="/admin/gallery" class="absolute inset-0 z-10" aria-label="Voir la galerie"></router-link>
         <i class="fas fa-arrow-right absolute right-4 top-1/2 -translate-y-1/2 text-gray-200 group-hover:text-purple-500 transition-colors"></i>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow relative group">
         <h3 class="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">En Attente</h3>
         <p class="text-2xl font-bold text-gray-800">{{ pendingBookings }}</p>
         <router-link to="/admin/bookings?status=pending" class="absolute inset-0 z-10" aria-label="Voir les réservations en attente"></router-link>
         <i class="fas fa-arrow-right absolute right-4 top-1/2 -translate-y-1/2 text-gray-200 group-hover:text-blue-500 transition-colors"></i>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
         <h3 class="text-gray-500 font-bold uppercase text-xs tracking-wider mb-1">CA du Mois</h3>
         <p class="text-2xl font-bold text-gray-800">{{ monthlyRevenue }}€</p>
      </div>
    </div>

    <!-- Today's Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Réservations du Jour (Detailed) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-teal-500 h-full">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-calendar-day text-teal-500"></i>
                Réservations du Jour
              </h2>
               <router-link to="/admin/bookings" class="text-xs text-teal-600 hover:text-teal-800 font-bold bg-teal-50 px-3 py-1 rounded-full">Voir tout</router-link>
            </div>
            <div class="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <div v-if="todayBookingsList.length === 0" class="text-gray-500 text-sm italic py-4">
                    Aucune réservation prévue aujourd'hui.
                </div>
                <div
                    v-for="booking in todayBookingsList"
                    :key="'today-' + booking.id"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-teal-50/30 transition-colors cursor-pointer"
                    @click="navigateToBooking(booking.id)"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xs">
                             {{ booking.time ? booking.time.substring(0, 5) : '--:--' }}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800 text-sm">{{ booking.client }}</h4>
                            <p class="text-xs text-gray-500">{{ booking.project || booking.tattoo }}</p>
                        </div>
                    </div>
                    <span
                        :class="{
                          'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                          'bg-green-100 text-green-800': booking.status === 'confirmed',
                          'bg-red-100 text-red-800': booking.status === 'cancelled',
                        }"
                        class="px-2 py-1 rounded-full text-[10px] font-bold"
                      >
                        {{ $t(`status.${booking.status}`) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Bilan du Jour (Completed) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 h-full">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-check-circle text-green-500"></i>
                Bilan du Jour (À traiter)
              </h2>
            </div>
            <div class="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <div v-if="completedToday.length === 0" class="text-gray-500 text-sm italic py-4">
                Aucune séance terminée à traiter pour le moment.
              </div>
              <div
                v-for="booking in completedToday"
                :key="'bilan-' + booking.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"
                  >
                    <i class="fas fa-user text-xs"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-800 text-sm">{{ booking.client }}</h4>
                    <p class="text-[10px] text-gray-500">
                      {{ booking.project || booking.tattoo }}
                      <span v-if="booking.price" class="text-green-600 font-bold ml-1">
                        {{ booking.price }}€
                      </span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    @click="publishToGallery(booking)"
                    class="bg-purple-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-all shadow-sm"
                    title="Publier"
                  >
                    <i class="fas fa-camera text-xs"></i>
                  </button>
                  <button
                    @click="ignoreBooking(booking)"
                    class="bg-white text-gray-400 border border-gray-200 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-50 hover:text-gray-600 transition-all shadow-sm"
                    title="Ignorer"
                  >
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </div>
              </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Last Bookings -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">{{ $t('dashboard.lastBookings') }}</h2>
          <router-link
            to="/admin/bookings"
            class="text-pink-600 hover:text-pink-700 font-bold text-sm bg-pink-50 px-3 py-1 rounded-full transition-colors"
          >
            {{ $t('dashboard.table.viewAll') }}
          </router-link>
        </div>
        <div class="overflow-x-auto flex-1 max-h-60 overflow-y-auto custom-scrollbar">
          <table class="w-full text-left">
            <thead>
              <tr class="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 sticky top-0 bg-white z-10">
                <th class="pb-3 pl-2">{{ $t('dashboard.table.client') }}</th>
                <th class="pb-3">{{ $t('dashboard.table.project') }}</th>
                <th class="pb-3">{{ $t('dashboard.table.date') }}</th>
                <th class="pb-3 pr-2">{{ $t('dashboard.table.status') }}</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr
                v-for="booking in lastBookings"
                :key="booking.id"
                class="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                @click="navigateToBooking(booking.id)"
              >
                <td class="py-3 pl-2 font-bold text-gray-700">{{ booking.client }}</td>
                <td class="py-3 text-gray-600 flex items-center gap-2">
                  <div class="truncate max-w-[150px]">{{ booking.project || booking.tattoo }}</div>
                </td>
                <td class="py-3 text-gray-500 whitespace-nowrap">{{ booking.date }}</td>
                <td class="py-3 pr-2">
                  <span
                    :class="{
                      'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                      'bg-green-100 text-green-800': booking.status === 'confirmed',
                      'bg-red-100 text-red-800': booking.status === 'cancelled',
                    }"
                    class="px-2 py-1 rounded-full text-[10px] font-bold"
                  >
                    {{ $t(`status.${booking.status}`) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Messages -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">Derniers messages non lus</h2>
          <router-link
            to="/admin/messages"
            class="text-pink-600 hover:text-pink-700 font-bold text-sm bg-pink-50 px-3 py-1 rounded-full transition-colors"
          >
            Voir tout
          </router-link>
        </div>
        <div class="space-y-3 flex-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          <div v-if="recentMessages.length === 0" class="text-gray-500 text-sm italic">
            Aucun message non lu récent.
          </div>
          <div
            v-for="msg in recentMessages"
            :key="msg.id"
            class="flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors cursor-pointer group"
            :class="{ 'bg-blue-50/50 border-blue-100': !msg.read }"
            @click="navigateToMessages(msg.id)"
          >
            <div class="flex gap-4 w-full min-w-0">
              <div
                class="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold flex-shrink-0 text-sm group-hover:bg-white group-hover:shadow-sm transition-all"
              >
                {{ msg.from.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                  <h4 class="font-bold text-gray-900 flex items-center gap-2 text-sm truncate">
                    {{ msg.from }}
                    <span
                      v-if="!msg.read"
                      class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse"
                      title="Nouveau"
                    ></span>
                  </h4>
                  <span class="text-[10px] text-gray-400 whitespace-nowrap ml-2">{{
                    formatDate(msg.created_at || msg.date)
                  }}</span>
                </div>

                <p class="text-xs font-medium text-gray-700 truncate mb-1">{{ msg.subject }}</p>
                <p class="text-[10px] text-gray-500 line-clamp-1">
                  {{ msg.message }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Stats Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Top Flashs -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-80">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                Top Flashs
                <router-link to="/admin/flash" class="text-xs text-purple-600 hover:text-purple-800">Voir tout</router-link>
            </h2>
            <div class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div
                    v-for="item in topFlashItems"
                    :key="item.id"
                    class="flex items-center space-x-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                >
                    <img :src="item.images[0]" class="w-10 h-10 object-cover rounded-lg bg-gray-100" />
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-800 text-sm truncate">{{ item.title }}</h4>
                        <p class="text-xs text-gray-500">{{ item.price }}€</p>
                    </div>
                    <span class="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{{ item.views || 0 }} vues</span>
                </div>
                <p v-if="topFlashItems.length === 0" class="text-xs text-gray-400 italic">Aucune donnée.</p>
            </div>
        </div>

        <!-- Top Galeries -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-80">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                Top Galeries
                <router-link to="/admin/gallery" class="text-xs text-purple-600 hover:text-purple-800">Voir tout</router-link>
            </h2>
            <div class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div
                    v-for="item in topGalleryItems"
                    :key="item.id"
                    class="flex items-center space-x-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                >
                    <img :src="item.images[0]" class="w-10 h-10 object-cover rounded-lg bg-gray-100" />
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-800 text-sm truncate">{{ item.title }}</h4>
                        <p class="text-xs text-gray-500">{{ item.category }}</p>
                    </div>
                    <span class="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{{ item.views || 0 }} vues</span>
                </div>
                 <p v-if="topGalleryItems.length === 0" class="text-xs text-gray-400 italic">Aucune donnée.</p>
            </div>
        </div>

        <!-- Top Blogs -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col max-h-80">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                Top Articles
                <router-link to="/admin/blog" class="text-xs text-purple-600 hover:text-purple-800">Voir tout</router-link>
            </h2>
            <div class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                 <div
                    v-for="item in topBlogItems"
                    :key="item.id"
                    class="flex items-center space-x-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                >
                     <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                         <i class="fas fa-newspaper"></i>
                     </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-800 text-sm truncate">{{ item.title }}</h4>
                        <p class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</p>
                    </div>
                    <span class="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{{ item.views || 0 }} vues</span>
                </div>
                 <p v-if="topBlogItems.length === 0" class="text-xs text-gray-400 italic">Aucune donnée.</p>
            </div>
        </div>
    </div>

    <ConfirmModal
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :type="confirmModal.type"
      @confirm="handleConfirm"
      @cancel="confirmModal.isOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFlashStore } from '@/stores/flash'
import { useGalleryStore } from '@/stores/gallery'
import { useBookingStore } from '@/stores/booking'
import { useMessageStore } from '@/stores/message'
import { useBlogStore } from '@/stores/blog'
import { useNotificationStore } from '@/stores/notification'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const router = useRouter()
const flashStore = useFlashStore()
const galleryStore = useGalleryStore()
const bookingStore = useBookingStore()
const messageStore = useMessageStore()
const blogStore = useBlogStore()
const notificationStore = useNotificationStore()

// Confirm Modal state
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  type: 'danger',
  action: null,
})

const openConfirmModal = (title, message, type, action) => {
  confirmModal.value = { isOpen: true, title, message, type, action }
}

const handleConfirm = () => {
  if (confirmModal.value.action) confirmModal.value.action()
  confirmModal.value.isOpen = false
}

const totalFlashViews = computed(() =>
  flashStore.flashTattoos.reduce((acc, curr) => acc + (curr.views || 0), 0),
)
const totalGalleryViews = computed(() =>
  galleryStore.galleryItems.reduce((acc, curr) => acc + (curr.views || 0), 0),
)
const pendingBookings = computed(
  () => bookingStore.bookings.filter((b) => b.status === 'pending').length,
)

const todayBookingsList = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return bookingStore.bookings
    .filter((b) => b.date === today && b.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))
})

const monthlyRevenue = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return bookingStore.bookings
    .filter((b) => {
      // Must be processed (completed/paid/archived)
      if (!b.processed) return false

      const d = new Date(b.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
})

const topFlashItems = computed(() => {
  return [...flashStore.flashTattoos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
})

const topGalleryItems = computed(() => {
  return [...galleryStore.galleryItems].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
})

const topBlogItems = computed(() => {
  return [...blogStore.posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
})

const lastBookings = computed(() => {
  return [...bookingStore.bookings].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
})

const recentMessages = computed(() => {
  // Sort by date desc
  return [...messageStore.messages]
    .filter((m) => !m.read)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

const completedToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  return bookingStore.bookings.filter((b) => {
    // Only today's bookings
    if (b.date !== today) return false
    // Only confirmed bookings
    if (b.status !== 'confirmed') return false
    // Only bookings that have started (past current time)
    if (b.time > currentTime) return false
    // Only NOT processed
    return !b.processed
  })
})

const getRelatedItem = (msg) => {
  if (!msg.relatedItemId) return null
  if (msg.relatedItemType === 'flash') {
    const item = flashStore.flashTattoos.find((f) => f.id === msg.relatedItemId)
    return item ? { ...item, image: item.images[0] } : null
  }
  if (msg.relatedItemType === 'gallery') {
    const item = galleryStore.galleryItems.find((f) => f.id === msg.relatedItemId)
    return item ? { ...item, image: item.images[0] } : null
  }
  return null
}

const formatDate = (iso) => {
  const d = new Date(iso)
  // Simple relative or short format
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const navigateToBooking = (id) => {
  router.push({ path: '/admin/bookings', query: { highlight: id } })
}

const navigateToMessages = (id) => {
  router.push({ path: '/admin/messages', query: { highlight: id } })
}

const navigateToItem = (item) => {
  if (item.type === 'Flash') {
    router.push({ path: '/admin/flash', query: { search: item.title } })
  } else {
    router.push({ path: '/admin/gallery', query: { search: item.title } })
  }
}

const publishToGallery = (booking) => {
  const query = {
    title: booking.project || booking.tattoo,
    refId: booking.id,
  }

  // If it's linked to a flash, we try to find the flash image
  // The artist will probably upload a photo of the actual tattoo,
  // but pre-filling the title and flash link is helpful.
  const searchLower = (booking.project || booking.tattoo).toLowerCase()
  const flash = flashStore.flashTattoos.find((f) => searchLower.includes(f.title.toLowerCase()))

  if (flash) {
    query.flashId = flash.id
    query.image = flash.images[0]
  }

  query.fromBilan = 'true'
  if (booking.price) query.price = booking.price
  router.push({ path: '/admin/gallery', query })
}

const ignoreBooking = async (booking) => {
  openConfirmModal(
    'Ignorer la séance',
    `Voulez-vous ignorer cette séance ? Le flash associé sera marqué comme terminé.`,
    'warning',
    async () => {
      // 1. Mark booking as processed
      await bookingStore.markAsProcessed(booking.id)

      // 2. Identify and mark flash as tattooed (if applicable)
      const searchLower = (booking.project || booking.tattoo).toLowerCase()
      const flash = flashStore.flashTattoos.find((f) => searchLower.includes(f.title.toLowerCase()))

      if (flash) {
        await flashStore.updateFlash(flash.id, { status: 'tattooed' })
      }

      notificationStore.addNotification('Séance ignorée', 'Le bilan a été mis à jour.', 'info')
    },
  )
}
</script>

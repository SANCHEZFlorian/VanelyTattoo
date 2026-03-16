<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ToastContainer from '../components/ui/ToastContainer.vue'
import { useNotificationStore } from '../stores/notification'
import { useMessageStore } from '../stores/message'
import { useBookingStore } from '../stores/booking'
import { useAuthStore } from '../stores/auth'

const sidebarExpanded = ref(true)
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const messageStore = useMessageStore()
const bookingStore = useBookingStore()

const toggleSidebar = () => {
  sidebarExpanded.value = !sidebarExpanded.value
}

const tabs = computed(() => [
  {
    id: 'stats',
    name: t('sidebar.dashboard'),
    icon: 'fas fa-chart-line',
    path: '/admin/dashboard',
    description: "Vue d'ensemble de votre activité et statistiques.",
  },
  {
    id: 'banners',
    name: 'Carrousel',
    icon: 'fas fa-images',
    path: '/admin/banners',
    description: "Gérez les bannières de la page d'accueil.",
  },
  {
    id: 'flash',
    name: t('sidebar.flash'),
    icon: 'fas fa-bolt',
    path: '/admin/flash',
    description: 'Gérez votre catalogue de flashs tattoos.',
  },
  {
    id: 'gallery',
    name: t('sidebar.gallery'),
    icon: 'fas fa-images',
    path: '/admin/gallery',
    description: 'Gérez votre galerie et portfolio.',
  },
  {
    id: 'agenda',
    name: t('sidebar.bookings'),
    icon: 'fas fa-calendar-alt',
    path: '/admin/bookings',
    description: 'Suivez et gérez les demandes de réservation.',
  },
  {
    id: 'calendar',
    name: t('sidebar.calendar'),
    icon: 'fas fa-calendar-week',
    path: '/admin/calendar',
    description: 'Planifiez vos séances et événements.',
  },
  {
    id: 'messages',
    name: t('sidebar.messages'),
    icon: 'fas fa-envelope',
    path: '/admin/messages',
    description: 'Boîte de réception et demandes de contact.',
  },
  {
    id: 'blog',
    name: t('sidebar.blog'),
    icon: 'fas fa-newspaper',
    path: '/admin/blog',
    description: 'Rédigez et publiez des articles de blog.',
  },
  {
    id: 'promotions',
    name: 'Promotions',
    icon: 'fas fa-percent',
    path: '/admin/promotions',
    description: 'Créez des offres spéciales et réductions.',
  },
  {
    id: 'resources',
    name: 'Ressources',
    icon: 'fas fa-file-pdf',
    path: '/admin/resources',
    description: 'Gérez les documents téléchargeables (Soins, Décharges).',
  },
  {
    id: 'users',
    name: 'Gestion des tatoueurs',
    icon: 'fas fa-users',
    path: '/admin/users',
    description: 'Gérez les comptes et accès.',
  },
  {
    id: 'logs',
    name: 'Logs',
    icon: 'fas fa-list',
    path: '/admin/logs',
    description: 'Historique des actions importantes.',
  },
  {
    id: 'notes',
    name: 'Notes Pro',
    icon: 'fas fa-sticky-note',
    path: '/admin/notes',
    description: 'Vos notes et mémos personnels.',
  },
  {
    id: 'settings',
    name: t('sidebar.settings'),
    icon: 'fas fa-cog',
    path: '/admin/settings',
    description: 'Configuration générale du site.',
  },
  {
    id: 'profile',
    name: 'Mon Profil',
    icon: 'fas fa-user-circle',
    path: '/admin/profile',
    description: 'Gérez vos informations personnelles.',
  },
  {
    id: 'help',
    name: 'Aide & Règles',
    icon: 'fas fa-life-ring',
    path: '/admin/help',
    description: 'Documentation et support.',
  },
])

const currentTab = computed(() => {
  const currentPath = route.path
  // Handle sub-routes like blog editing
  if (currentPath.includes('/admin/blog/')) return tabs.value.find((t) => t.id === 'blog')

  return (
    tabs.value.find((t) => t.path === currentPath) || {
      name: t('sidebar.dashboard'),
      icon: 'fas fa-chart-line',
      description: '',
    }
  )
})

// Notifications Logic
const showNotifications = ref(false)
const showHistory = ref(false)
const showUserMenu = ref(false)
const notificationContainer = ref(null)
const historyContainer = ref(null)
const userMenuContainer = ref(null)

const unreadMessages = computed(() => messageStore.messages.filter((m) => !m.read))
const pendingBookings = computed(() => bookingStore.bookings.filter((b) => b.status === 'pending'))

const totalNotifications = computed(
  () => unreadMessages.value.length + pendingBookings.value.length,
)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showHistory.value = false
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
  showHistory.value = false
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const handleNotificationClick = (path, id) => {
  showNotifications.value = false
  router.push({ path, query: { highlight: id } })
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/admin/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const closeDropdowns = (e) => {
  if (
    showNotifications.value &&
    notificationContainer.value &&
    !notificationContainer.value.contains(e.target)
  ) {
    showNotifications.value = false
  }
  if (showHistory.value && historyContainer.value && !historyContainer.value.contains(e.target)) {
    showHistory.value = false
  }
  if (
    showUserMenu.value &&
    userMenuContainer.value &&
    !userMenuContainer.value.contains(e.target)
  ) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdowns)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
})
</script>

<template>
  <div class="min-h-screen bg-fuchsia-50 flex">
    <!-- Sidebar -->
    <div
      :class="{ 'w-64': sidebarExpanded, 'w-16': !sidebarExpanded }"
      class="bg-slate-900 shadow-lg transition-all duration-300 flex flex-col z-20"
    >
      <!-- Logo & Toggle -->
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <div v-show="sidebarExpanded" class="flex items-center space-x-2">
          <i class="fas fa-tint text-2xl text-purple-400"></i>
          <span class="font-bold text-xl text-white">Tattoo Admin</span>
        </div>
        <button
          @click="toggleSidebar"
          class="p-2 rounded-lg hover:bg-slate-800 cursor-pointer text-slate-400 hover:text-white"
        >
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <!-- Navigation -->
      <nav class="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul class="space-y-2">
          <li v-for="tab in tabs" :key="tab.id">
            <RouterLink
              :to="tab.path"
              :class="{
                'bg-slate-800 text-white shadow-md border-l-4 border-purple-500':
                  route.path === tab.path ||
                  (tab.id === 'blog' && route.path.includes('/admin/blog/')),
                'text-slate-400 hover:bg-slate-800 hover:text-white':
                  route.path !== tab.path &&
                  !(tab.id === 'blog' && route.path.includes('/admin/blog/')),
              }"
              class="w-full flex items-center p-3 rounded-r-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <i :class="tab.icon" class="text-lg w-6 text-center"></i>
              <span v-show="sidebarExpanded" class="ml-3 font-medium">{{ tab.name }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Global Header -->
      <header
        class="bg-white shadow-sm border-b border-purple-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 sticky top-0"
      >
        <!-- Title & Description -->
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl shadow-sm"
          >
            <i :class="currentTab.icon"></i>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">{{ currentTab.name }}</h1>
            <p v-if="currentTab.description" class="text-gray-500 text-sm">
              {{ currentTab.description }}
            </p>
          </div>
        </div>

        <!-- Actions & User -->
        <div class="flex items-center space-x-3">
          <!-- Toast History Dropdown -->
          <div class="relative" ref="historyContainer">
            <button
              @click="showHistory = !showHistory"
              class="p-2.5 rounded-xl hover:bg-gray-100 cursor-pointer relative group border border-transparent hover:border-gray-200 transition-all"
              title="Historique des actions"
            >
              <i
                class="fas fa-history text-gray-500 group-hover:text-purple-600 transition-colors"
              ></i>
            </button>
            <!-- History Panel (Same as before) -->
            <div
              v-if="showHistory"
              class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden animate-fade-in"
            >
              <div
                class="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50"
              >
                <span class="font-bold text-gray-800 text-sm">Historique</span>
                <button
                  @click="notificationStore.clearHistory()"
                  class="text-xs text-red-500 hover:text-red-700 font-medium"
                  v-if="notificationStore.history.length > 0"
                >
                  Effacer
                </button>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <div
                  v-if="notificationStore.history.length === 0"
                  class="px-4 py-8 text-center text-gray-500 text-sm italic"
                >
                  Aucune action récente
                </div>
                <div
                  v-for="item in notificationStore.history"
                  :key="item.id"
                  class="px-4 py-3 hover:bg-gray-50 border-b border-gray-50"
                >
                  <div class="flex gap-3">
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      :class="
                        item.type === 'success'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      "
                    >
                      <i
                        :class="item.type === 'success' ? 'fas fa-check' : 'fas fa-exclamation'"
                        class="text-[10px]"
                      ></i>
                    </div>
                    <div>
                      <div class="font-bold text-xs text-gray-800">{{ item.title }}</div>
                      <div class="text-[10px] text-gray-500">{{ item.message }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notifications Dropdown -->
          <div class="relative" ref="notificationContainer">
            <button
              @click="toggleNotifications"
              class="p-2.5 rounded-xl hover:bg-gray-100 cursor-pointer relative border border-transparent hover:border-gray-200 transition-all"
            >
              <i class="fas fa-bell text-gray-500 hover:text-purple-600"></i>
              <span
                v-if="totalNotifications > 0"
                class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"
              ></span>
            </button>
            <!-- Notifications Panel (Same logic) -->
            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in"
            >
              <div class="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                <span class="font-bold text-gray-800 text-sm">Notifications</span>
              </div>
              <div class="max-h-80 overflow-y-auto">
                <div
                  v-if="totalNotifications === 0"
                  class="px-4 py-8 text-center text-gray-500 text-sm"
                >
                  Rien à signaler
                </div>
                <div
                  v-if="unreadMessages.length > 0"
                  class="px-4 py-1 bg-gray-50 text-xs font-bold text-gray-500 uppercase mt-2"
                >
                  Messages
                </div>
                <div
                  v-for="msg in unreadMessages"
                  :key="'msg-' + msg.id"
                  @click="handleNotificationClick('/admin/messages', msg.id)"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                >
                  <div class="flex justify-between">
                    <span class="font-bold text-xs text-gray-800">{{ msg.from }}</span
                    ><span class="text-[10px] text-gray-400">{{ formatDate(msg.date) }}</span>
                  </div>
                  <div class="text-xs text-gray-500 truncate">{{ msg.subject }}</div>
                </div>
                <div
                  v-if="pendingBookings.length > 0"
                  class="px-4 py-1 bg-gray-50 text-xs font-bold text-gray-500 uppercase mt-2"
                >
                  Réservations
                </div>
                <div
                  v-for="book in pendingBookings"
                  :key="'book-' + book.id"
                  @click="handleNotificationClick('/admin/bookings', book.id)"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                >
                  <div class="flex justify-between">
                    <span class="font-bold text-xs text-gray-800">{{ book.client }}</span
                    ><span class="text-[10px] text-gray-400">{{ formatDate(book.date) }}</span>
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {{ book.project || book.tattoo }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="h-8 w-px bg-gray-200 mx-2"></div>

          <!-- User Menu -->
          <div class="relative" ref="userMenuContainer">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
            >
              <div
                class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs overflow-hidden"
              >
                <img
                  v-if="authStore.profile?.avatar_url"
                  :src="authStore.profile.avatar_url"
                  class="w-full h-full object-cover"
                />
                <img
                  v-else
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTMem0wIDE0LjJjLTIuNSAwLTQuNzEtMS4yOC02LTMuMjIuMDMtMS45OSA0LTMuMDggNi0zLjA4IDEuOTkgMCA1Ljk3IDEuMDkgNiAzLjA4LTEuMjktMS45NC0zLjUgMy4yMi02IDMuMjJ6Ii8+PC9zdmc+"
                  class="w-full h-full object-cover opacity-50"
                />
              </div>
              <div class="hidden md:block text-left">
                <div class="text-xs font-bold text-gray-800">
                  {{ authStore.profile?.full_name || 'Admin' }}
                </div>
                <div class="text-[10px] text-gray-500 leading-none">Administrateur</div>
              </div>
              <i class="fas fa-chevron-down text-gray-400 text-xs ml-1"></i>
            </button>

            <!-- User Dropdown -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in origin-top-right"
            >
              <RouterLink
                to="/admin/profile"
                @click="showUserMenu = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
              >
                <i class="fas fa-user-circle mr-2"></i> Mon Profil
              </RouterLink>
              <RouterLink
                to="/admin/settings"
                @click="showUserMenu = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
              >
                <i class="fas fa-cog mr-2"></i> Paramètres
              </RouterLink>
              <div class="border-t border-gray-100 my-1"></div>
              <button
                @click="handleLogout"
                class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <i class="fas fa-sign-out-alt mr-2"></i> Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <main class="flex-1 p-6 overflow-y-auto">
        <RouterView />
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes: [
    {
      path: '/',
      component: () => import('../layouts/ClientLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/client/HomeView.vue'),
          meta: { title: 'Accueil' }
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/client/AboutView.vue'),
          meta: { title: 'À Propos' }
        },
        {
          path: 'flash',
          name: 'flash',
          component: () => import('../views/client/FlashView.vue'),
          meta: { title: 'Flash Tattoos' }
        },
        {
          path: 'gallery',
          name: 'gallery',
          component: () => import('../views/client/GalleryView.vue'),
          meta: { title: 'Galerie' }
        },
        {
          path: 'booking',
          name: 'booking',
          component: () => import('../views/client/BookingView.vue'),
          meta: { title: 'Réservation' }
        },
        {
          path: 'contact',
          name: 'contact',
          component: () => import('../views/client/ContactView.vue'),
          meta: { title: 'Contact' }
        },
        {
          path: 'process',
          name: 'process',
          component: () => import('../views/client/ProcessView.vue'),
          meta: { title: 'Processus' }
        },
        {
          path: 'blog',
          name: 'blog',
          component: () => import('../views/client/BlogView.vue'),
          meta: { title: 'Blog' }
        },
        {
          path: 'blog/:id',
          name: 'article',
          component: () => import('../views/client/ArticleView.vue'),
          meta: { title: 'Article' }
        },
        {
          path: 'mentions-legales',
          name: 'legal-mentions',
          component: () => import('../views/client/LegalMentionsView.vue'),
          meta: { title: 'Mentions Légales' }
        },
        {
          path: 'cgv',
          name: 'terms',
          component: () => import('../views/client/TermsView.vue'),
          meta: { title: 'CGV' }
        },
        {
          path: 'confidentialite',
          name: 'privacy',
          component: () => import('../views/client/PrivacyView.vue'),
          meta: { title: 'Confidentialité' }
        },
        {
          path: 'soins',
          name: 'aftercare',
          component: () => import('../views/client/AftercareView.vue'),
          meta: { title: 'Soins Après-Séance' }
        },
        {
          path: 'search',
          name: 'search-results',
          component: () => import('../views/client/SearchResultsView.vue'),
          meta: { title: 'Recherche' }
        },
        {
          path: 'client/login',
          name: 'client-login',
          component: () => import('../views/client/ClientLogin.vue'),
          meta: { title: 'Connexion Client' }
        },
        {
          path: 'client/register',
          name: 'client-register',
          component: () => import('../views/client/ClientRegister.vue'),
          meta: { title: 'Inscription Client' }
        },
        {
          path: 'client/dashboard',
          name: 'client-dashboard',
          component: () => import('../views/client/ClientDashboard.vue'),
          meta: { title: 'Espace Client', requiresAuth: true } // Note: Auth guard might redirect to admin/login if generic. Need to handle.
        }
      ]
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/LoginView.vue'),
      meta: { title: 'Connexion Admin' }
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'admin-dashboard' }
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'Tableau de Bord' }
        },
        {
          path: 'banners',
          name: 'admin-banners',
          component: () => import('../views/admin/BannerManager.vue'),
          meta: { title: 'Bannières' }
        },
        {
          path: 'flash',
          name: 'admin-flash',
          component: () => import('../views/admin/FlashManager.vue'),
          meta: { title: 'Gestion Flash' }
        },
        {
          path: 'gallery',
          name: 'admin-gallery',
          component: () => import('../views/admin/GalleryManager.vue'),
          meta: { title: 'Gestion Galerie' }
        },
        {
          path: 'bookings',
          name: 'admin-bookings',
          component: () => import('../views/admin/BookingManager.vue'),
          meta: { title: 'Réservations' }
        },
        {
          path: 'calendar',
          name: 'admin-calendar',
          component: () => import('../views/admin/CalendarManager.vue'),
          meta: { title: 'Calendrier' }
        },
        {
          path: 'messages',
          name: 'admin-messages',
          component: () => import('../views/admin/MessageManager.vue'),
          meta: { title: 'Messages' }
        },
        {
          path: 'blog',
          name: 'admin-blog',
          component: () => import('../views/admin/BlogManager.vue'),
          meta: { title: 'Gestion Blog' }
        },
        {
          path: 'blog/new',
          name: 'admin-blog-new',
          component: () => import('../views/admin/BlogEditor.vue'),
          meta: { title: 'Nouvel Article' }
        },
        {
          path: 'blog/edit/:id',
          name: 'admin-blog-edit',
          component: () => import('../views/admin/BlogEditor.vue'),
          meta: { title: 'Modifier Article' }
        },
        {
          path: 'promotions',
          name: 'admin-promotions',
          component: () => import('../views/admin/PromoManager.vue'),
          meta: { title: 'Promotions' }
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUserManager.vue'),
          meta: { title: 'Gestion des tatoueurs', roles: ['admin'] }
        },
        {
          path: 'logs',
          name: 'admin-logs',
          component: () => import('../views/admin/LogViewer.vue'),
          meta: { title: 'Logs', roles: ['admin'] }
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('../views/admin/SettingsView.vue'),
          meta: { title: 'Paramètres' }
        },
        {
          path: 'resources',
          name: 'admin-resources',
          component: () => import('../views/admin/ResourcesManager.vue'),
          meta: { title: 'Ressources' }
        },
        {
          path: 'help',
          name: 'admin-help',
          component: () => import('../views/admin/AdminHelpView.vue'),
          meta: { title: 'Aide' }
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: () => import('../views/admin/ProfileView.vue'),
          meta: { title: 'Mon Profil' }
        },
        {
          path: 'notes',
          name: 'admin-notes',
          component: () => import('../views/admin/AdminNotesView.vue'),
          meta: { title: 'Notes' }
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for session to be restored from storage
  await authStore.waitInit()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated()) {
      return next('/admin/login')
    }

    // Role check
    if (to.meta.roles && to.meta.roles.length > 0) {
      const userRole = authStore.profile?.role || 'user'
      if (!to.meta.roles.includes(userRole)) {
        // Redirect to dashboard or unauthorized page
        // For now: Stay on dashboard or show error via notification (hard to do in guard)
        // Just redirect to dashboard
        if (from.path !== '/admin/dashboard') {
          return next('/admin/dashboard')
        }
        return next(false)
      }
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
    if (to.path.startsWith('/client')) {
      next('/client/login')
    } else {
      next('/admin/login')
    }
  } else if (to.path === '/admin/login' && authStore.isAuthenticated()) {
    next('/admin/dashboard')
  } else if (to.path === '/client/login' && authStore.isAuthenticated()) {
    next('/client/dashboard')
  } else {
    next()
  }
})

router.afterEach((to) => {
  const defaultSuffix = 'Vanely Tattoo - Tatouage Artistique Lyon et alentours'
  if (to.meta && to.meta.title) {
    document.title = `${to.meta.title} | ${defaultSuffix}`
  } else {
    document.title = defaultSuffix
  }
})

export default router

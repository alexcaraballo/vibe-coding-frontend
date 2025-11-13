import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/modules/trip/presentation/views/HomeView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/presentation/views/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/modules/auth/presentation/views/RegisterView.vue'),
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/trips/:id',
    name: 'trip-detail',
    component: () => import('@/modules/trip/presentation/views/TripDetailView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/trips/publish',
    name: 'publish-trip',
    component: () => import('@/modules/trip/presentation/views/PublishTripView.vue'),
    meta: { requiresAuth: true, requiresDriver: true }
  },
  {
    path: '/my-bookings',
    name: 'my-bookings',
    component: () => import('@/modules/booking/presentation/views/MyBookingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-trips',
    name: 'my-trips',
    component: () => import('@/modules/trip/presentation/views/MyTripsView.vue'),
    meta: { requiresAuth: true, requiresDriver: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/modules/auth/presentation/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/matching',
    name: 'matching',
    component: () => import('@/modules/matching/presentation/views/MatchingView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('access_token')
  const isAuthenticated = !!token

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Si la ruta es solo para invitados y el usuario está autenticado
  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // Si la ruta requiere ser conductor
  if (to.meta.requiresDriver && isAuthenticated) {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role !== 'driver' && user.role !== 'both') {
          next({ name: 'home' })
          return
        }
      } catch (err) {
        console.error('Error parsing user data:', err)
        next({ name: 'login' })
        return
      }
    }
  }

  next()
})

export default router

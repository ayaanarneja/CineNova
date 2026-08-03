import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { hideChrome: true, guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: { hideChrome: true, guestOnly: true }
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/Search.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/movie/:id',
    name: 'movie-details',
    component: () => import('@/views/MovieDetails.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/movie/:id/theatres',
    name: 'theatres',
    component: () => import('@/views/TheatreSelection.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/seats',
    name: 'seats',
    component: () => import('@/views/SeatSelection.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/food',
    name: 'food',
    component: () => import('@/views/FoodSelection.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'payment',
    component: () => import('@/views/Payment.vue'),
    meta: { requiresAuth: true, hideChrome: true }
  },
  {
    path: '/confirmation/:bookingId',
    name: 'confirmation',
    component: () => import('@/views/Confirmation.vue'),
    meta: { requiresAuth: true, hideChrome: true }
  },
  {
    path: '/ticket/:bookingId',
    name: 'ticket',
    component: () => import('@/views/Ticket.vue'),
    meta: { requiresAuth: true, hideChrome: true }
  },
  {
    path: '/my-bookings',
    name: 'my-bookings',
    component: () => import('@/views/MyBookings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: () => import('@/views/Wishlist.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/offers',
    name: 'offers',
    component: () => import('@/views/Offers.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('@/views/Notifications.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'home' }
  }

  if (to.meta.guestOnly && auth.isLoggedIn) {
    return { name: 'home' }
  }

  return true
})

export default router

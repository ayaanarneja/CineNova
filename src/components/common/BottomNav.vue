<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = [
  { label: 'Home', icon: 'mdi-home-variant', to: '/' },
  { label: 'Search', icon: 'mdi-magnify', to: '/search' },
  { label: 'Bookings', icon: 'mdi-ticket-confirmation', to: '/my-bookings' },
  { label: 'Offers', icon: 'mdi-tag-heart', to: '/offers' },
  { label: 'Profile', icon: 'mdi-account-circle', to: '/profile' }
]

const active = computed(() => route.path)
</script>

<template>
  <nav class="floating-nav px-2 py-2">
    <v-btn
      v-for="item in items"
      :key="item.to"
      variant="text"
      :color="active === item.to ? 'primary' : 'default'"
      class="nav-btn mx-1"
      stacked
      size="small"
      @click="router.push(item.to)"
    >
      <v-icon :class="{ 'nav-icon-active': active === item.to }">{{ item.icon }}</v-icon>
      <span class="nav-label">{{ item.label }}</span>
    </v-btn>
  </nav>
</template>

<style scoped>
.nav-btn {
  min-width: 56px;
  border-radius: 18px;
}
.nav-label {
  font-size: 10px;
  text-transform: none;
}
.nav-icon-active {
  filter: drop-shadow(0 0 6px var(--neon-purple));
}
</style>

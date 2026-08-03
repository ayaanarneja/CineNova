<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useThemeStore } from '@/stores/theme'
import { useTheatresStore } from '@/stores/theatres'
import { useLocationStore } from '@/stores/location'
import { onMounted, ref } from 'vue'

const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationsStore()
const themeStore = useThemeStore()
const theatres = useTheatresStore()
const location = useLocationStore()

const cityMenuOpen = ref(false)

onMounted(async () => {
  if (auth.user) notifications.fetchForUser(auth.user.id)
  await theatres.fetchAll()
  location.ensureDefault(theatres.cities)
})

function selectCity(city) {
  location.setCity(city)
  cityMenuOpen.value = false
}
</script>

<template>
  <v-app-bar flat color="transparent" class="appbar-glass" height="72">
    <v-container class="d-flex align-center py-0" fluid>
      <div class="d-flex align-center cursor-pointer" @click="router.push('/')">
        <v-img src="/brand/cinenova-emblem.png" width="38" height="38" class="mr-2 logo-mark" rounded="lg" />
        <span class="text-h6 gradient-text d-none d-sm-inline">CineNova</span>
      </div>

      <v-spacer />

      <!-- City Location Dropdown -->
      <v-menu
        v-model="cityMenuOpen"
        :close-on-content-click="false"
        offset="12"
        transition="scale-transition"
      >
        <template #activator="{ props: menuProps }">
          <button
            class="city-pill"
            v-bind="menuProps"
            type="button"
            :title="`Current city: ${location.selectedCity || 'Select city'}`"
          >
            <v-icon size="15" class="city-pill__icon">mdi-map-marker</v-icon>
            <span class="city-pill__text">{{ location.selectedCity || 'City' }}</span>
            <v-icon size="14" class="city-pill__chevron" :class="{ 'rotated': cityMenuOpen }">mdi-chevron-down</v-icon>
          </button>
        </template>

        <v-card class="city-dropdown glass-card" elevation="0" min-width="220">
          <div class="city-dropdown__header px-4 pt-3 pb-2">
            <div class="d-flex align-center gap-2">
              <v-icon size="16" color="secondary">mdi-map-marker-radius</v-icon>
              <span class="text-caption font-weight-bold text-uppercase" style="letter-spacing:1px">Choose City</span>
            </div>
          </div>
          <v-divider class="mb-1" style="border-color: var(--glass-border)" />
          <div class="city-list pa-2">
            <button
              v-for="city in theatres.cities"
              :key="city"
              class="city-item"
              :class="{ 'city-item--active': city === location.selectedCity }"
              type="button"
              @click="selectCity(city)"
            >
              <v-icon size="16" :color="city === location.selectedCity ? 'secondary' : undefined">
                mdi-city-variant-outline
              </v-icon>
              <span class="city-item__name">{{ city }}</span>
              <v-icon v-if="city === location.selectedCity" size="14" color="secondary" class="ml-auto">
                mdi-check-circle
              </v-icon>
            </button>
          </div>
        </v-card>
      </v-menu>

      <!-- Search bar (desktop) -->
      <v-text-field
        density="compact"
        variant="solo"
        rounded="xl"
        hide-details
        placeholder="Search movies, theatres..."
        prepend-inner-icon="mdi-magnify"
        class="d-none d-md-flex mx-3 search-field"
        style="max-width: 340px"
        readonly
        @click="router.push('/search')"
      />

      <v-btn
        icon
        variant="text"
        class="theme-toggle-btn"
        :title="themeStore.isLight ? 'Switch to dark mode' : 'Switch to light mode'"
        @click="themeStore.toggle()"
      >
        <v-icon>{{ themeStore.isLight ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
      </v-btn>

      <v-btn icon variant="text" @click="router.push('/notifications')">
        <v-badge :content="notifications.unreadCount" :model-value="notifications.unreadCount > 0" color="secondary">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>

      <v-btn icon variant="text" class="d-none d-sm-flex" @click="router.push('/wishlist')">
        <v-icon>mdi-heart-outline</v-icon>
      </v-btn>

      <v-btn
        v-if="auth.isAdmin"
        icon
        variant="text"
        class="d-none d-sm-flex"
        title="Admin Dashboard"
        @click="router.push('/admin')"
      >
        <v-icon>mdi-view-dashboard-outline</v-icon>
      </v-btn>

      <v-avatar size="36" class="ml-2 cursor-pointer neon-border initials-avatar" @click="router.push('/profile')">
        <span class="initials-text">{{ auth.initials }}</span>
      </v-avatar>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.logo-mark {
  filter: drop-shadow(0 0 6px rgba(177,92,255,0.5));
}
.appbar-glass {
  background: var(--navbar-bg) !important;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--glass-border);
  transition: background .3s ease, border-color .3s ease;
}

/* City pill */
.city-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px 6px 10px;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  transition: border-color .2s ease, background .2s ease, transform .2s ease, box-shadow .2s ease;
  margin-right: 6px;
  flex-shrink: 0;
}
.city-pill:hover {
  border-color: rgba(177,92,255,0.5);
  background: var(--glass-bg-strong);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(177,92,255,0.18);
}
.city-pill__icon {
  color: var(--neon-purple, #B15CFF);
  flex-shrink: 0;
}
.city-pill__text {
  font-size: 0.8rem;
  font-weight: 600;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.city-pill__chevron {
  opacity: 0.55;
  transition: transform .2s ease;
  flex-shrink: 0;
}
.city-pill__chevron.rotated {
  transform: rotate(180deg);
}

/* Dropdown card */
.city-dropdown {
  border-radius: 18px !important;
  overflow: hidden;
  background: var(--glass-bg-strong) !important;
  border: 1px solid var(--glass-border) !important;
  backdrop-filter: blur(24px) saturate(180%);
}
.city-dropdown__header {
  opacity: 0.65;
}
.city-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.city-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}
.city-item:hover {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  transform: translateX(2px);
}
.city-item--active {
  border-color: rgba(177,92,255,0.45);
  background: rgba(177,92,255,0.1);
}
.city-item__name {
  flex: 1;
}

.search-field :deep(.v-field) {
  background: var(--glass-bg);
  border-radius: 20px;
  transition: background .25s ease, box-shadow .25s ease;
}
.search-field:hover :deep(.v-field) {
  background: var(--glass-bg-strong);
  box-shadow: 0 0 0 1px rgba(177,92,255,0.3);
}
.theme-toggle-btn {
  transition: transform .3s var(--ease-smooth);
}
.theme-toggle-btn:hover {
  transform: rotate(18deg);
}
.initials-avatar {
  background: linear-gradient(135deg, #FF4D6D, #8B5CF6);
  transition: transform .25s ease, box-shadow .25s ease;
}
.initials-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 0 16px rgba(177,92,255,0.5);
}
.initials-text {
  color: white;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.5px;
}
</style>

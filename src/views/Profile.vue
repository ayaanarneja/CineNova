<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const editing = ref(false)
const name = ref(auth.user.name)
const phone = ref(auth.user.phone)
const city = ref(auth.user.city)
const saving = ref(false)

const menuItems = [
  { label: 'My Bookings', icon: 'mdi-ticket-confirmation', to: '/my-bookings' },
  { label: 'Wishlist', icon: 'mdi-heart-outline', to: '/wishlist' },
  { label: 'Offers', icon: 'mdi-tag-heart', to: '/offers' },
  { label: 'Notifications', icon: 'mdi-bell-outline', to: '/notifications' }
]

async function save() {
  saving.value = true
  try {
    await auth.updateProfile({ name: name.value, phone: phone.value, city: city.value })
    toast.success('Profile updated')
    editing.value = false
  } catch {
    toast.error('Failed to update profile')
  } finally {
    saving.value = false
  }
}

function logout() {
  auth.logout()
  toast.info('Logged out successfully')
  router.push('/login')
}
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4" style="max-width: 640px; margin: 0 auto;">
    <v-card class="glass-card pa-6 mb-6 text-center" elevation="0">
      <v-avatar size="96" class="mb-3 neon-border initials-avatar-lg">
        <span class="initials-text-lg">{{ auth.initials }}</span>
      </v-avatar>
      <h2 class="text-h6 font-weight-bold">{{ auth.user.name }}</h2>
      <p class="text-caption text-medium-emphasis">{{ auth.user.email }}</p>
    </v-card>

    <v-card class="glass-card pa-4 mb-6" elevation="0">
      <div class="d-flex justify-space-between align-center mb-3">
        <span class="text-subtitle-1 font-weight-bold">Personal Info</span>
        <v-btn size="small" variant="text" color="primary" @click="editing = !editing">
          {{ editing ? 'Cancel' : 'Edit' }}
        </v-btn>
      </div>

      <template v-if="editing">
        <v-text-field v-model="name" label="Full Name" class="mb-2" />
        <v-text-field v-model="phone" label="Phone" class="mb-2" />
        <v-text-field v-model="city" label="City" class="mb-2" />
        <v-btn block class="neon-btn" :loading="saving" @click="save">Save Changes</v-btn>
      </template>
      <template v-else>
        <div class="info-row"><v-icon size="18" class="mr-2">mdi-phone-outline</v-icon>{{ auth.user.phone || 'Not added' }}</div>
        <div class="info-row"><v-icon size="18" class="mr-2">mdi-map-marker-outline</v-icon>{{ auth.user.city }}</div>
        <div class="info-row"><v-icon size="18" class="mr-2">mdi-calendar-outline</v-icon>Member since {{ new Date(auth.user.createdAt).toLocaleDateString() }}</div>
      </template>
    </v-card>

    <v-card class="glass-card pa-2 mb-6" elevation="0">
      <v-list bg-color="transparent">
        <v-list-item
          v-for="item in menuItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.label"
          rounded="lg"
          @click="router.push(item.to)"
        >
          <template #append><v-icon size="18">mdi-chevron-right</v-icon></template>
        </v-list-item>
      </v-list>
    </v-card>

    <v-btn block variant="outlined" color="error" prepend-icon="mdi-logout" @click="logout">
      Logout
    </v-btn>
  </v-container>
</template>

<style scoped>
.info-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: var(--text-primary);
  font-size: 14px;
}
.initials-avatar-lg {
  background: linear-gradient(135deg, #FF4D6D, #8B5CF6);
}
.initials-text-lg {
  color: white;
  font-weight: 700;
  font-size: 34px;
  letter-spacing: 1px;
}
</style>

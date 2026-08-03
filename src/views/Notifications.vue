<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { formatDateTime } from '@/utils/date'

const auth = useAuthStore()
const notifications = useNotificationsStore()

onMounted(() => {
  notifications.fetchForUser(auth.user.id)
})

const iconFor = (type) => ({
  booking: 'mdi-ticket-confirmation',
  offer: 'mdi-tag-heart',
  reminder: 'mdi-bell-ring'
}[type] || 'mdi-information')

const colorFor = (type) => ({
  booking: 'success',
  offer: 'secondary',
  reminder: 'warning'
}[type] || 'primary')
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-bold">Notifications</h2>
      <v-btn v-if="notifications.unreadCount" size="small" variant="text" color="primary" @click="notifications.markAllRead">
        Mark all read
      </v-btn>
    </div>

    <div v-if="notifications.loading">
      <div v-for="n in 4" :key="n" class="skeleton mb-3" style="height: 80px; border-radius: 16px;"></div>
    </div>

    <div v-else-if="!notifications.items.length" class="empty-state">
      <v-icon size="56" color="grey-darken-1">mdi-bell-off-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-3">No notifications yet</p>
    </div>

    <v-card
      v-for="n in notifications.items"
      :key="n.id"
      class="glass-card pa-4 mb-3 d-flex align-start"
      :class="{ 'notif-unread': !n.read }"
      elevation="0"
      @click="notifications.markRead(n.id)"
    >
      <v-avatar :color="colorFor(n.type)" variant="tonal" class="mr-3">
        <v-icon :color="colorFor(n.type)">{{ iconFor(n.type) }}</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <div class="d-flex justify-space-between">
          <span class="text-body-2 font-weight-bold">{{ n.title }}</span>
          <span v-if="!n.read" class="unread-dot"></span>
        </div>
        <p class="text-caption text-medium-emphasis mb-1">{{ n.message }}</p>
        <span class="text-caption text-disabled">{{ formatDateTime(n.createdAt) }}</span>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 0;
}
.notif-unread {
  border-color: rgba(177,92,255,0.4) !important;
}
.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon-pink);
  box-shadow: 0 0 8px var(--neon-pink);
}
</style>

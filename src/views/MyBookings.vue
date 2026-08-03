<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'
import { useToastStore } from '@/stores/toast'
import { formatINR } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { useBrokenImages } from '@/composables/useImageFallback'

const router = useRouter()
const auth = useAuthStore()
const bookings = useBookingsStore()
const toast = useToastStore()
const { resolve: resolvePoster, markBroken: markPosterBroken } = useBrokenImages()

const tab = ref('upcoming')

onMounted(() => {
  bookings.fetchForUser(auth.user.id)
})

function retry() {
  bookings.fetchForUser(auth.user.id)
}

async function cancel(id) {
  try {
    await bookings.cancelBooking(id)
    toast.info('Booking cancelled')
  } catch (err) {
    toast.error(err.message || 'Could not cancel booking. Please try again.')
  }
}
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <h2 class="text-h5 font-weight-bold mb-4">My Bookings</h2>

    <v-tabs v-model="tab" color="primary" class="mb-4">
      <v-tab value="upcoming">Upcoming</v-tab>
      <v-tab value="completed">Completed</v-tab>
      <v-tab value="cancelled">Cancelled</v-tab>
    </v-tabs>

    <div v-if="bookings.loading">
      <div v-for="n in 3" :key="n" class="skeleton mb-4" style="height: 120px; border-radius: 20px;"></div>
    </div>

    <div v-else-if="bookings.error" class="empty-state">
      <v-icon size="56" color="error">mdi-alert-circle-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-3">{{ bookings.error }}</p>
      <v-btn class="neon-btn mt-3" @click="retry">Try Again</v-btn>
    </div>

    <v-window v-model="tab" v-else>
      <v-window-item value="upcoming">
        <div v-if="!bookings.upcoming.length" class="empty-state">
          <v-icon size="56" color="grey-darken-1">mdi-ticket-outline</v-icon>
          <p class="text-body-1 text-medium-emphasis mt-3">No upcoming bookings</p>
          <v-btn class="neon-btn mt-3" @click="router.push('/')">Browse Movies</v-btn>
        </div>
        <v-card v-for="b in bookings.upcoming" :key="b.id" class="glass-card pa-4 mb-4" elevation="0">
          <div class="d-flex ga-3">
            <v-img :src="resolvePoster(b.id, b.movie.poster)" width="72" rounded="lg" aspect-ratio="2/3" cover @error="markPosterBroken(b.id)" />
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between">
                <div class="text-subtitle-1 font-weight-bold">{{ b.movie.title }}</div>
                <v-chip size="x-small" color="success" variant="tonal">UPCOMING</v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">{{ b.theatre.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatDate(b.date) }} • {{ b.showtime.time }} • {{ b.seats.map(s => s.id).join(', ') }}</div>
              <div class="d-flex justify-space-between align-center mt-3">
                <span class="font-weight-bold text-primary">{{ formatINR(b.pricing.total) }}</span>
                <div class="d-flex ga-2">
                  <v-btn size="small" variant="outlined" color="error" @click="cancel(b.id)">Cancel</v-btn>
                  <v-btn size="small" variant="tonal" color="primary" @click="router.push(`/ticket/${b.id}`)">View Ticket</v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-window-item>

      <v-window-item value="completed">
        <div v-if="!bookings.completed.length" class="empty-state">
          <v-icon size="56" color="grey-darken-1">mdi-check-circle-outline</v-icon>
          <p class="text-body-1 text-medium-emphasis mt-3">No completed bookings yet</p>
        </div>
        <v-card v-for="b in bookings.completed" :key="b.id" class="glass-card pa-4 mb-4" elevation="0">
          <div class="d-flex ga-3">
            <v-img :src="resolvePoster(b.id, b.movie.poster)" width="72" rounded="lg" aspect-ratio="2/3" cover @error="markPosterBroken(b.id)" />
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between">
                <div class="text-subtitle-1 font-weight-bold">{{ b.movie.title }}</div>
                <v-chip size="x-small" color="grey" variant="tonal">SHOW CROSSED</v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">{{ formatDate(b.date) }} • {{ b.showtime.time }} • {{ b.theatre.name }}</div>
              <div class="d-flex justify-space-between align-center mt-3">
                <span class="font-weight-bold text-primary">{{ formatINR(b.pricing.total) }}</span>
                <v-btn size="small" variant="tonal" color="primary" @click="router.push(`/ticket/${b.id}`)">View Ticket</v-btn>
              </div>
            </div>
          </div>
        </v-card>
      </v-window-item>

      <v-window-item value="cancelled">
        <div v-if="!bookings.cancelled.length" class="empty-state">
          <v-icon size="56" color="grey-darken-1">mdi-cancel</v-icon>
          <p class="text-body-1 text-medium-emphasis mt-3">No cancelled bookings</p>
        </div>
        <v-card v-for="b in bookings.cancelled" :key="b.id" class="glass-card pa-4 mb-4" elevation="0">
          <div class="d-flex ga-3">
            <v-img :src="resolvePoster(b.id, b.movie.poster)" width="72" rounded="lg" aspect-ratio="2/3" cover style="opacity: 0.5" @error="markPosterBroken(b.id)" />
            <div>
              <div class="text-subtitle-1 font-weight-bold text-decoration-line-through">{{ b.movie.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatDate(b.date) }} • {{ b.theatre.name }}</div>
              <v-chip size="x-small" color="error" variant="tonal">CANCELLED</v-chip>
            </div>
          </div>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 0;
}
</style>

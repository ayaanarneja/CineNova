<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { formatINR } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { useBookingFlowGuard } from '@/composables/useBookingFlowGuard'
import SeatMap from '@/components/seat/SeatMap.vue'

const router = useRouter()
const toast = useToastStore()
const { booking } = useBookingFlowGuard()

const seatSummary = computed(() => booking.selectedSeats.map((s) => s.id).join(', '))

function proceed() {
  if (!booking.selectedSeats.length) {
    toast.warning('Please select at least one seat')
    return
  }
  router.push('/food')
}
</script>

<template>
  <v-container fluid class="px-3 px-md-8 pt-4 pb-32" v-if="booking.movie">
    <div class="d-flex align-center mb-2">
      <v-btn icon variant="text" aria-label="Go back" @click="router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <div class="ml-2">
        <h2 class="text-h6 font-weight-bold">{{ booking.movie.title }}</h2>
        <div class="text-caption text-medium-emphasis">
          {{ booking.theatre.name }} • {{ formatDate(booking.date) }} • {{ booking.showtime.time }}
        </div>
      </div>
    </div>

    <SeatMap />

    <v-card class="glass-card pa-4 mt-6 summary-bar" elevation="0">
      <div class="d-flex justify-space-between align-center flex-wrap ga-3">
        <div>
          <div class="text-caption text-medium-emphasis">{{ booking.selectedSeats.length }} seat(s) selected</div>
          <div class="text-body-2 font-weight-medium">{{ seatSummary || 'No seats selected yet' }}</div>
        </div>
        <div class="d-flex align-center ga-4">
          <div class="text-h6 font-weight-bold">{{ formatINR(booking.seatSubtotal) }}</div>
          <v-btn class="neon-btn" size="large" :disabled="!booking.selectedSeats.length" @click="proceed">
            Continue
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.summary-bar {
  position: sticky;
  bottom: 90px;
}
</style>

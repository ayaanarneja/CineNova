<script setup>
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { SEAT_CATEGORIES } from '@/utils/seatLayout'

const booking = useBookingStore()

const selectedIds = computed(() => new Set(booking.selectedSeats.map((s) => s.id)))

function seatClass(seat) {
  return [
    'seat',
    `seat--${seat.category}`,
    seat.status === 'booked' ? 'seat--booked' : 'seat--available',
    selectedIds.value.has(seat.id) ? 'seat--selected' : ''
  ]
}

function handleClick(seat) {
  booking.toggleSeat(seat)
}
</script>

<template>
  <div class="seat-map-wrap">
    <div class="screen-curve mb-8">
      <div class="screen-glow"></div>
      <div class="text-caption text-medium-emphasis text-center mt-2 letter-spacing">ALL EYES THIS WAY</div>
    </div>

    <div v-for="group in booking.seatMap" :key="group.row" class="seat-row mb-2">
      <span class="row-label">{{ group.row }}</span>
      <div class="seats-inline">
        <div
          v-for="(seat, idx) in group.seats"
          :key="seat.id"
          :class="seatClass(seat)"
          :style="idx === 5 ? 'margin-right: 18px' : ''"
          @click="handleClick(seat)"
        >
          {{ seat.number }}
        </div>
      </div>
      <span class="row-label">{{ group.row }}</span>
    </div>

    <div class="d-flex flex-wrap justify-center ga-4 mt-6">
      <div v-for="cat in SEAT_CATEGORIES" :key="cat.key" class="legend-item">
        <span class="legend-dot" :style="{ background: cat.color }"></span>
        <span class="text-caption">{{ cat.label }} ₹{{ cat.price }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot" style="background: var(--glass-border)"></span>
        <span class="text-caption">Booked</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.seat-map-wrap {
  overflow-x: auto;
  padding: 8px;
}
.screen-curve {
  width: min(100%, 640px);
  margin: 0 auto;
}
.screen-glow {
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(90deg, transparent, var(--neon-purple), var(--neon-pink), transparent);
  box-shadow: 0 12px 40px rgba(177,92,255,0.5);
}
.letter-spacing {
  letter-spacing: 3px;
}
.seat-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.row-label {
  width: 18px;
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
}
.seats-inline {
  display: flex;
  gap: 6px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  display: inline-block;
}
</style>

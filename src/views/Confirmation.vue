<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import bookingService from '@/services/bookingService'
import { useBookingStore } from '@/stores/booking'
import { isValidBooking } from '@/utils/bookingStatus'
import { formatINR } from '@/utils/currency'
import { formatDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()
const bookingData = ref(null)
const loading = ref(true)
const error = ref(null)
const checkRef = ref(null)
const qrCanvas = ref(null)
const barcodeSvg = ref(null)

onMounted(async () => {
  try {
    // The ticket was just generated during payment, so it's already sitting
    // in the store — use it instantly instead of round-tripping to the
    // server again. Falls back to a fetch (e.g. on a hard refresh of this
    // exact URL) so the confirmation page always still works.
    if (booking.lastBooking?.id === route.params.bookingId) {
      bookingData.value = booking.lastBooking
    } else {
      const { data } = await bookingService.getById(route.params.bookingId)
      bookingData.value = data
    }
    if (!isValidBooking(bookingData.value)) {
      throw new Error('This booking could not be found.')
    }
  } catch (err) {
    error.value = err.message || 'This booking could not be found.'
  } finally {
    loading.value = false
  }

  // The <canvas>/<svg> for the QR + barcode only exist in the DOM once
  // `loading` flips to false and the template re-renders — wait a tick for
  // that before drawing into them, otherwise the refs are still null and
  // the codes silently never render (just an empty white box).
  if (bookingData.value) {
    await nextTick()
    playCheckAnimation()
    await renderCodes()
  }
})

function playCheckAnimation() {
  requestAnimationFrame(() => {
    if (!checkRef.value) return
    gsap.fromTo(checkRef.value, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' })
  })
}

// Same codes shown on the full Ticket page — rendered here too so the
// confirmation screen already reads as a real digital ticket, not just a
// receipt, before the user even taps through to /ticket/:id.
async function renderCodes() {
  if (!bookingData.value || !qrCanvas.value || !barcodeSvg.value) return
  await QRCode.toCanvas(qrCanvas.value, bookingData.value.qrPayload || bookingData.value.id, {
    width: 132,
    margin: 1,
    color: { dark: '#0F0826', light: '#FFFFFF' }
  })
  JsBarcode(barcodeSvg.value, bookingData.value.id, {
    format: 'CODE128',
    lineColor: '#F2ECFF',
    background: 'transparent',
    width: 2,
    height: 42,
    displayValue: true,
    fontSize: 11
  })
}
</script>

<template>
  <div class="confirm-page d-flex align-center justify-center">
    <v-card v-if="!loading && bookingData" class="glass-card pa-8 confirm-card text-center" elevation="0">
      <div ref="checkRef" class="check-circle mb-4">
        <v-icon size="52" color="white">mdi-check-bold</v-icon>
      </div>
      <h1 class="text-h5 font-weight-bold mb-1">Booking Confirmed!</h1>
      <p class="text-body-2 text-medium-emphasis mb-6">Your tickets for {{ bookingData.movie.title }} are ready</p>

      <v-card class="pa-4 mb-4" color="surface-bright" elevation="0" rounded="lg">
        <div class="d-flex justify-space-between text-body-2 mb-2">
          <span class="text-medium-emphasis">Theatre</span>
          <span class="font-weight-medium">{{ bookingData.theatre.name }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2 mb-2">
          <span class="text-medium-emphasis">Date & Time</span>
          <span class="font-weight-medium">{{ formatDate(bookingData.date) }}, {{ bookingData.showtime.time }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2 mb-2">
          <span class="text-medium-emphasis">Seats</span>
          <span class="font-weight-medium">{{ bookingData.seats.map(s => s.id).join(', ') }}</span>
        </div>
        <div class="d-flex justify-space-between text-body-2">
          <span class="text-medium-emphasis">Amount Paid</span>
          <span class="font-weight-bold text-primary">{{ formatINR(bookingData.pricing.total) }}</span>
        </div>
      </v-card>

      <div class="ticket-divider ticket-perforation"></div>

      <div class="ticket-codes my-4">
        <canvas ref="qrCanvas" role="img" aria-label="Ticket QR code"></canvas>
        <svg ref="barcodeSvg" class="mt-2" role="img" aria-label="Ticket barcode"></svg>
        <div class="text-caption text-medium-emphasis mt-1">Booking ID: {{ bookingData.id }}</div>
      </div>

      <div class="ticket-divider ticket-perforation"></div>

      <v-btn block size="large" class="neon-btn mt-2 mb-3" prepend-icon="mdi-ticket-confirmation" @click="router.push(`/ticket/${bookingData.id}`)">
        View Digital Ticket
      </v-btn>
      <v-btn block variant="outlined" @click="router.push('/')">Back to Home</v-btn>
    </v-card>

    <v-card v-else-if="!loading && error" class="glass-card pa-8 confirm-card text-center" elevation="0">
      <v-icon size="52" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h1 class="text-h6 font-weight-bold mb-2">Something went wrong</h1>
      <p class="text-body-2 text-medium-emphasis mb-6">{{ error }}</p>
      <v-btn block class="neon-btn mb-3" @click="router.push('/my-bookings')">Go to My Bookings</v-btn>
      <v-btn block variant="outlined" @click="router.push('/')">Back to Home</v-btn>
    </v-card>

    <div v-else class="text-center">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>
  </div>
</template>

<style scoped>
.confirm-page {
  min-height: 100vh;
  padding: 24px;
}
.confirm-card {
  width: 100%;
  max-width: 440px;
}
.check-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 0 40px rgba(177,92,255,0.6);
}
.ticket-divider {
  border-top: 2px dashed var(--glass-border);
  margin: 4px 0;
}
.ticket-codes {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ticket-codes canvas {
  border-radius: 12px;
  background: #fff;
  padding: 8px;
}
</style>

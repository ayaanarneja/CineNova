<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import QRCode from 'qrcode'
import JsBarcode from 'jsbarcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import bookingService from '@/services/bookingService'
import { useBookingStore } from '@/stores/booking'
import { formatINR } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { deriveBookingStatus, isValidBooking } from '@/utils/bookingStatus'
import { useToastStore } from '@/stores/toast'
import { useBrokenImages } from '@/composables/useImageFallback'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const booking = useBookingStore()
const { resolve: resolvePoster, markBroken: markPosterBroken } = useBrokenImages()

const bookingData = ref(null)
const loading = ref(true)
const error = ref(null)
const downloading = ref(false)
const qrCanvas = ref(null)
const barcodeSvg = ref(null)
const ticketRef = ref(null)

// The ticket lifecycle is derived live, never from the raw stored field, so
// a ticket for a show that has since crossed always reads "Show Crossed"
// here instead of staying stuck on "UPCOMING" forever.
const statusMeta = computed(() => {
  const status = deriveBookingStatus(bookingData.value)
  return {
    upcoming: { label: 'UPCOMING', color: 'success' },
    completed: { label: 'SHOW CROSSED', color: 'grey' },
    cancelled: { label: 'CANCELLED', color: 'error' },
    unknown: { label: 'UNKNOWN', color: 'grey' }
  }[status]
})

onMounted(async () => {
  try {
    // Right after payment the ticket was just generated and is already
    // sitting in the booking store — use it instantly. Falls back to a
    // fetch for every other case (opened from My Bookings, refresh, a
    // shared link, etc.) so the ticket always still loads.
    if (booking.lastBooking?.id === route.params.bookingId) {
      bookingData.value = booking.lastBooking
    } else {
      const { data } = await bookingService.getById(route.params.bookingId)
      bookingData.value = data
    }
    if (!isValidBooking(bookingData.value)) {
      throw new Error('This ticket could not be found.')
    }
  } catch (err) {
    error.value = err.message || 'This ticket could not be found.'
  } finally {
    loading.value = false
  }

  // Only once `loading` flips to false does the template actually mount
  // the <canvas>/<svg> for the QR + barcode — wait a tick for that DOM to
  // exist before trying to draw into it, otherwise the refs are still null
  // and the codes silently never render.
  if (bookingData.value) {
    await nextTick()
    await renderCodes()
  }
})

async function renderCodes() {
  if (!bookingData.value || !qrCanvas.value || !barcodeSvg.value) return
  await QRCode.toCanvas(qrCanvas.value, bookingData.value.qrPayload || bookingData.value.id, {
    width: 150,
    margin: 1,
    color: { dark: '#0F0826', light: '#FFFFFF' }
  })
  JsBarcode(barcodeSvg.value, bookingData.value.id, {
    format: 'CODE128',
    lineColor: '#F2ECFF',
    background: 'transparent',
    width: 2,
    height: 50,
    displayValue: true,
    fontSize: 12
  })
}

async function downloadPdf() {
  downloading.value = true
  try {
    const canvas = await html2canvas(ticketRef.value, { backgroundColor: '#0F0826', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
    pdf.save(`CineNova-Ticket-${bookingData.value.id}.pdf`)
    toast.success('Ticket downloaded successfully')
  } catch (err) {
    toast.error('Could not generate PDF')
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="ticket-page">
    <div class="d-flex align-center mb-4">
      <v-btn icon variant="text" aria-label="Back to My Bookings" @click="router.push('/my-bookings')"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <h2 class="text-h6 font-weight-bold ml-2">Digital Ticket</h2>
    </div>

    <div v-if="loading" class="skeleton-wrap">
      <div class="skeleton" style="height: 420px; border-radius: 24px;"></div>
    </div>

    <div v-else-if="error" class="empty-state text-center py-12">
      <v-icon size="56" color="error">mdi-ticket-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-3">{{ error }}</p>
      <v-btn class="neon-btn mt-4" @click="router.push('/my-bookings')">Back to My Bookings</v-btn>
    </div>

    <div v-else-if="bookingData" class="ticket-wrap">
      <div ref="ticketRef" class="ticket glass-card">
        <div class="ticket-header">
          <v-img
            :src="resolvePoster('ticket', bookingData.movie.poster)"
            width="72"
            rounded="lg"
            aspect-ratio="2/3"
            cover
            @error="markPosterBroken('ticket')"
          />
          <div class="ml-3">
            <div class="text-subtitle-1 font-weight-bold">{{ bookingData.movie.title }}</div>
            <div class="text-caption text-medium-emphasis">{{ bookingData.showtime.format }} • {{ bookingData.movie.censor }} • {{ bookingData.movie.duration }} min</div>
            <v-chip size="x-small" :color="statusMeta.color" variant="tonal" class="mt-1">{{ statusMeta.label }}</v-chip>
          </div>
        </div>

        <div class="ticket-divider ticket-perforation"></div>

        <div class="ticket-details">
          <div class="detail-row">
            <div><div class="text-caption text-medium-emphasis">Theatre</div><div class="font-weight-medium">{{ bookingData.theatre.name }}</div></div>
          </div>
          <div class="detail-row-2">
            <div><div class="text-caption text-medium-emphasis">Date</div><div class="font-weight-medium">{{ formatDate(bookingData.date) }}</div></div>
            <div><div class="text-caption text-medium-emphasis">Time</div><div class="font-weight-medium">{{ bookingData.showtime.time }}</div></div>
          </div>
          <div class="detail-row-2">
            <div><div class="text-caption text-medium-emphasis">Screen</div><div class="font-weight-medium">{{ bookingData.showtime.screen }}</div></div>
            <div><div class="text-caption text-medium-emphasis">Seats</div><div class="font-weight-medium">{{ bookingData.seats.map(s => s.id).join(', ') }}</div></div>
          </div>
          <div class="detail-row">
            <div><div class="text-caption text-medium-emphasis">Amount Paid</div><div class="font-weight-bold text-primary">{{ formatINR(bookingData.pricing.total) }}</div></div>
          </div>
        </div>

        <div class="ticket-divider ticket-perforation"></div>

        <div class="ticket-codes">
          <canvas ref="qrCanvas" role="img" aria-label="Ticket QR code"></canvas>
          <svg ref="barcodeSvg" class="mt-2" role="img" aria-label="Ticket barcode"></svg>
          <div class="text-caption text-medium-emphasis mt-1">Booking ID: {{ bookingData.id }}</div>
        </div>
      </div>

      <v-btn block size="large" class="neon-btn mt-6" :loading="downloading" prepend-icon="mdi-download" @click="downloadPdf">
        Download Ticket as PDF
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.ticket-page {
  padding: 24px;
  max-width: 480px;
  margin: 0 auto;
}
.ticket {
  padding: 24px;
  position: relative;
  animation: ticketReveal 0.5s var(--ease-smooth);
}
@keyframes ticketReveal {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.ticket-header {
  display: flex;
  align-items: center;
}
.ticket-divider {
  border-top: 2px dashed var(--glass-border);
  margin: 20px 0;
}
.ticket-details {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.detail-row-2 {
  display: flex;
  justify-content: space-between;
  gap: 12px;
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

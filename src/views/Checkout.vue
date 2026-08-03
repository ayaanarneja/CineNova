<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { formatINR } from '@/utils/currency'
import { formatDate } from '@/utils/date'
import { useBrokenImages } from '@/composables/useImageFallback'
import { useBookingFlowGuard } from '@/composables/useBookingFlowGuard'

const router = useRouter()
const toast = useToastStore()
const { resolve: resolvePoster, markBroken: markPosterBroken } = useBrokenImages()
const { booking } = useBookingFlowGuard()

const offerCode = ref('')
const applying = ref(false)

async function applyOffer() {
  if (!offerCode.value) return
  applying.value = true
  try {
    await booking.applyOfferCode(offerCode.value)
    toast.success('Offer applied successfully!')
  } catch (err) {
    toast.error(err.message)
  } finally {
    applying.value = false
  }
}

function removeOffer() {
  booking.removeOffer()
  offerCode.value = ''
}

function proceed() {
  router.push('/payment')
}
</script>

<template>
  <v-container fluid class="px-3 px-md-8 pt-4 pb-32" v-if="booking.movie">
    <div class="d-flex align-center mb-4">
      <v-btn icon variant="text" aria-label="Go back" @click="router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <h2 class="text-h6 font-weight-bold ml-2">Checkout</h2>
    </div>

    <v-row>
      <v-col cols="12" md="7">
        <v-card class="glass-card pa-4 mb-4" elevation="0">
          <div class="d-flex ga-4">
            <v-img
              :src="resolvePoster('checkout', booking.movie.poster)"
              width="80"
              rounded="lg"
              aspect-ratio="2/3"
              cover
              @error="markPosterBroken('checkout')"
            />
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ booking.movie.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ booking.showtime.format }} • {{ booking.showtime.language }}</div>
              <div class="text-caption text-medium-emphasis">{{ booking.theatre.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatDate(booking.date) }} • {{ booking.showtime.time }}</div>
            </div>
          </div>
        </v-card>

        <v-card class="glass-card pa-4 mb-4" elevation="0">
          <div class="text-subtitle-2 font-weight-bold mb-2">Seats</div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip v-for="s in booking.selectedSeats" :key="s.id" size="small" color="primary" variant="tonal">
              {{ s.id }}
            </v-chip>
          </div>
        </v-card>

        <v-card v-if="booking.foodCartCount" class="glass-card pa-4 mb-4" elevation="0">
          <div class="text-subtitle-2 font-weight-bold mb-2">Food & Beverages</div>
          <div v-for="(qty, id) in booking.selectedFood" :key="id" class="d-flex justify-space-between text-body-2 mb-1">
            <span>{{ booking.foodItems.find(f => f.id === id)?.name }} x{{ qty }}</span>
            <span>{{ formatINR((booking.foodItems.find(f => f.id === id)?.price || 0) * qty) }}</span>
          </div>
        </v-card>

        <v-card class="glass-card pa-4" elevation="0">
          <div class="text-subtitle-2 font-weight-bold mb-3">Apply Offer</div>
          <div v-if="booking.appliedOffer" class="d-flex align-center justify-space-between">
            <div>
              <v-chip color="success" size="small" variant="tonal" prepend-icon="mdi-tag-check">{{ booking.appliedOffer.code }}</v-chip>
              <span class="text-caption text-medium-emphasis ml-2">You saved {{ formatINR(booking.discount) }}</span>
            </div>
            <v-btn size="small" variant="text" color="error" @click="removeOffer">Remove</v-btn>
          </div>
          <div v-else class="d-flex ga-2">
            <v-text-field v-model="offerCode" placeholder="Enter offer code" density="compact" hide-details />
            <v-btn color="primary" variant="tonal" :loading="applying" @click="applyOffer">Apply</v-btn>
          </div>
          <div class="text-caption text-medium-emphasis mt-2">
            Try codes: FIRSTSHOW, WEEKEND100, COMBO50, NEON15
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card class="glass-card pa-4" elevation="0">
          <div class="text-subtitle-1 font-weight-bold mb-3">Price Details</div>
          <div class="d-flex justify-space-between text-body-2 mb-2">
            <span>Ticket(s) ({{ booking.selectedSeats.length }})</span>
            <span>{{ formatINR(booking.seatSubtotal) }}</span>
          </div>
          <div v-if="booking.foodSubtotal" class="d-flex justify-space-between text-body-2 mb-2">
            <span>Food & Beverages</span>
            <span>{{ formatINR(booking.foodSubtotal) }}</span>
          </div>
          <div v-if="booking.discount" class="d-flex justify-space-between text-body-2 mb-2 text-success">
            <span>Offer Discount</span>
            <span>-{{ formatINR(booking.discount) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-2 mb-2">
            <span>Convenience Fee</span>
            <span>{{ formatINR(booking.convenienceFee) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-2 mb-3">
            <span>GST & Taxes</span>
            <span>{{ formatINR(booking.gst) }}</span>
          </div>
          <v-divider class="mb-3" />
          <div class="d-flex justify-space-between text-h6 font-weight-bold mb-4">
            <span>Total Payable</span>
            <span class="gradient-text">{{ formatINR(booking.grandTotal) }}</span>
          </div>
          <v-btn block size="large" class="neon-btn" @click="proceed">Proceed to Pay</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

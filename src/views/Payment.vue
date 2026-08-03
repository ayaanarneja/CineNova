<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { formatINR } from '@/utils/currency'
import { useBookingFlowGuard } from '@/composables/useBookingFlowGuard'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()
const { booking } = useBookingFlowGuard()

const method = ref('card')
const processing = ref(false)

const cardNumber = ref('4242 4242 4242 4242')
const cardName = ref(auth.user?.name || '')
const cardExpiry = ref('12/28')
const cardCvv = ref('123')
const upiId = ref('demo@upi')

const wallets = [
  { key: 'gpay', label: 'Google Pay', icon: 'mdi-google' },
  { key: 'phonepe', label: 'PhonePe', icon: 'mdi-cellphone' },
  { key: 'paytm', label: 'Paytm', icon: 'mdi-wallet' }
]

async function pay() {
  if (booking.isSelectedShowExpired()) {
    toast.error('This show has already crossed. Please choose another showtime.')
    router.replace(`/movie/${booking.movie.id}/theatres`)
    return
  }
  processing.value = true
  try {
    await new Promise((r) => setTimeout(r, 1600))
    const paymentLabel =
      method.value === 'card' ? 'Credit/Debit Card' :
      method.value === 'upi' ? 'UPI' :
      wallets.find((w) => w.key === method.value)?.label || method.value

    const result = await booking.confirmBooking(auth.user.id, paymentLabel)
    toast.success('Payment successful!')
    router.replace(`/confirmation/${result.id}`)
    booking.resetContext()
  } catch (err) {
    toast.error(err.message || 'Payment failed. Please try again.')
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <v-container fluid class="px-3 px-md-8 pt-4 pb-16" v-if="booking.movie" style="max-width: 720px; margin: 0 auto;">
    <div class="d-flex align-center mb-4">
      <v-btn icon variant="text" aria-label="Go back" @click="router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <h2 class="text-h6 font-weight-bold ml-2">Payment</h2>
    </div>

    <v-card class="glass-card pa-4 mb-4 d-flex justify-space-between align-center" elevation="0">
      <span class="text-body-2">Amount Payable</span>
      <span class="text-h6 font-weight-bold gradient-text">{{ formatINR(booking.grandTotal) }}</span>
    </v-card>

    <v-card class="glass-card pa-4" elevation="0">
      <v-tabs v-model="method" color="primary" grow>
        <v-tab value="card">Card</v-tab>
        <v-tab value="upi">UPI</v-tab>
        <v-tab value="wallet">Wallets</v-tab>
      </v-tabs>

      <v-window v-model="method" class="mt-4">
        <v-window-item value="card">
          <v-text-field v-model="cardNumber" label="Card Number" prepend-inner-icon="mdi-credit-card-outline" maxlength="19" />
          <v-text-field v-model="cardName" label="Cardholder Name" prepend-inner-icon="mdi-account-outline" />
          <div class="d-flex ga-3">
            <v-text-field v-model="cardExpiry" label="MM/YY" style="max-width: 140px" />
            <v-text-field v-model="cardCvv" label="CVV" type="password" maxlength="3" style="max-width: 140px" />
          </div>
        </v-window-item>

        <v-window-item value="upi">
          <v-text-field v-model="upiId" label="UPI ID" prepend-inner-icon="mdi-at" placeholder="yourname@upi" />
          <p class="text-caption text-medium-emphasis">A payment request will be sent to your UPI app.</p>
        </v-window-item>

        <v-window-item value="wallet">
          <v-radio-group v-model="method">
            <v-card
              v-for="w in wallets"
              :key="w.key"
              class="glass-card pa-3 mb-3 d-flex align-center wallet-card"
              elevation="0"
              @click="method = w.key"
            >
              <v-icon class="mr-3" color="primary">{{ w.icon }}</v-icon>
              <span class="text-body-1">{{ w.label }}</span>
              <v-spacer />
              <v-icon v-if="method === w.key" color="primary">mdi-check-circle</v-icon>
            </v-card>
          </v-radio-group>
        </v-window-item>
      </v-window>

      <v-btn block size="large" class="neon-btn mt-4" :loading="processing" @click="pay">
        Pay {{ formatINR(booking.grandTotal) }}
      </v-btn>
      <div class="text-caption text-center text-medium-emphasis mt-2">
        <v-icon size="12">mdi-shield-check</v-icon> 100% secure payments (demo simulation)
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.wallet-card {
  cursor: pointer;
}
</style>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatINR } from '@/utils/currency'
import { useBookingFlowGuard } from '@/composables/useBookingFlowGuard'

const router = useRouter()
const { booking } = useBookingFlowGuard()

onMounted(async () => {
  if (booking.movie) await booking.fetchFood()
})

const categories = computed(() => [...new Set(booking.foodItems.map((f) => f.category))])

function qtyOf(id) {
  return booking.selectedFood[id] || 0
}

function increment(id) {
  booking.setFoodQty(id, qtyOf(id) + 1)
}
function decrement(id) {
  booking.setFoodQty(id, Math.max(0, qtyOf(id) - 1))
}

function proceed() {
  router.push('/checkout')
}
function skip() {
  router.push('/checkout')
}
</script>

<template>
  <v-container fluid class="px-3 px-md-8 pt-4 pb-32" v-if="booking.movie">
    <div class="d-flex align-center mb-4">
      <v-btn icon variant="text" aria-label="Go back" @click="router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <h2 class="text-h6 font-weight-bold ml-2">Grab a snack?</h2>
    </div>

    <div v-if="booking.loading">
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="6" sm="4" md="3">
          <div class="skeleton" style="height: 220px; border-radius: 20px;"></div>
        </v-col>
      </v-row>
    </div>

    <div v-for="cat in categories" :key="cat" class="mb-6">
      <h3 class="text-subtitle-1 font-weight-bold mb-3">{{ cat }}</h3>
      <v-row>
        <v-col v-for="item in booking.foodItems.filter((f) => f.category === cat)" :key="item.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="glass-card pa-3 h-100" elevation="0">
            <v-img :src="item.image" height="120" cover rounded="lg" class="mb-2" />
            <div class="d-flex align-center justify-space-between">
              <div class="text-body-2 font-weight-medium">{{ item.name }}</div>
              <v-icon :color="item.veg ? 'success' : 'error'" size="14">mdi-square</v-icon>
            </div>
            <div class="text-caption text-medium-emphasis mb-2">{{ item.description }}</div>
            <div class="d-flex align-center justify-space-between">
              <span class="font-weight-bold text-primary">{{ formatINR(item.price) }}</span>
              <div v-if="qtyOf(item.id) === 0">
                <v-btn size="small" variant="tonal" color="primary" @click="increment(item.id)">Add</v-btn>
              </div>
              <div v-else class="d-flex align-center ga-1">
                <v-btn icon size="x-small" variant="tonal" @click="decrement(item.id)"><v-icon size="14">mdi-minus</v-icon></v-btn>
                <span class="mx-1">{{ qtyOf(item.id) }}</span>
                <v-btn icon size="x-small" variant="tonal" color="primary" @click="increment(item.id)"><v-icon size="14">mdi-plus</v-icon></v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-card class="glass-card pa-4 mt-4 summary-bar" elevation="0">
      <div class="d-flex justify-space-between align-center flex-wrap ga-3">
        <div>
          <div class="text-caption text-medium-emphasis">{{ booking.foodCartCount }} item(s) added</div>
          <div class="text-h6 font-weight-bold">{{ formatINR(booking.foodSubtotal) }}</div>
        </div>
        <div class="d-flex ga-3">
          <v-btn variant="outlined" @click="skip">Skip</v-btn>
          <v-btn class="neon-btn" size="large" @click="proceed">Continue</v-btn>
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

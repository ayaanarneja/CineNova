<script setup>
import { onMounted } from 'vue'
import { useOffersStore } from '@/stores/offers'
import { useToastStore } from '@/stores/toast'
import { formatINR } from '@/utils/currency'

const offers = useOffersStore()
const toast = useToastStore()

onMounted(() => {
  offers.fetchAll()
})

function copyCode(code) {
  navigator.clipboard?.writeText(code)
  toast.success(`Code "${code}" copied!`)
}
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <h2 class="text-h5 font-weight-bold mb-4">Offers & Discounts</h2>

    <div v-if="offers.loading">
      <div v-for="n in 3" :key="n" class="skeleton mb-4" style="height: 140px; border-radius: 20px;"></div>
    </div>

    <v-row v-else>
      <v-col v-for="o in offers.all" :key="o.id" cols="12" sm="6">
        <v-card class="glass-card offer-card" elevation="0" @click="copyCode(o.code)">
          <v-img :src="o.image" height="120" cover class="offer-img">
            <div class="offer-scrim"></div>
          </v-img>
          <div class="pa-4">
            <div class="d-flex justify-space-between align-start">
              <h3 class="text-subtitle-1 font-weight-bold">{{ o.title }}</h3>
              <v-chip size="small" color="secondary" variant="flat" class="font-weight-bold">{{ o.code }}</v-chip>
            </div>
            <p class="text-caption text-medium-emphasis mt-1 mb-2">{{ o.description }}</p>
            <div class="d-flex justify-space-between text-caption text-medium-emphasis">
              <span>Min order {{ formatINR(o.minAmount) }}</span>
              <span>Valid till {{ o.validTill }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.offer-card {
  cursor: pointer;
  overflow: hidden;
}
.offer-img {
  position: relative;
}
.offer-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15,8,38,0) 40%, rgba(15,8,38,0.9) 100%);
}
</style>

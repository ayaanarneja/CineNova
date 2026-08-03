<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import gsap from 'gsap'
import TheatreCard from './TheatreCard.vue'

const props = defineProps({
  theatres: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  city: { type: String, default: null }
})

const scroller = ref(null)
const rowRef = ref(null)

function scrollBy(amount) {
  scroller.value?.scrollBy({ left: amount, behavior: 'smooth' })
}

function animate() {
  nextTick(() => {
    if (rowRef.value) {
      gsap.fromTo(
        rowRef.value.querySelectorAll('.theatre-row-item'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      )
    }
  })
}

onMounted(animate)
watch(() => props.theatres, animate)
</script>

<template>
  <section class="my-7">
    <div class="d-flex align-center justify-space-between px-1 mb-4">
      <div class="d-flex align-center">
        <v-icon color="secondary" class="mr-2">mdi-map-marker-radius</v-icon>
        <h3 class="section-title text-h6">
          Cinemas <span v-if="city" class="text-medium-emphasis">in {{ city }}</span>
        </h3>
      </div>
      <div v-if="theatres.length > 2" class="d-none d-sm-flex row-nav-btns">
        <v-btn icon size="small" variant="text" class="row-nav-btn" @click="scrollBy(-320)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" class="row-nav-btn" @click="scrollBy(320)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <div v-if="loading" ref="scroller" class="row-scroller">
      <div class="row-track">
        <div v-for="n in 4" :key="n" class="theatre-row-item">
          <div class="skeleton" style="width:220px;height:190px;border-radius:24px"></div>
        </div>
      </div>
    </div>

    <div v-else-if="theatres.length" ref="scroller" class="row-scroller">
      <div ref="rowRef" class="row-track">
        <div v-for="theatre in theatres" :key="theatre.id" class="theatre-row-item">
          <TheatreCard :theatre="theatre" />
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card pa-6 text-center">
      <v-icon size="40" color="grey-darken-1">mdi-map-marker-off-outline</v-icon>
      <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
        {{ city ? `No cinemas listed in ${city} yet.` : 'Select a location to see cinemas near you.' }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.row-scroller {
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding-bottom: 8px;
}
.row-track {
  display: flex;
  gap: 16px;
}
.theatre-row-item {
  flex: 0 0 220px;
  width: 220px;
  scroll-snap-align: start;
}
.row-nav-btn {
  transition: background .25s ease, transform .2s ease;
  border-radius: 12px;
}
.row-nav-btn:hover {
  background: var(--chip-bg-hover);
  transform: scale(1.08);
}
.empty-state {
  border-radius: 24px;
}
</style>

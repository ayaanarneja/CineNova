<script setup>
import { ref, onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import MovieCard from './MovieCard.vue'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'mdi-fire' },
  movies: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const scroller = ref(null)
const rowRef = ref(null)

function scrollBy(amount) {
  scroller.value?.scrollBy({ left: amount, behavior: 'smooth' })
}

onMounted(async () => {
  await nextTick()
  if (rowRef.value) {
    gsap.fromTo(
      rowRef.value.querySelectorAll('.row-item'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
    )
  }
})
</script>

<template>
  <section class="my-7" v-if="loading || movies.length">
    <div class="d-flex align-center justify-space-between px-1 mb-4">
      <div class="d-flex align-center">
        <v-icon color="secondary" class="mr-2">{{ icon }}</v-icon>
        <h3 class="section-title text-h6">{{ title }}</h3>
      </div>
      <div class="d-none d-sm-flex row-nav-btns">
        <v-btn icon size="small" variant="text" class="row-nav-btn" @click="scrollBy(-320)">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" class="row-nav-btn" @click="scrollBy(320)">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
    </div>

    <div ref="scroller" class="row-scroller">
      <div ref="rowRef" class="row-track">
        <template v-if="loading">
          <div v-for="n in 6" :key="n" class="row-item skeleton-card">
            <div class="skeleton" style="width:150px;height:225px"></div>
          </div>
        </template>
        <template v-else>
          <div v-for="movie in movies" :key="movie.id" class="row-item">
            <MovieCard :movie="movie" />
          </div>
        </template>
      </div>
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
  gap: 18px;
}
.row-item {
  flex: 0 0 150px;
  width: 150px;
  scroll-snap-align: start;
}
.skeleton-card {
  flex: 0 0 150px;
  width: 150px;
}
.row-nav-btn {
  transition: background .25s ease, transform .2s ease;
  border-radius: 12px;
}
.row-nav-btn:hover {
  background: var(--chip-bg-hover);
  transform: scale(1.08);
}
</style>

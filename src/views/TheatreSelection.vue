<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useTheatresStore } from '@/stores/theatres'
import { useBookingStore } from '@/stores/booking'
import { useLocationStore } from '@/stores/location'
import { useToastStore } from '@/stores/toast'
import { nextNDays } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const movies = useMoviesStore()
const theatres = useTheatresStore()
const booking = useBookingStore()
const location = useLocationStore()
const toast = useToastStore()

const movie = ref(null)
const loading = ref(true)
const days = nextNDays(7)
const selectedDate = ref(days[0].date)

onMounted(async () => {
  await movies.fetchAll()
  await theatres.fetchAll()
  movie.value = await movies.fetchOne(route.params.id)
  // Fetch showtimes filtered by current city
  await theatres.fetchShowtimesForMovie(route.params.id, location.selectedCity)
  loading.value = false
})

const theatreList = computed(() =>
  theatres.theatresForMovie(route.params.id, location.selectedCity)
)

function showtimesFor(theatreId) {
  return theatres.showtimesFor(route.params.id, theatreId, selectedDate.value)
}

function selectShowtime(theatre, showtime) {
  if (showtime.expired) {
    toast.warning('This show has already crossed. Please pick another time.')
    return
  }
  try {
    booking.setContext({ movie: movie.value, theatre, date: selectedDate.value, showtime })
    router.push('/seats')
  } catch (err) {
    toast.warning(err.message)
  }
}
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <div class="d-flex align-center mb-4">
      <v-btn icon variant="text" aria-label="Go back" @click="router.back()"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <div class="ml-2 flex-1">
        <div class="text-caption text-medium-emphasis">Select showtime</div>
        <h2 class="text-h6 font-weight-bold">{{ movie?.title }}</h2>
      </div>
      <div v-if="location.selectedCity" class="city-badge">
        <v-icon size="13" color="secondary">mdi-map-marker</v-icon>
        <span>{{ location.selectedCity }}</span>
      </div>
    </div>

    <!-- Date strip -->
    <div class="date-strip mb-6">
      <div
        v-for="d in days"
        :key="d.date"
        class="date-chip"
        :class="{ 'date-chip--active': selectedDate === d.date }"
        @click="selectedDate = d.date"
      >
        <div class="text-caption">{{ d.label }}</div>
        <div class="text-h6 font-weight-bold">{{ d.day }}</div>
        <div class="text-caption">{{ d.month }}</div>
      </div>
    </div>

    <div v-if="loading">
      <div v-for="n in 3" :key="n" class="skeleton mb-4" style="height: 140px; border-radius: 20px;"></div>
    </div>

    <div v-else-if="!theatreList.length" class="text-center py-12">
      <v-icon size="56" color="grey-darken-1">mdi-theater</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-3">
        No theatres found in <strong>{{ location.selectedCity || 'this city' }}</strong>
      </p>
      <p class="text-caption text-medium-emphasis mt-1">Try switching your city from the top navigation</p>
    </div>

    <v-card v-for="theatre in theatreList" :key="theatre.id" class="glass-card pa-4 mb-4" elevation="0">
      <div class="d-flex justify-space-between align-start flex-wrap">
        <div>
          <div class="text-subtitle-1 font-weight-bold">{{ theatre.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ theatre.address }}</div>
          <div class="d-flex ga-2 mt-2 flex-wrap">
            <v-chip size="x-small" variant="outlined" v-for="a in theatre.amenities" :key="a">{{ a }}</v-chip>
          </div>
        </div>
        <v-chip size="small" color="warning" variant="tonal"><v-icon start size="14">mdi-star</v-icon>{{ theatre.rating }}</v-chip>
      </div>

      <v-divider class="my-3" />

      <div class="d-flex ga-3 flex-wrap">
        <v-btn
          v-for="s in showtimesFor(theatre.id)"
          :key="s.id"
          variant="outlined"
          :color="s.expired ? undefined : 'primary'"
          class="showtime-btn"
          :class="{ 'showtime-btn--expired': s.expired }"
          :ripple="!s.expired"
          @click="selectShowtime(theatre, s)"
        >
          <div class="d-flex flex-column align-center">
            <span class="font-weight-bold">{{ s.time }}</span>
            <span v-if="s.expired" class="text-caption font-weight-bold" style="color:#FF6B6B">Show Crossed</span>
            <template v-else>
              <span class="text-caption text-medium-emphasis">{{ s.format }}</span>
              <span class="text-caption" style="font-size:10px;opacity:0.6">{{ s.availableSeats }} left</span>
            </template>
          </div>
        </v-btn>
        <div v-if="!showtimesFor(theatre.id).length" class="text-caption text-medium-emphasis py-2">
          All shows sold out for this date
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.city-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(177,92,255,0.12);
  border: 1px solid rgba(177,92,255,0.3);
  font-size: 0.75rem;
  font-weight: 600;
}
.date-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.date-strip::-webkit-scrollbar { display: none; }
.date-chip {
  min-width: 64px;
  text-align: center;
  padding: 10px 6px;
  border-radius: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all .2s ease;
  flex-shrink: 0;
}
.date-chip--active {
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-pink));
  box-shadow: 0 0 18px rgba(177,92,255,0.5);
}
.showtime-btn {
  height: 68px;
  min-width: 90px;
}
.showtime-btn--expired {
  opacity: 0.45;
  cursor: not-allowed;
  filter: grayscale(0.6);
}
.showtime-btn--expired:hover {
  transform: none !important;
}
</style>

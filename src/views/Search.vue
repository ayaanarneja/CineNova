<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useTheatresStore } from '@/stores/theatres'
import showtimeService from '@/services/showtimeService'
import MovieCard from '@/components/movie/MovieCard.vue'

const movies = useMoviesStore()
const theatres = useTheatresStore()
const route = useRoute()

const query = ref('')
const genre = ref(route.query.genre || null)
const language = ref(route.query.language || null)
const theatreCity = ref(null)
const formatFilter = ref(route.query.format || null)
const formatMovieIds = ref(null)
const cityMovieIds = ref(null)
const sortBy = ref('newest')
const allShowtimes = ref([])

const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'A - Z', value: 'az' },
  { title: 'Rating: High to Low', value: 'rating' }
]

onMounted(async () => {
  await movies.fetchAll()
  await theatres.fetchAll()
  try {
    const { data } = await showtimeService.getAll()
    allShowtimes.value = data
    if (formatFilter.value) {
      applyFormatFilter()
    }
  } catch {
    allShowtimes.value = []
  }
})

function applyFormatFilter() {
  const ids = new Set(
    allShowtimes.value
      .filter((s) => s.format?.toUpperCase().includes(formatFilter.value.toUpperCase()))
      .map((s) => s.movieId)
  )
  formatMovieIds.value = ids
}

function applyCityFilter() {
  if (!theatreCity.value) {
    cityMovieIds.value = null
    return
  }
  const theatreIdsInCity = new Set(
    theatres.all.filter((t) => t.city === theatreCity.value).map((t) => t.id)
  )
  const ids = new Set(
    allShowtimes.value
      .filter((s) => theatreIdsInCity.has(s.theatreId))
      .map((s) => s.movieId)
  )
  cityMovieIds.value = ids
}

watch(theatreCity, applyCityFilter)
watch(formatFilter, (val) => {
  if (val) applyFormatFilter()
  else formatMovieIds.value = null
})

const results = computed(() => {
  const base = movies.search({ query: query.value, genre: genre.value, language: language.value })
  const filteredByFormat =
    formatFilter.value && formatMovieIds.value
      ? base.filter((m) => formatMovieIds.value.has(m.id))
      : base
  const filteredByCity =
    theatreCity.value && cityMovieIds.value
      ? filteredByFormat.filter((m) => cityMovieIds.value.has(m.id))
      : filteredByFormat

  const sorted = [...filteredByCity]
  if (sortBy.value === 'az') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'rating') {
    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else {
    // newest: by release date, most recent first
    sorted.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
  }
  return sorted
})

function clearFilters() {
  query.value = ''
  genre.value = null
  language.value = null
  theatreCity.value = null
  formatFilter.value = null
  formatMovieIds.value = null
  cityMovieIds.value = null
  sortBy.value = 'newest'
}
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <h2 class="text-h5 font-weight-bold mb-4">Search & Filter</h2>

    <v-text-field
      v-model="query"
      placeholder="Search by movie title..."
      prepend-inner-icon="mdi-magnify"
      clearable
      class="mb-3"
      autofocus
    />

    <div class="d-flex flex-wrap ga-3 mb-6">
      <v-select
        v-model="genre"
        :items="movies.genres"
        label="Genre"
        clearable
        style="max-width: 200px"
        hide-details
      />
      <v-select
        v-model="language"
        :items="movies.languages"
        label="Language"
        clearable
        style="max-width: 200px"
        hide-details
      />
      <v-select
        v-model="theatreCity"
        :items="theatres.cities"
        label="Theatre City"
        clearable
        style="max-width: 200px"
        hide-details
      />
      <v-select
        v-model="sortBy"
        :items="sortOptions"
        label="Sort by"
        style="max-width: 200px"
        hide-details
      />
      <v-btn variant="tonal" prepend-icon="mdi-close" @click="clearFilters">Clear</v-btn>
    </div>

    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-chip
        v-if="formatFilter"
        closable
        color="secondary"
        variant="flat"
        prepend-icon="mdi-image-filter-center-focus-strong"
        @click:close="formatFilter = null; formatMovieIds = null"
      >
        {{ formatFilter }} shows only
      </v-chip>
      <v-chip
        v-if="theatreCity"
        closable
        color="primary"
        variant="flat"
        prepend-icon="mdi-map-marker"
        @click:close="theatreCity = null"
      >
        Playing in {{ theatreCity }}
      </v-chip>
    </div>

    <div class="text-caption text-medium-emphasis mb-3">{{ results.length }} results found</div>

    <v-row v-if="results.length">
      <v-col v-for="m in results" :key="m.id" cols="6" sm="4" md="3" lg="2">
        <MovieCard :movie="m" />
      </v-col>
    </v-row>

    <div v-else class="text-center py-12">
      <v-icon size="64" color="grey-darken-1">mdi-movie-search-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-3">No movies match your filters</p>
    </div>
  </v-container>
</template>

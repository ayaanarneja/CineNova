<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useMoviesStore } from '@/stores/movies'
import { useAuthStore } from '@/stores/auth'
import { useTheatresStore } from '@/stores/theatres'
import { useLocationStore } from '@/stores/location'
import MovieRow from '@/components/movie/MovieRow.vue'
import TrendingSection from '@/components/movie/TrendingSection.vue'
import TheatreRow from '@/components/theatre/TheatreRow.vue'
import { useBrokenImages, BACKDROP_PLACEHOLDER } from '@/composables/useImageFallback'

const movies = useMoviesStore()
const auth = useAuthStore()
const theatres = useTheatresStore()
const location = useLocationStore()
const router = useRouter()
const heroRef = ref(null)
const { resolve: resolveHero, markBroken: markHeroBroken } = useBrokenImages(BACKDROP_PLACEHOLDER)

const cityTheatres = computed(() =>
  location.selectedCity ? theatres.all.filter((t) => t.city === location.selectedCity) : []
)


const heroMovies = computed(() => {
  const list = movies.trending.length ? movies.trending : movies.nowPlaying
  return list.slice(0, 5)
})
const heroIndex = ref(0)
const heroMovie = computed(() => heroMovies.value[heroIndex.value])

let heroTimer = null
function startHeroTimer() {
  stopHeroTimer()
  heroTimer = setInterval(() => {
    if (heroMovies.value.length > 1) {
      heroIndex.value = (heroIndex.value + 1) % heroMovies.value.length
    }
  }, 6000)
}
function stopHeroTimer() {
  if (heroTimer) clearInterval(heroTimer)
}
function goToHero(i) {
  heroIndex.value = i
  startHeroTimer()
}

function animateHero() {
  if (!heroRef.value) return
  gsap.fromTo(
    heroRef.value,
    { opacity: 0, scale: 1.04 },
    { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' }
  )
}

watch(heroIndex, () => animateHero())

const greetingName = computed(() => auth.user?.name?.split(' ')[0] || 'there')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const quickFilters = [
  { label: 'All Filters', icon: 'mdi-filter-variant', query: {} },
  { label: 'English', icon: 'mdi-web', query: { language: 'English' } },
  { label: 'Hindi', icon: 'mdi-web', query: { language: 'Hindi' } },
  { label: 'IMAX', icon: 'mdi-image-filter-center-focus-strong', query: { format: 'IMAX' } },
  { label: '4DX', icon: 'mdi-motion', query: { format: '4DX' } }
]

function applyFilter(query) {
  router.push({ path: '/search', query })
}

onMounted(async () => {
  await Promise.all([movies.fetchAll(), theatres.fetchAll()])
  animateHero()
  startHeroTimer()
})

onBeforeUnmount(() => stopHeroTimer())
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <div class="d-flex align-center justify-space-between mb-3 flex-wrap ga-3">
      <div>
        <div class="text-caption text-medium-emphasis mb-1">{{ greeting }}, {{ greetingName }} 👋</div>
        <h2 class="text-h5 font-weight-bold">What are we watching today?</h2>
      </div>
      <v-btn
        variant="tonal"
        color="secondary"
        prepend-icon="mdi-ticket-percent-outline"
        rounded="xl"
        class="d-none d-sm-flex offers-btn"
        @click="router.push('/offers')"
      >
        Offers for you
      </v-btn>
    </div>


    <!-- Hero banner -->
    <div v-if="movies.loading && !heroMovie" class="skeleton hero-skeleton mb-6"></div>
    <div v-else-if="heroMovie" class="hero-banner mb-6">
      <div ref="heroRef" class="hero-inner" @click="router.push(`/movie/${heroMovie.id}`)">
        <v-img
          :src="resolveHero(heroMovie.id, heroMovie.backdrop)"
          cover
          height="100%"
          class="hero-img"
          @error="markHeroBroken(heroMovie.id)"
        >
          <div class="hero-scrim"></div>
          <div class="hero-content pa-6 pa-md-10">
            <v-chip color="secondary" size="small" class="mb-3 font-weight-bold">🔥 TRENDING NOW</v-chip>
            <h1 class="text-h4 text-md-h3 font-weight-bold mb-2">{{ heroMovie.title }}</h1>
            <div class="d-flex align-center ga-2 mb-3 flex-wrap">
              <v-chip size="small" variant="outlined" v-for="g in heroMovie.genre" :key="g">{{ g }}</v-chip>
              <v-chip size="small" color="warning" variant="flat">
                <v-icon start size="14">mdi-star</v-icon>{{ heroMovie.rating || 'NEW' }}
              </v-chip>
            </div>
            <p class="text-body-2 d-none d-sm-block hero-desc">{{ heroMovie.description }}</p>
            <v-btn class="neon-btn glass-cta mt-4" size="large" prepend-icon="mdi-ticket" @click.stop="router.push(`/movie/${heroMovie.id}`)">
              Book Tickets
            </v-btn>
          </div>
        </v-img>
      </div>

      <div v-if="heroMovies.length > 1" class="hero-dots">
        <button
          v-for="(m, i) in heroMovies"
          :key="m.id"
          class="hero-dot"
          :class="{ 'hero-dot--active': i === heroIndex }"
          @click.stop="goToHero(i)"
          :aria-label="`Show ${m.title}`"
        ></button>
      </div>
    </div>

    <!-- Quick filter chips -->
    <div class="d-flex ga-2 mb-6 flex-wrap quick-filters">
      <v-chip
        v-for="f in quickFilters"
        :key="f.label"
        :color="f.label === 'All Filters' ? 'primary' : undefined"
        :variant="f.label === 'All Filters' ? 'flat' : 'outlined'"
        :prepend-icon="f.icon"
        class="filter-chip"
        @click="applyFilter(f.query)"
      >
        {{ f.label }}
      </v-chip>
    </div>

    <TheatreRow :theatres="cityTheatres" :loading="theatres.loading" :city="location.selectedCity" />

    <div class="section-divider"></div>

    <MovieRow title="Latest Releases" icon="mdi-new-box" :movies="movies.latest" :loading="movies.loading" />
    <MovieRow title="Now Playing" icon="mdi-play-circle" :movies="movies.nowPlaying" :loading="movies.loading" />
    <TrendingSection :movies="movies.trending" :loading="movies.loading" />
    <MovieRow title="Top Rated" icon="mdi-star-circle" :movies="movies.topRated" :loading="movies.loading" />
    <MovieRow title="Recommended For You" icon="mdi-sparkles" :movies="movies.recommended" :loading="movies.loading" />
    <MovieRow title="Coming Soon" icon="mdi-calendar-star" :movies="movies.comingSoon" :loading="movies.loading" />
  </v-container>
</template>

<style scoped>
.offers-btn {
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  transition: transform .25s var(--ease-smooth), box-shadow .25s var(--ease-smooth);
}
.offers-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 77, 166, 0.25);
}
.hero-banner {
  position: relative;
}
.hero-inner {
  height: 380px;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 1px solid var(--glass-border);
  box-shadow: 0 24px 70px rgba(177,92,255,0.22), 0 8px 30px rgba(0,0,0,0.5);
  transition: box-shadow .35s var(--ease-smooth);
}
.hero-inner:hover {
  box-shadow: 0 28px 80px rgba(177,92,255,0.32), 0 0 40px rgba(0,229,199,0.12), 0 8px 30px rgba(0,0,0,0.55);
}
.hero-skeleton {
  height: 380px;
  border-radius: 28px;
}
.hero-img {
  position: relative;
}
.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(5,5,5,0.97) 8%, rgba(5,5,5,0.72) 50%, rgba(5,5,5,0.25) 100%),
              linear-gradient(0deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.1) 45%);
}
.hero-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  max-width: 640px;
}
.hero-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgba(255,255,255,0.8);
}
.glass-cta {
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
}
.hero-dots {
  position: absolute;
  bottom: 16px;
  right: 20px;
  z-index: 3;
  display: flex;
  gap: 8px;
}
.hero-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.35);
  cursor: pointer;
  padding: 0;
  transition: all .25s var(--ease-smooth, ease);
}
.hero-dot--active {
  width: 24px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--neon-purple), var(--neon-pink));
}
.section-divider {
  height: 1px;
  margin: 8px 0 4px;
  background: linear-gradient(90deg, transparent, var(--glass-border) 20%, var(--glass-border) 80%, transparent);
}
.filter-chip {
  transition: transform .2s ease, box-shadow .2s ease;
}
.filter-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(177,92,255,0.2);
}
@media (max-width: 600px) {
  .hero-inner, .hero-skeleton { height: 460px; }
}
</style>

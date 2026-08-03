<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { useMoviesStore } from '@/stores/movies'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useToastStore } from '@/stores/toast'
import { useBrokenImages, BACKDROP_PLACEHOLDER } from '@/composables/useImageFallback'

const route = useRoute()
const router = useRouter()
const movies = useMoviesStore()
const auth = useAuthStore()
const wishlist = useWishlistStore()
const toast = useToastStore()

const movie = ref(null)
const loading = ref(true)
const contentRef = ref(null)
const { resolve, markBroken } = useBrokenImages()
const { resolve: resolveBackdrop, markBroken: markBackdropBroken } = useBrokenImages(BACKDROP_PLACEHOLDER)

onMounted(async () => {
  await movies.fetchAll()
  movie.value = await movies.fetchOne(route.params.id)
  loading.value = false
  if (auth.user) await wishlist.fetchForUser(auth.user.id)
  requestAnimationFrame(() => {
    if (contentRef.value) {
      gsap.fromTo(contentRef.value, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    }
  })
})

const isWishlisted = computed(() => movie.value && wishlist.isWishlisted(movie.value.id))

async function toggleWishlist() {
  const added = await wishlist.toggle(auth.user.id, movie.value)
  toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
}

function goBook() {
  router.push(`/movie/${movie.value.id}/theatres`)
}
</script>

<template>
  <div v-if="loading" class="pa-6">
    <div class="skeleton" style="height: 320px; border-radius: 28px;"></div>
  </div>

  <div v-else-if="movie">
    <div class="details-hero">
      <v-img :src="resolveBackdrop('backdrop', movie.backdrop)" cover height="360" class="hero-img" @error="markBackdropBroken('backdrop')">
        <div class="hero-scrim-full"></div>
      </v-img>
      <v-btn icon variant="flat" class="back-btn" @click="router.back()">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </div>

    <v-container fluid class="px-3 px-md-8 pb-24 details-body" ref="contentRef">
      <v-row>
        <v-col cols="12" sm="4" md="3" class="mt-n16">
          <v-img
            :src="resolve('poster', movie.poster)"
            rounded="xl"
            aspect-ratio="2/3"
            cover
            class="poster-shadow"
            @error="markBroken('poster')"
          />
        </v-col>
        <v-col cols="12" sm="8" md="9">
          <div class="d-flex align-start justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold">{{ movie.title }}</h1>
              <div class="d-flex flex-wrap ga-2 my-3">
                <v-chip size="small" color="warning" variant="flat"><v-icon start size="14">mdi-star</v-icon>{{ movie.rating || 'Upcoming' }}</v-chip>
                <v-chip size="small" variant="outlined">{{ movie.censor }}</v-chip>
                <v-chip size="small" variant="outlined">{{ movie.duration }} min</v-chip>
                <v-chip size="small" variant="outlined" v-for="g in movie.genre" :key="g">{{ g }}</v-chip>
              </div>
              <div class="text-caption text-medium-emphasis mb-4">
                {{ movie.language.join(', ') }} • Directed by {{ movie.director }} • Releases {{ movie.releaseDate }}
              </div>
            </div>
            <v-btn icon variant="tonal" :color="isWishlisted ? 'secondary' : 'default'" @click="toggleWishlist">
              <v-icon>{{ isWishlisted ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            </v-btn>
          </div>

          <p class="text-body-1 mb-6" style="max-width: 720px; opacity: 0.85;">{{ movie.description }}</p>

          <v-btn
            v-if="movie.status === 'now_playing'"
            size="x-large"
            class="neon-btn"
            prepend-icon="mdi-ticket-confirmation"
            @click="goBook"
          >
            Book Tickets
          </v-btn>
          <v-chip v-else color="info" variant="tonal" size="large" prepend-icon="mdi-calendar-clock">
            Coming Soon — {{ movie.releaseDate }}
          </v-chip>
        </v-col>
      </v-row>

      <v-divider class="my-8" />

      <h3 class="text-h6 font-weight-bold mb-4">Cast & Crew</h3>
      <div class="d-flex ga-4 flex-wrap">
        <div v-for="c in movie.cast" :key="c.name" class="text-center cast-item">
          <v-avatar size="72" class="mb-2 neon-border">
            <v-img :src="c.photo" cover />
          </v-avatar>
          <div class="text-body-2 font-weight-medium">{{ c.name }}</div>
          <div class="text-caption text-medium-emphasis">{{ c.role }}</div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.details-hero {
  position: relative;
}
.hero-scrim-full {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15,8,38,0.2) 0%, rgba(15,8,38,1) 95%);
}
.back-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(15,8,38,0.6) !important;
  backdrop-filter: blur(6px);
}
.poster-shadow {
  aspect-ratio: 2 / 3;
  background: #15151D;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
}
.cast-item {
  width: 90px;
}
.details-body {
  padding-bottom: 120px;
}
</style>

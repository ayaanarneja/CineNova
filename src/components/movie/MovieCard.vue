<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useToastStore } from '@/stores/toast'
import { useBrokenImages } from '@/composables/useImageFallback'

const props = defineProps({
  movie: { type: Object, required: true }
})

const router = useRouter()
const auth = useAuthStore()
const wishlist = useWishlistStore()
const toast = useToastStore()

// Poster fallback: if the poster URL 404s or fails to decode, swap to a
// local placeholder so a broken-image icon never shows on the card.
const { resolve, markBroken } = useBrokenImages()

function open() {
  router.push(`/movie/${props.movie.id}`)
}

async function toggleWishlist(e) {
  e.stopPropagation()
  const added = await wishlist.toggle(auth.user.id, props.movie)
  toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
}
</script>

<template>
  <div class="movie-card hover-lift" @click="open">
    <div class="poster-wrap">
      <v-img
        :src="resolve(movie.id, movie.poster)"
        :alt="movie.title"
        aspect-ratio="2/3"
        cover
        class="poster-img"
        rounded="xl"
        @error="markBroken(movie.id)"
      >
        <template #placeholder>
          <div class="skeleton" style="width:100%;height:100%"></div>
        </template>
      </v-img>

      <div class="poster-overlay">
        <v-chip size="x-small" color="warning" variant="flat" class="rating-chip">
          <v-icon start size="12">mdi-star</v-icon>{{ movie.rating || 'NEW' }}
        </v-chip>
        <v-btn
          icon
          size="x-small"
          variant="flat"
          class="wishlist-btn"
          :color="wishlist.isWishlisted(movie.id) ? 'secondary' : 'default'"
          @click="toggleWishlist"
        >
          <v-icon size="16">{{ wishlist.isWishlisted(movie.id) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
        </v-btn>
      </div>
    </div>
    <div class="mt-2">
      <div class="text-body-2 font-weight-medium text-truncate movie-title">{{ movie.title }}</div>
      <div class="text-caption text-medium-emphasis text-truncate">{{ movie.genre?.join(' • ') }}</div>
    </div>
  </div>
</template>

<style scoped>
.movie-card {
  width: 100%;
  cursor: pointer;
}
.poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 20px;
  overflow: hidden;
  background: var(--surface-dark);
  border: 1px solid var(--glass-border);
  transition: border-color .3s ease, box-shadow .3s ease, background .3s ease;
}
.movie-card:hover .poster-wrap {
  border-color: rgba(177, 92, 255, 0.45);
  box-shadow: 0 12px 36px rgba(177, 92, 255, 0.28), 0 0 24px rgba(0, 229, 199, 0.12);
}
.poster-img {
  width: 100%;
  height: 100%;
  transition: transform .4s cubic-bezier(0.16, 1, 0.3, 1);
}
.movie-card:hover .poster-img {
  transform: scale(1.06);
}
.poster-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rating-chip {
  font-weight: 700;
}
.wishlist-btn {
  background: rgba(15,8,38,0.6) !important;
  backdrop-filter: blur(6px);
}
.movie-title {
  transition: color .25s ease;
}
.movie-card:hover .movie-title {
  color: var(--neon-purple, #B15CFF);
}
</style>

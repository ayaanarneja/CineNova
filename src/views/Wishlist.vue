<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useToastStore } from '@/stores/toast'
import { useBrokenImages } from '@/composables/useImageFallback'

const router = useRouter()
const auth = useAuthStore()
const wishlist = useWishlistStore()
const toast = useToastStore()
const { resolve: resolvePoster, markBroken: markPosterBroken } = useBrokenImages()

onMounted(() => {
  wishlist.fetchForUser(auth.user.id)
})

async function remove(entry) {
  await wishlist.toggle(auth.user.id, { id: entry.movieId, title: entry.title, poster: entry.poster, rating: entry.rating })
  toast.info('Removed from wishlist')
}
</script>

<template>
  <v-container fluid class="pb-16 px-3 px-md-8 pt-4">
    <h2 class="text-h5 font-weight-bold mb-4">My Wishlist</h2>

    <div v-if="wishlist.loading">
      <v-row>
        <v-col v-for="n in 6" :key="n" cols="6" sm="4" md="3">
          <div class="skeleton" style="height: 260px; border-radius: 20px;"></div>
        </v-col>
      </v-row>
    </div>

    <div v-else-if="!wishlist.items.length" class="empty-state">
      <v-icon size="56" color="grey-darken-1">mdi-heart-outline</v-icon>
      <p class="text-body-1 text-medium-emphasis mt-3">Your wishlist is empty</p>
      <v-btn class="neon-btn mt-3" @click="router.push('/')">Discover Movies</v-btn>
    </div>

    <v-row v-else>
      <v-col v-for="entry in wishlist.items" :key="entry.id" cols="6" sm="4" md="3" lg="2">
        <div class="wish-card hover-lift" @click="router.push(`/movie/${entry.movieId}`)">
          <v-img
            :src="resolvePoster(entry.movieId, entry.poster)"
            aspect-ratio="2/3"
            cover
            rounded="xl"
            @error="markPosterBroken(entry.movieId)"
          />
          <v-btn icon size="x-small" class="remove-btn" color="secondary" variant="flat" @click.stop="remove(entry)">
            <v-icon size="16">mdi-heart-remove</v-icon>
          </v-btn>
          <div class="text-body-2 font-weight-medium mt-2 text-truncate">{{ entry.title }}</div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 0;
}
.wish-card {
  position: relative;
  cursor: pointer;
}
.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>

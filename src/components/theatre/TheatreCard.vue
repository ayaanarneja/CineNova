<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  theatre: { type: Object, required: true }
})

const router = useRouter()

function browseHere() {
  router.push({ path: '/search', query: { city: props.theatre.city } })
}
</script>

<template>
  <div class="theatre-card glass-card pa-4" @click="browseHere">
    <div class="d-flex align-start justify-space-between ga-2">
      <div class="theatre-icon">
        <v-icon size="20" color="secondary">mdi-theater</v-icon>
      </div>
      <v-chip size="x-small" color="warning" variant="tonal">
        <v-icon start size="12">mdi-star</v-icon>{{ theatre.rating }}
      </v-chip>
    </div>

    <h4 class="text-subtitle-2 font-weight-bold mt-3 theatre-name">{{ theatre.name }}</h4>
    <p class="text-caption text-medium-emphasis theatre-address">{{ theatre.address }}</p>

    <div class="d-flex flex-wrap ga-1 mt-3">
      <v-chip
        v-for="a in theatre.amenities?.slice(0, 3)"
        :key="a"
        size="x-small"
        variant="outlined"
        class="amenity-chip"
      >
        {{ a }}
      </v-chip>
    </div>

    <div class="d-flex align-center ga-1 mt-3 browse-link">
      <span class="text-caption font-weight-medium">Browse movies here</span>
      <v-icon size="14">mdi-arrow-right</v-icon>
    </div>
  </div>
</template>

<style scoped>
.theatre-card {
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.theatre-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 229, 199, 0.1);
  border: 1px solid rgba(0, 229, 199, 0.25);
}
.theatre-name {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.theatre-address {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4em;
}
.amenity-chip {
  opacity: 0.85;
}
.browse-link {
  margin-top: auto;
  color: var(--neon-cyan);
  opacity: 0.9;
}
</style>

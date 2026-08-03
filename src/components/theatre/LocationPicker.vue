<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: null },
  cities: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)

const sortedCities = computed(() => [...props.cities].sort())

function pick(city) {
  emit('update:modelValue', city)
  open.value = false
}
</script>

<template>
  <v-dialog v-model="open" max-width="420">
    <template #activator="{ props: activatorProps }">
      <button class="location-pill" v-bind="activatorProps" type="button">
        <v-icon size="16" color="secondary">mdi-map-marker</v-icon>
        <span class="location-pill__text">{{ modelValue || 'Select location' }}</span>
        <v-icon size="16" class="location-pill__chevron">mdi-chevron-down</v-icon>
      </button>
    </template>

    <v-card class="glass-card location-dialog pa-2" elevation="0">
      <div class="d-flex align-center justify-space-between px-3 pt-3 pb-1">
        <h3 class="text-subtitle-1 font-weight-bold">Choose your city</h3>
        <v-btn icon variant="text" size="small" @click="open = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <p class="text-caption text-medium-emphasis px-3 mb-3">
        We'll show cinemas and showtimes near this city.
      </p>

      <div class="city-grid px-3 pb-3">
        <button
          v-for="city in sortedCities"
          :key="city"
          class="city-option"
          :class="{ 'city-option--active': city === modelValue }"
          type="button"
          @click="pick(city)"
        >
          <v-icon size="18">mdi-city-variant-outline</v-icon>
          <span>{{ city }}</span>
          <v-icon v-if="city === modelValue" size="16" color="secondary" class="ml-auto">mdi-check-circle</v-icon>
        </button>

        <p v-if="!sortedCities.length" class="text-caption text-medium-emphasis text-center py-4">
          No cities available yet.
        </p>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.location-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px);
  color: inherit;
  cursor: pointer;
  font-family: inherit;
  transition: border-color .25s var(--ease-smooth), background .25s var(--ease-smooth), transform .2s var(--ease-smooth);
}
.location-pill:hover {
  border-color: var(--glass-border-hover);
  background: var(--glass-bg-strong);
  transform: translateY(-1px);
}
.location-pill__text {
  font-size: 0.8rem;
  font-weight: 600;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.location-pill__chevron {
  opacity: 0.6;
}

.location-dialog {
  border-radius: 24px !important;
}

.city-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
}
.city-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: inherit;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}
.city-option:hover {
  border-color: var(--glass-border-hover);
  background: var(--glass-bg-strong);
  transform: translateX(2px);
}
.city-option--active {
  border-color: var(--neon-purple);
  background: rgba(177, 92, 255, 0.12);
}
</style>

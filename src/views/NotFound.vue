<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found d-flex flex-column align-center justify-center">
    <v-icon size="80" color="primary">mdi-movie-off-outline</v-icon>
    <h1 class="text-h4 gradient-text mt-4">404</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">This scene doesn't exist in our script.</p>
    <v-btn class="neon-btn" @click="router.push('/')">Back to Home</v-btn>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  text-align: center;
  padding: 24px;
}
</style>

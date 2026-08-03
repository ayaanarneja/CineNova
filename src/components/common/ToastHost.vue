<script setup>
import { useToastStore } from '@/stores/toast'
const toast = useToastStore()
</script>

<template>
  <div class="toast-host">
    <transition-group name="toast-list" tag="div">
      <v-alert
        v-for="t in toast.toasts"
        :key="t.id"
        :type="t.color"
        variant="tonal"
        class="glass-card mb-2 toast-item"
        density="comfortable"
        closable
        @click:close="toast.dismiss(t.id)"
      >
        {{ t.message }}
      </v-alert>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 3000;
  width: min(360px, 90vw);
}
.toast-item {
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.toast-list-enter-active, .toast-list-leave-active {
  transition: all .3s ease;
}
.toast-list-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>

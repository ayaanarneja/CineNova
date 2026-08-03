<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import AppBar from '@/components/common/AppBar.vue'
import BottomNav from '@/components/common/BottomNav.vue'
import ToastHost from '@/components/common/ToastHost.vue'

const route = useRoute()
const auth = useAuthStore()
const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

const showChrome = computed(() => !route.meta.hideChrome)

watch(
  () => themeStore.vuetifyThemeName,
  (name) => {
    vuetifyTheme.global.name.value = name
  },
  { immediate: true }
)
</script>

<template>
  <v-app>
    <div class="bg-animated">
      <div class="bg-blob-cyan"></div>
    </div>
    <AppBar v-if="showChrome && auth.isLoggedIn" />

    <v-main>
      <router-view v-slot="{ Component, route: r }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="r.fullPath" />
        </transition>
      </router-view>
    </v-main>

    <BottomNav v-if="showChrome && auth.isLoggedIn" />
    <ToastHost />
  </v-app>
</template>

<style scoped>
.v-main {
  min-height: 100vh;
}
</style>

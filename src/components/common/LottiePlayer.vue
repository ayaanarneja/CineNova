<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import lottie from 'lottie-web'
import loadingAnim from '@/assets/lottie/loading.json'

const props = defineProps({
  width: { type: [Number, String], default: 120 },
  height: { type: [Number, String], default: 120 },
  loop: { type: Boolean, default: true },
  autoplay: { type: Boolean, default: true }
})

const container = ref(null)
let instance = null

onMounted(() => {
  instance = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    animationData: loadingAnim
  })
})

onBeforeUnmount(() => {
  instance?.destroy()
})
</script>

<template>
  <div ref="container" :style="{ width: `${width}px`, height: `${height}px` }"></div>
</template>

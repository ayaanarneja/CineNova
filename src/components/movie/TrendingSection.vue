<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { useToastStore } from '@/stores/toast'
import { useBrokenImages } from '@/composables/useImageFallback'

const props = defineProps({
  movies: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const router = useRouter()
const auth = useAuthStore()
const wishlist = useWishlistStore()
const toast = useToastStore()
const { resolve, markBroken } = useBrokenImages()

/* ---------------- genre filter chips ---------------- */
const genreFilters = ['All', 'Action', 'Comedy', 'Horror', 'Sci-Fi', 'Romance']
const activeGenre = ref('All')

const filteredMovies = computed(() => {
  if (activeGenre.value === 'All') return props.movies
  return props.movies.filter((m) => m.genre?.some((g) => g.toLowerCase() === activeGenre.value.toLowerCase()))
})

/* ---------------- helpers ---------------- */
function formatDuration(mins) {
  if (!mins) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

function ratingOf(movie) {
  return movie.rating ? movie.rating.toFixed(1) : 'NEW'
}

function isTop10(index) {
  return index < 10
}

/* ---------------- carousel scroll + arrows ---------------- */
const scroller = ref(null)
const trackRef = ref(null)
const sectionRef = ref(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(true)
const isTouch = ref(false)

function updateArrows() {
  const el = scroller.value
  if (!el) return
  showLeftArrow.value = el.scrollLeft > 8
  showRightArrow.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 8
}

function scrollBy(amount) {
  scroller.value?.scrollBy({ left: amount, behavior: 'smooth' })
}

/* ---------------- autoscroll (pause on hover) ---------------- */
let autoTimer = null
let isHovering = false

function startAutoScroll() {
  stopAutoScroll()
  autoTimer = setInterval(() => {
    const el = scroller.value
    if (!el || isHovering) return
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
    if (atEnd) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      el.scrollBy({ left: 264, behavior: 'smooth' })
    }
  }, 4200)
}
function stopAutoScroll() {
  if (autoTimer) clearInterval(autoTimer)
}
function onEnter() {
  isHovering = true
}
function onLeave() {
  isHovering = false
}

/* ---------------- fade-in on viewport entry ---------------- */
let observer = null
onMounted(async () => {
  isTouch.value = window.matchMedia('(hover: none)').matches
  await nextTick()
  updateArrows()
  startAutoScroll()

  if (sectionRef.value) {
    gsap.set(sectionRef.value, { opacity: 0, y: 30 })
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(sectionRef.value, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15 }
    )
    observer.observe(sectionRef.value)
  }
})
onBeforeUnmount(() => {
  stopAutoScroll()
  observer?.disconnect()
})

/* ---------------- 3-5deg tilt on hover ---------------- */
function onCardMove(e) {
  const card = e.currentTarget
  const rect = card.getBoundingClientRect()
  const px = (e.clientX - rect.left) / rect.width
  const py = (e.clientY - rect.top) / rect.height
  const tiltX = (py - 0.5) * -6
  const tiltY = (px - 0.5) * 6
  card.style.setProperty('--tilt-x', `${tiltX}deg`)
  card.style.setProperty('--tilt-y', `${tiltY}deg`)
}
function onCardLeave(e) {
  e.currentTarget.style.setProperty('--tilt-x', '0deg')
  e.currentTarget.style.setProperty('--tilt-y', '0deg')
}

/* ---------------- actions ---------------- */
function openMovie(id) {
  router.push(`/movie/${id}`)
}
function bookNow(e, id) {
  e.stopPropagation()
  router.push(`/movie/${id}/theatres`)
}
async function toggleWishlist(e, movie) {
  e.stopPropagation()
  if (!auth.user) {
    toast.error('Please log in to use wishlist')
    return
  }
  const added = await wishlist.toggle(auth.user.id, movie)
  toast.success(added ? 'Added to wishlist' : 'Removed from wishlist')
}
</script>

<template>
  <section ref="sectionRef" class="trending-section my-8" v-if="loading || movies.length">
    <div class="trending-bg"></div>

    <div class="section-header d-flex align-end justify-space-between flex-wrap ga-3 px-1 mb-4">
      <div>
        <h3 class="trending-title">🔥 Trending Now</h3>
        <p class="trending-subtitle">Discover what everyone's watching</p>
      </div>
      <button class="view-all-btn" @click="router.push('/search')">
        View All <span class="arrow">→</span>
      </button>
    </div>

    <!-- genre filter chips -->
    <div class="genre-chips px-1 mb-5">
      <button
        v-for="g in genreFilters"
        :key="g"
        class="genre-chip"
        :class="{ active: activeGenre === g }"
        @click="activeGenre = g"
      >
        {{ g }}
      </button>
    </div>

    <div class="carousel-wrap" @mouseenter="onEnter" @mouseleave="onLeave">
      <button
        v-if="!isTouch && showLeftArrow"
        class="nav-arrow nav-arrow--left"
        @click="scrollBy(-560)"
        aria-label="Scroll left"
      >
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z"/></svg>
      </button>

      <div ref="scroller" class="trending-scroller" @scroll="updateArrows">
        <div ref="trackRef" class="trending-track">
          <template v-if="loading">
            <div v-for="n in 6" :key="n" class="trending-item skeleton-item">
              <div class="skeleton-shimmer"></div>
            </div>
          </template>

          <template v-else>
            <div
              v-for="(movie, index) in filteredMovies"
              :key="movie.id"
              class="trending-item"
              @mousemove="onCardMove"
              @mouseleave="onCardLeave"
              @click="openMovie(movie.id)"
            >
              <span v-if="isTop10(index)" class="rank-number">{{ index + 1 }}</span>

              <div class="poster-frame">
                <img
                  :src="resolve(movie.id, movie.poster)"
                  :alt="movie.title"
                  class="poster-img"
                  loading="lazy"
                  @error="markBroken(movie.id)"
                />

                <div class="top-badges">
                  <span class="badge badge--trending">🔥 Trending</span>
                  <span class="badge badge--rating">⭐ {{ ratingOf(movie) }}</span>
                </div>
                <span class="badge badge--quality">4K</span>

                <div class="popularity-track">
                  <div class="popularity-fill" :style="{ width: Math.min(100, 60 + (10 - index) * 4) + '%' }"></div>
                </div>

                <div class="hover-panel">
                  <button class="hover-action hover-action--primary" @click="bookNow($event, movie.id)">
                    <span>▶</span> Book Now
                  </button>
                  <div class="hover-action-row">
                    <button
                      class="hover-action hover-action--icon"
                      :class="{ active: wishlist.isWishlisted(movie.id) }"
                      @click="toggleWishlist($event, movie)"
                    >
                      ❤ Wishlist
                    </button>
                    <button class="hover-action hover-action--icon" @click.stop="openMovie(movie.id)">
                      ⓘ Details
                    </button>
                  </div>
                </div>

                <div class="glass-info">
                  <div class="glass-title text-truncate">{{ movie.title }}</div>
                  <div class="glass-meta">
                    <span>⭐ {{ ratingOf(movie) }}</span>
                    <span class="dot">•</span>
                    <span class="text-truncate">{{ movie.genre?.slice(0, 2).join(' • ') }}</span>
                    <template v-if="movie.duration">
                      <span class="dot">•</span>
                      <span>{{ formatDuration(movie.duration) }}</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <button
        v-if="!isTouch && showRightArrow"
        class="nav-arrow nav-arrow--right"
        @click="scrollBy(560)"
        aria-label="Scroll right"
      >
        <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="m8.6 16.6 1.4 1.4 6-6-6-6-1.4 1.4 4.6 4.6z"/></svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
.trending-section {
  position: relative;
  padding: 12px 0 4px;
}
.trending-bg {
  position: absolute;
  inset: -20px -16px;
  z-index: -1;
  border-radius: 32px;
  background: radial-gradient(circle at top, rgba(177, 92, 255, 0.16), transparent 60%);
  pointer-events: none;
}

/* header */
.trending-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.2px;
  margin: 0;
  background: linear-gradient(90deg, var(--heading-grad-start), var(--heading-grad-end));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.trending-subtitle {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.view-all-btn {
  background: transparent;
  border: none;
  color: var(--neon-cyan, #00e5c7);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 4px;
  transition: transform 0.2s ease, color 0.2s ease;
}
.view-all-btn .arrow {
  transition: transform 0.25s var(--ease-smooth, ease);
}
.view-all-btn:hover {
  color: var(--neon-pink, #ff4da6);
}
.view-all-btn:hover .arrow {
  transform: translateX(4px);
}

/* genre chips */
.genre-chips {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
}
.genre-chips::-webkit-scrollbar { display: none; }
.genre-chip {
  flex: 0 0 auto;
  padding: 7px 18px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--chip-text);
  background: var(--chip-bg);
  border: 1px solid var(--glass-border);
  cursor: pointer;
  transition: all 0.25s var(--ease-smooth, ease);
}
.genre-chip:hover {
  border-color: rgba(177, 92, 255, 0.4);
  color: var(--text-primary);
  background: var(--chip-bg-hover);
  transform: translateY(-1px);
}
.genre-chip.active {
  color: #fff;
  background: linear-gradient(90deg, var(--neon-purple, #b15cff), var(--neon-pink, #ff4da6));
  border-color: transparent;
  box-shadow: 0 6px 18px rgba(177, 92, 255, 0.35);
}

/* carousel */
.carousel-wrap {
  position: relative;
}
.trending-scroller {
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 10px 4px 14px;
}
.trending-track {
  display: flex;
  gap: 22px;
}
.trending-item {
  position: relative;
  flex: 0 0 190px;
  width: 190px;
  scroll-snap-align: start;
  cursor: pointer;
  perspective: 900px;
}

.rank-number {
  position: absolute;
  left: -8px;
  bottom: -18px;
  font-size: 5.5rem;
  font-weight: 900;
  line-height: 1;
  z-index: 0;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--glass-border);
  font-family: 'Poppins', sans-serif;
  pointer-events: none;
  user-select: none;
}

.poster-frame {
  position: relative;
  z-index: 1;
  aspect-ratio: 2 / 3;
  height: 250px;
  border-radius: 22px;
  overflow: hidden;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(1);
  transition: transform 0.35s var(--ease-smooth, ease), box-shadow 0.35s var(--ease-smooth, ease), border-color 0.35s ease;
  transform-style: preserve-3d;
}
.trending-item:hover .poster-frame {
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(1.06) translateY(-8px);
  box-shadow: 0 26px 55px rgba(177, 92, 255, 0.35), 0 0 30px rgba(124, 92, 255, 0.35);
  border-color: rgba(177, 92, 255, 0.5);
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.96);
  transition: filter 0.35s ease, transform 0.5s var(--ease-smooth, ease);
}
.trending-item:hover .poster-img {
  filter: brightness(1.08);
  transform: scale(1.03);
}

.top-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2;
}
.badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  backdrop-filter: blur(8px);
  width: fit-content;
  white-space: nowrap;
}
.badge--trending {
  background: rgba(255, 77, 166, 0.25);
  color: #ffd7ea;
  border: 1px solid rgba(255, 77, 166, 0.4);
}
.badge--rating {
  background: rgba(255, 193, 7, 0.2);
  color: #ffe083;
  border: 1px solid rgba(255, 193, 7, 0.35);
}
.badge--quality {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  background: rgba(0, 229, 199, 0.2);
  color: #b6fff1;
  border: 1px solid rgba(0, 229, 199, 0.4);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  backdrop-filter: blur(8px);
}

.popularity-track {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 66px;
  height: 3px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.15);
  overflow: hidden;
  z-index: 2;
}
.popularity-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--neon-cyan, #00e5c7), var(--neon-purple, #b15cff));
}

.glass-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 18px 10px 10px;
  background: linear-gradient(0deg, rgba(6, 4, 14, 0.92) 15%, rgba(6, 4, 14, 0.55) 65%, transparent 100%);
  backdrop-filter: blur(2px);
}
.glass-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 3px;
}
.glass-meta {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.65);
  overflow: hidden;
}
.glass-meta .dot { opacity: 0.5; }

.hover-panel {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(0deg, rgba(11, 6, 24, 0.92) 30%, rgba(11, 6, 24, 0.35) 75%, transparent 100%);
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s var(--ease-smooth, ease), transform 0.3s var(--ease-smooth, ease);
}
.trending-item:hover .hover-panel {
  opacity: 1;
  transform: translateY(0);
}
.hover-action {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 7px 8px;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.hover-action--primary {
  background: linear-gradient(90deg, var(--neon-purple, #b15cff), var(--neon-pink, #ff4da6));
  border: none;
  box-shadow: 0 6px 18px rgba(177, 92, 255, 0.4);
}
.hover-action--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(177, 92, 255, 0.55);
}
.hover-action-row {
  display: flex;
  gap: 6px;
}
.hover-action--icon {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
}
.hover-action--icon:hover {
  background: rgba(255, 255, 255, 0.16);
}
.hover-action--icon.active {
  color: var(--neon-pink, #ff4da6);
  border-color: rgba(255, 77, 166, 0.4);
}

/* nav arrows */
.nav-arrow {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  z-index: 4;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--glass-border);
  background: var(--navbar-bg);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.2s ease, background 0.2s ease;
}
.carousel-wrap:hover .nav-arrow {
  opacity: 1;
}
.nav-arrow:hover {
  background: rgba(177, 92, 255, 0.35);
  transform: translateY(-50%) scale(1.08);
}
.nav-arrow--left { left: -6px; }
.nav-arrow--right { right: -6px; }

/* skeleton */
.skeleton-item {
  flex: 0 0 190px;
  width: 190px;
  height: 250px;
  border-radius: 22px;
  overflow: hidden;
  position: relative;
  background: var(--glass-bg);
}
.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 150% 0; }
  100% { background-position: -50% 0; }
}

@media (max-width: 600px) {
  .trending-item, .skeleton-item { flex-basis: 44vw; width: 44vw; }
  .poster-frame { height: auto; }
  .rank-number { font-size: 4rem; }
  .nav-arrow { display: none; }
}
</style>

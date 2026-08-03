import { reactive } from 'vue'

// Local placeholder assets - always available, never broken, no network dependency.
export const POSTER_PLACEHOLDER = '/posters/placeholder.svg'
export const BACKDROP_PLACEHOLDER = '/posters/placeholder-backdrop.svg'

/**
 * useBrokenImages
 * Tracks which image "keys" (usually a movie/booking id, or a fixed
 * string for single-image views) have failed to load, so templates can
 * swap in a local placeholder instead of ever showing a broken-image icon.
 *
 * Usage in a v-for list:
 *   const { resolve, markBroken } = useBrokenImages()
 *   <v-img :src="resolve(movie.id, movie.poster)" @error="markBroken(movie.id)" />
 *
 * Usage for a single image (e.g. a details page):
 *   <v-img :src="resolve('poster', movie.poster)" @error="markBroken('poster')" />
 */
export function useBrokenImages(placeholder = POSTER_PLACEHOLDER) {
  const broken = reactive(new Set())

  function markBroken(key) {
    broken.add(key)
  }

  function isBroken(key) {
    return broken.has(key)
  }

  function resolve(key, url) {
    if (!url || isBroken(key)) return placeholder
    return url
  }

  return { markBroken, isBroken, resolve }
}

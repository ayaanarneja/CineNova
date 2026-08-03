import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'
import { useToastStore } from '@/stores/toast'

/**
 * Every screen in the booking flow (seats -> food -> checkout -> payment)
 * needs the same two checks before it can render:
 *   1. Has a movie/theatre/showtime actually been selected? (no direct
 *      deep-linking into the middle of the flow with empty state)
 *   2. Has the selected showtime crossed while the user was browsing?
 * This used to be copy-pasted (slightly differently) in four separate
 * views. Centralizing it here means there's exactly one place that
 * decides what "an invalid booking flow state" means.
 */
export function useBookingFlowGuard() {
  const router = useRouter()
  const booking = useBookingStore()
  const toast = useToastStore()

  onMounted(() => {
    if (!booking.movie || !booking.theatre || !booking.showtime) {
      router.replace('/')
      return
    }
    if (booking.isSelectedShowExpired()) {
      toast.warning('This show has already crossed. Please choose another showtime.')
      const movieId = booking.movie.id
      booking.resetContext()
      router.replace(`/movie/${movieId}/theatres`)
    }
  })

  return { booking }
}

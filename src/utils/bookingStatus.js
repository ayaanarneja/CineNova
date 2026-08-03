import { isShowtimePast } from './date'

/**
 * Bookings are written as `status: 'upcoming'` at confirmation time and
 * `status: 'cancelled'` when the user cancels — but nothing ever flips a
 * booking to 'completed' once its showtime has actually passed. This meant
 * a ticket booked for last week would sit in "Upcoming" forever.
 *
 * This derives the *real* lifecycle state client-side, using the stored
 * status as the source of truth for anything terminal (cancelled), and
 * comparing the showtime against "now" for everything else. It never
 * throws on malformed/legacy records — those are treated as 'unknown' so
 * the UI can skip them instead of crashing.
 */
export function deriveBookingStatus(booking, now = new Date()) {
  if (!booking) return 'unknown'
  if (booking.status === 'cancelled') return 'cancelled'
  if (!booking.date || !booking.showtime?.time) return 'unknown'

  return isShowtimePast(booking.date, booking.showtime.time, now) ? 'completed' : 'upcoming'
}

/** A booking is well-formed enough to safely render in the UI. */
export function isValidBooking(booking) {
  return !!(
    booking &&
    booking.movie?.title &&
    booking.theatre?.name &&
    booking.showtime?.time &&
    booking.date &&
    Array.isArray(booking.seats) &&
    booking.pricing
  )
}

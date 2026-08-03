# CineNova Refactor Notes

The existing codebase (Vue 3 + Vuetify 3 + Pinia + json-server) already had a
strong Gen-Z glassmorphism visual foundation — neon gradients, glass cards,
animated blobs, skeleton loaders, GSAP transitions. This pass focused on the
**booking-lifecycle correctness bugs** underneath that UI, plus targeted
polish, since those were the actual source of "blank page" / stale-state
issues rather than the visual layer.

## Root-cause bugs fixed

1. **Expired shows were bookable forever.**
   Nothing ever compared a showtime's date/time against "now". Users could
   select and pay for a show that already started.
   → Added `utils/date.js: parseShowDateTime / isShowtimePast`, enforced in
   `stores/theatres.js` (flags each showtime `expired`), `stores/booking.js`
   (`setContext` now throws on a past show, `isSelectedShowExpired()`), and
   re-checked again immediately before charging in `Payment.vue`.

2. **Confirmed bookings never became "Completed".**
   `status: 'upcoming'` was written once at booking time and never revisited,
   so a ticket from last week stayed in the Upcoming tab indefinitely.
   → Added `utils/bookingStatus.js: deriveBookingStatus()`, which computes
   upcoming/completed/cancelled live from the showtime instead of trusting
   the stored field. `stores/bookings.js` now derives tab membership from
   this, and background-syncs the transition to json-server
   (`syncExpiredStatuses()`) so it persists correctly across refreshes/devices.

3. **"Show Crossed" wasn't surfaced anywhere.**
   → `TheatreSelection.vue` now greys out and labels past showtime slots
   "Show Crossed" and blocks selecting them. `Ticket.vue` / `MyBookings.vue`
   now show a "SHOW CROSSED" chip on completed tickets instead of a stale
   "UPCOMING" badge.

4. **Blank-page risk on Confirmation/Ticket pages.**
   Both pages fetched a booking with no error handling — a failed fetch,
   deleted booking, or bad URL rendered nothing. Both now: (a) read the
   just-confirmed booking straight from the booking store instantly (no
   network round-trip needed right after payment), (b) fall back to a
   fetch for refreshes/shared links, and (c) show a proper error card with
   a way back instead of an infinite spinner or blank screen.

5. **A malformed legacy record in `db.json`.**
   One seed booking used an old schema (`movieId`/`theatreId` instead of
   nested `movie`/`theatre`/`showtime` objects, no `userId`) that would have
   crashed `MyBookings.vue` (`b.movie.title` on `undefined`) if it ever
   matched a user. Removed it, and added `utils/bookingStatus.js:
   isValidBooking()` so any future malformed record is filtered out instead
   of crashing the page.

6. **Duplicated booking-flow guard.**
   `if (!booking.movie) router.replace('/')` was copy-pasted with slight
   variations across `SeatSelection`, `FoodSelection`, `Checkout`, and
   `Payment`. Replaced with one shared
   `composables/useBookingFlowGuard.js`, which also re-validates the
   selected showtime hasn't expired since the user started checkout.

## Smaller polish

- `stores/booking.js` gained `resetContext()` (clears the *entire* flow
  state, not just the cart) used after a successful payment.
- Added `aria-label`s to the repeated icon-only back button across the
  booking flow.
- `Ticket.vue` ticket card now animates in on load (subtle reveal), and
  guards QR/barcode rendering against missing refs.

## Not changed

The visual design system (`assets/styles/main.scss`, glass-card/neon-btn
utility classes, animated background blobs, skeleton loaders) was already
solid and was left as-is rather than re-skinned from scratch — the effort
went into making the booking lifecycle actually correct underneath it.

## Running it

```bash
npm install
npm run dev:full   # regenerates today-relative showtimes, then runs json-server + vite together
```

Demo logins: `demo@cinenova.com` / `demo1234` (customer),
`admin@cinenova.com` / `admin1234` (admin).

// scripts/seed-showtimes.mjs
//
// Regenerates the `showtimes` collection inside db.json so the app always has
// bookable shows "today" onward, no matter when the project is actually run.
//
// Root cause this fixes: db.json previously shipped with showtimes hardcoded
// to a fixed past date range. The frontend (see src/utils/date.js:nextNDays)
// only ever asks for "today .. today+6", so once real time moved past the
// hardcoded dates, every theatre/date combination came back empty and the UI
// showed "No shows available for booking right now".
//
// GUARANTEE: for every movie, every theatre, and every one of the next
// DAYS_AHEAD days, showtimes are generated using that theatre's brand-specific
// lineup (see BRAND_SLOTS) — 4 shows/day for PVR, INOX, Cinepolis, and Miraj
// (each brand's 4 times are unique across all brands, so no two brands ever
// share a showtime), or the generic 3-show Morning/Afternoon/Evening lineup
// for any other brand — so the booking flow, theatre listings, movie details,
// search filters, and the schedule UI never hit an empty "No shows available"
// state for a movie that is actually playing. Seat availability/pricing is
// generated deterministically per-showtime-id on the client (see
// src/utils/seatLayout.js), so every showtime produced here is automatically
// fully bookable — no extra seed data needed for that part.
//
// This script runs automatically before `npm run server` / `npm run dev:full`
// (see package.json "pre*" hooks) so the show dates are always relative to
// the actual current date.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'db.json')

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

// Screens are purely cosmetic labels shown in the UI (see Ticket.vue) — the
// app never checks for screen-time conflicts — so we can safely rotate every
// movie/day/theatre combo across all 4 formats for variety without any risk
// of "double-booking" a screen breaking anything.
const SCREENS = [
  { name: 'Screen 1 - IMAX', format: 'IMAX' },
  { name: 'Screen 2 - 4DX', format: '4DX' },
  { name: 'Screen 3 - LUXE', format: 'LUXE' },
  { name: 'Screen 4', format: 'Standard' }
]

// The default 3 guaranteed daily slots for any theatre brand that isn't
// given its own custom lineup below (Morning/Afternoon/Evening spread,
// spaced >= 4h15m apart so even the longest film in the catalog never runs
// into the next slot).
const REQUIRED_SLOTS = [
  { time: '10:00 AM', period: 'Morning' },
  { time: '02:30 PM', period: 'Afternoon' },
  { time: '07:30 PM', period: 'Evening' }
]

// Per-brand showtime lineups. Each brand gets its own fixed set of 4 daily
// slots, deliberately offset from every other brand so that no two brands
// ever share a showtime (checked: 09:35/12:50/16:05/19:20 for PVR,
// 10:15/13:40/17:05/20:30 for INOX, 11:00/14:10/18:00/21:20 for Cinepolis,
// 09:50/13:05/16:40/20:10 for Miraj — all 16 times are distinct).
const BRAND_SLOTS = {
  PVR: [
    { time: '09:35 AM', period: 'Morning' },
    { time: '12:50 PM', period: 'Afternoon' },
    { time: '04:05 PM', period: 'Afternoon' },
    { time: '07:20 PM', period: 'Evening' }
  ],
  INOX: [
    { time: '10:15 AM', period: 'Morning' },
    { time: '01:40 PM', period: 'Afternoon' },
    { time: '05:05 PM', period: 'Evening' },
    { time: '08:30 PM', period: 'Evening' }
  ],
  Cinepolis: [
    { time: '11:00 AM', period: 'Morning' },
    { time: '02:10 PM', period: 'Afternoon' },
    { time: '06:00 PM', period: 'Evening' },
    { time: '09:20 PM', period: 'Night' }
  ],
  Miraj: [
    { time: '09:50 AM', period: 'Morning' },
    { time: '01:05 PM', period: 'Afternoon' },
    { time: '04:40 PM', period: 'Afternoon' },
    { time: '08:10 PM', period: 'Evening' }
  ]
}

// Picks the right slot lineup for a theatre based on the brand name in its
// `name` field, falling back to the generic REQUIRED_SLOTS for any theatre
// brand that doesn't have a custom lineup (e.g. Wave Cinemas, Carnival,
// Opulent Mall).
function getSlotsForTheatre(theatre) {
  for (const brand of Object.keys(BRAND_SLOTS)) {
    if (theatre.name.includes(brand)) return BRAND_SLOTS[brand]
  }
  return REQUIRED_SLOTS
}

const DAYS_AHEAD = 7 // today + next 6 days

function generateShowtimes(movies, theatres) {
  const showtimes = []
  let counter = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let dayOffset = 0; dayOffset < DAYS_AHEAD; dayOffset++) {
    const date = new Date(today)
    date.setDate(today.getDate() + dayOffset)
    const dateStr = toISODate(date)

    for (const theatre of theatres) {
      const slotsForTheatre = getSlotsForTheatre(theatre)

      movies.forEach((movie, movieIdx) => {
        const languages = movie.language && movie.language.length ? movie.language : ['Hindi']

        // Every movie gets its own guaranteed set of shows in this theatre,
        // on this date — no matter how many movies or theatres are in the
        // catalog. Screen/format/language are rotated per movie so the
        // lineup still looks varied, not just repeated slots. Which times
        // are used depends on the theatre's brand (see BRAND_SLOTS above),
        // so no two brands ever show at the same time.
        slotsForTheatre.forEach((slot, slotIdx) => {
          const screen = SCREENS[(movieIdx + slotIdx) % SCREENS.length]
          const language = languages[(movieIdx + slotIdx) % languages.length]

          showtimes.push({
            id: `s${counter++}`,
            movieId: movie.id,
            theatreId: theatre.id,
            date: dateStr,
            time: slot.time,
            period: slot.period,
            screen: screen.name,
            language,
            format: screen.format,
            // Matches the fixed 10-row x 12-seat layout generated by
            // src/utils/seatLayout.js (3 Economy + 3 Gold + 2 Premium + 2 VIP
            // rows = 120 seats). This field is informational only — actual
            // per-seat availability is always derived live from the seat map,
            // never from this static count.
            totalSeats: 120,
            availableSeats: 120,
            status: 'open'
          })
        })
      })
    }
  }

  return showtimes
}

function main() {
  const raw = readFileSync(DB_PATH, 'utf-8')
  const db = JSON.parse(raw)

  if (!Array.isArray(db.movies) || !db.movies.length) {
    throw new Error('db.json has no movies to schedule showtimes for')
  }
  if (!Array.isArray(db.theatres) || !db.theatres.length) {
    throw new Error('db.json has no theatres to schedule showtimes for')
  }

  const showtimes = generateShowtimes(db.movies, db.theatres)
  db.showtimes = showtimes

  writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + '\n')

  const expected = db.theatres.reduce(
    (sum, theatre) => sum + db.movies.length * DAYS_AHEAD * getSlotsForTheatre(theatre).length,
    0
  )
  console.log(
    `[seed-showtimes] Generated ${showtimes.length} showtimes for ${db.movies.length} movies x ` +
      `${db.theatres.length} theatres x ${DAYS_AHEAD} days ` +
      `(4 shows/day for PVR, INOX, Cinepolis & Miraj; 3 shows/day for other brands, expected ${expected}) ` +
      `starting ${toISODate(new Date())}.`
  )
}

main()

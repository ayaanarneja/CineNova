// Generates a deterministic seat layout for a given showtime.
// Categories from front to back: Economy, Gold, Premium, VIP
export const SEAT_CATEGORIES = [
  { key: 'economy', label: 'Economy', price: 150, rows: ['H', 'I', 'J'], color: '#5CC8FF' },
  { key: 'gold', label: 'Gold', price: 220, rows: ['E', 'F', 'G'], color: '#FFC24D' },
  { key: 'premium', label: 'Premium', price: 320, rows: ['C', 'D'], color: '#B15CFF' },
  { key: 'vip', label: 'VIP Recliner', price: 480, rows: ['A', 'B'], color: '#FF4DA6' }
]

const SEATS_PER_ROW = 12

// simple deterministic pseudo-random based on a seed string
function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1)
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61)
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296
  }
}

export function generateSeatMap(showtimeId) {
  const rand = seededRandom(showtimeId || 'default')
  const rows = []

  SEAT_CATEGORIES.forEach((cat) => {
    cat.rows.forEach((rowLetter) => {
      const seats = []
      for (let i = 1; i <= SEATS_PER_ROW; i++) {
        const isBooked = rand() < 0.22
        seats.push({
          id: `${rowLetter}${i}`,
          row: rowLetter,
          number: i,
          category: cat.key,
          price: cat.price,
          status: isBooked ? 'booked' : 'available'
        })
      }
      rows.push({ row: rowLetter, category: cat.key, seats })
    })
  })

  return rows
}

export function categoryMeta(key) {
  return SEAT_CATEGORIES.find((c) => c.key === key)
}

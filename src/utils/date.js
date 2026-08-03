export function nextNDays(n = 5, base = new Date()) {
  const days = []
  for (let i = 0; i < n; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    days.push({
      date: d.toISOString().slice(0, 10),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    })
  }
  return days
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatDateTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * Parses a "YYYY-MM-DD" date string + a "hh:mm AM/PM" time string
 * into a real JS Date so shows can be compared against "now".
 * Returns `null` if either input is missing/unparseable, so callers
 * can decide how to treat unknown showtimes (never crash on it).
 */
export function parseShowDateTime(dateStr, timeStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null

  let hours = 0
  let minutes = 0
  if (timeStr) {
    const match = /^(\d{1,2}):(\d{2})\s*([AP]M)?$/i.exec(timeStr.trim())
    if (match) {
      hours = Number(match[1]) % 12
      minutes = Number(match[2])
      if (match[3]?.toUpperCase() === 'PM') hours += 12
    }
  }
  return new Date(y, m - 1, d, hours, minutes, 0, 0)
}

/** True once the given show's date+time is in the past relative to now. */
export function isShowtimePast(dateStr, timeStr, now = new Date()) {
  const showDate = parseShowDateTime(dateStr, timeStr)
  if (!showDate) return false
  return showDate.getTime() <= now.getTime()
}

export function isSameDay(dateStr, now = new Date()) {
  if (!dateStr) return false
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  return dateStr === today.toISOString().slice(0, 10)
}

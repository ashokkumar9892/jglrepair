export const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const currencyExact = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

/** yyyy-mm-dd -> local Date (avoids UTC shifting the day back) */
export const parseDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export const todayISO = () => toISODate(new Date())

export const toISODate = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export const addDays = (iso: string, days: number) => {
  const d = parseDay(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export const dayOffset = (days: number) => addDays(todayISO(), days)

export const formatDay = (iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  parseDay(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...opts,
  })

export const friendlyDay = (iso: string) => {
  const t = todayISO()
  if (iso === t) return 'Today'
  if (iso === addDays(t, 1)) return 'Tomorrow'
  if (iso === addDays(t, -1)) return 'Yesterday'
  return formatDay(iso)
}

export const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return formatDay(iso.slice(0, 10), { year: 'numeric' })
}

/** "8:00 AM - 10:00 AM" -> minutes from midnight for sorting */
export const windowStartMinutes = (window: string) => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(window.trim())
  if (!m) return 0
  let hour = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') hour += 12
  return hour * 60 + Number(m[2])
}

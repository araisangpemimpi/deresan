export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function monthKey(d: Date = new Date()): string {
  return toISODate(d).slice(0, 7) // YYYY-MM
}

export function daysInMonth(year: number, month1: number): Date[] {
  const days: Date[] = []
  const n = new Date(year, month1, 0).getDate()
  for (let i = 1; i <= n; i++) days.push(new Date(year, month1 - 1, i))
  return days
}

export function formatID(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
}

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${BULAN[m - 1]} ${y}`
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

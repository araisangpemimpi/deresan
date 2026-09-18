// Aturan kualitas per HALAMAN (jumlah salah saat setoran / murajaah 1 halaman)
// hijau: 0-1, kuning: 2-3, orange: 4-5, merah: >= 6
export type QualityColor = 'hijau' | 'kuning' | 'orange' | 'merah' | 'abu'

export function pageQuality(errors: number | null | undefined): QualityColor {
  if (errors === null || errors === undefined) return 'abu'
  if (errors <= 1) return 'hijau'
  if (errors <= 3) return 'kuning'
  if (errors <= 5) return 'orange'
  return 'merah'
}

// Aturan kualitas per JUZ (total salah dari 20 halaman)
// hijau: <= 5, kuning: 6-10, orange: 11-20, merah: > 20
export function juzQuality(totalErrors: number | null | undefined, filledPages: number): QualityColor {
  if (totalErrors === null || totalErrors === undefined || filledPages === 0) return 'abu'
  if (totalErrors <= 5) return 'hijau'
  if (totalErrors <= 10) return 'kuning'
  if (totalErrors <= 20) return 'orange'
  return 'merah'
}

export const QUALITY_META: Record<QualityColor, { label: string; hex: string; bg: string; text: string; desc: string }> = {
  hijau: { label: 'Hijau', hex: '#22c55e', bg: 'bg-green-500', text: 'text-green-600', desc: 'Lancar (≤1 salah/hlm, ≤5 salah/juz)' },
  kuning: { label: 'Kuning', hex: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-600', desc: 'Cukup (2–3 salah/hlm, 6–10/juz)' },
  orange: { label: 'Orange', hex: '#f97316', bg: 'bg-orange-500', text: 'text-orange-600', desc: 'Perlu perbaikan (4–5/hlm, 11–20/juz)' },
  merah: { label: 'Merah', hex: '#ef4444', bg: 'bg-red-500', text: 'text-red-600', desc: 'Wajib diulang (≥6/hlm, >20/juz)' },
  abu: { label: 'Belum dinilai', hex: '#e5e7eb', bg: 'bg-gray-200 dark:bg-gray-800', text: 'text-gray-400', desc: 'Belum ada data' },
}

export const HALAMAN_PER_JUZ = 20
export const TOTAL_JUZ = 30

/** Perkiraan halaman mushaf Madinah dari juz + halaman relatif (1-20). */
export function mushafPage(juz: number, halKe: number): number {
  const p = (juz - 1) * HALAMAN_PER_JUZ + halKe
  return Math.min(Math.max(p, 1), 604)
}

export function juzRange(juz: number): { from: number; to: number } {
  return { from: mushafPage(juz, 1), to: mushafPage(juz, HALAMAN_PER_JUZ) }
}

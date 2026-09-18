// Kualitas hafalan: errors per juz per halaman-relatif (1..20). Persist localStorage.
// Setiap ada perubahan, kondisi 30 juz hari itu otomatis dicatat ke histori
// (maks 1 entri per hari) — dari sinilah snapshot kualitas akhir bulan diturunkan.
import { defineStore } from 'pinia'
import { juzQuality, pageQuality, type QualityColor } from '~/utils/quran'
import { daysInMonth, monthKey, toISODate } from '~/utils/date'

const QUALITY_KEY = 'deresan:quality:v1'

// errors[juz][halKe] = jumlah salah
export type ErrorMap = Record<number, Record<number, number>>

/** Satu entri = kondisi 30 juz pada suatu tanggal (warna per juz). */
export interface QualityHistoryEntry {
  date: string // YYYY-MM-DD
  ts: number
  colors: QualityColor[] // index 0 = juz 1
}

interface QualityState {
  errors: ErrorMap
  updatedAt: Record<number, number>
  history: QualityHistoryEntry[]
}

function colorsOf(errors: ErrorMap): QualityColor[] {
  const out: QualityColor[] = []
  for (let j = 1; j <= 30; j++) {
    const vals = Object.values(errors[j] ?? {})
    out.push(juzQuality(vals.length ? vals.reduce((a, b) => a + b, 0) : null, vals.length))
  }
  return out
}

function loadQuality(): QualityState {
  const fallback: QualityState = { errors: {} as ErrorMap, updatedAt: {}, history: [] }
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(QUALITY_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    return { errors: data.errors ?? {}, updatedAt: data.updatedAt ?? {}, history: Array.isArray(data.history) ? data.history : [] }
  } catch { return fallback }
}

export const useQualityStore = defineStore('quality', {
  state: () => loadQuality(),
  getters: {
    pageErrors: (s) => (juz: number, halKe: number): number | null => {
      const v = s.errors[juz]?.[halKe]
      return typeof v === 'number' ? v : null
    },
    pageColor: (s) => (juz: number, halKe: number): QualityColor => {
      return pageQuality(s.errors[juz]?.[halKe])
    },
    juzStats: (s) => (juz: number): { total: number; filled: number; color: QualityColor } => {
      const pages = s.errors[juz] ?? {}
      const vals = Object.values(pages)
      const filled = vals.length
      const total = vals.reduce((a, b) => a + b, 0)
      return { total, filled, color: juzQuality(filled ? total : null, filled) }
    },
    /** Warna 30 juz untuk heatmap kualitas */
    allJuzColors(): QualityColor[] {
      return Array.from({ length: 30 }, (_, i) => this.juzStats(i + 1).color)
    },
    qualityCounts(): Record<QualityColor, number> {
      const c: Record<QualityColor, number> = { hijau: 0, kuning: 0, orange: 0, merah: 0, abu: 0 }
      for (let j = 1; j <= 30; j++) c[this.juzStats(j).color]++
      return c
    },
    /**
     * Kondisi kualitas akhir suatu bulan (otomatis, tanpa snapshot manual):
     * - bulan berjalan → kondisi live saat ini
     * - bulan lampau → histori terakhir pada/sebelum hari terakhir bulan itu
     * - null bila belum ada data sama sekali sampai saat itu
     */
    monthQuality: (s) => (month: string): { colors: QualityColor[]; date: string; live: boolean } | null => {
      const cur = monthKey()
      if (month === cur) return { colors: colorsOf(s.errors), date: toISODate(new Date()), live: true }
      if (month > cur) return null
      const [y, m] = month.split('-').map(Number)
      const lastDay = `${month}-${String(daysInMonth(y, m).length).padStart(2, '0')}`
      let best: QualityHistoryEntry | null = null
      for (const h of s.history) {
        if (h.date <= lastDay && (!best || h.date >= best.date)) best = h
      }
      if (!best) return null
      return { colors: best.colors, date: best.date, live: false }
    },
  },
  actions: {
    save() {
      if (import.meta.client) localStorage.setItem(QUALITY_KEY, JSON.stringify({ errors: this.errors, updatedAt: this.updatedAt, history: this.history }))
    },
    /** Catat kondisi hari ini ke histori (diam-diam, tanpa tombol). */
    recordHistory() {
      if (!import.meta.client) return
      const today = toISODate(new Date())
      const colors = colorsOf(this.errors)
      const existing = this.history.find(h => h.date === today)
      if (existing) {
        existing.colors = colors
        existing.ts = Date.now()
      } else {
        this.history.push({ date: today, ts: Date.now(), colors })
      }
      this.save()
    },
    setErrors(juz: number, halKe: number, errors: number | null) {
      if (errors === null) {
        if (this.errors[juz]) {
          delete this.errors[juz][halKe]
          if (Object.keys(this.errors[juz]).length === 0) delete this.errors[juz]
        }
      } else {
        if (!this.errors[juz]) this.errors[juz] = {}
        this.errors[juz][halKe] = Math.max(0, Math.min(99, Math.round(errors)))
      }
      this.updatedAt[juz] = Date.now()
      this.recordHistory()
    },
    clearJuz(juz: number) {
      delete this.errors[juz]
      delete this.updatedAt[juz]
      this.recordHistory()
    },
    reset() {
      this.errors = {}
      this.updatedAt = {}
      this.history = []
      this.save()
    },
    importData(errors: ErrorMap, history?: QualityHistoryEntry[]) {
      this.errors = errors
      if (Array.isArray(history)) this.history = history
      this.recordHistory()
    },
  },
})

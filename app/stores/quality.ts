// Kualitas hafalan: errors per juz per halaman-relatif (1..20). Persist localStorage.
import { defineStore } from 'pinia'
import { juzQuality, pageQuality, type QualityColor } from '~/utils/quran'

const QUALITY_KEY = 'deresan:quality:v1'

// errors[juz][halKe] = jumlah salah
export type ErrorMap = Record<number, Record<number, number>>

function loadQuality(): { errors: ErrorMap; updatedAt: Record<number, number> } {
  const fallback = { errors: {} as ErrorMap, updatedAt: {} as Record<number, number> }
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(QUALITY_KEY)
    if (!raw) return fallback
    const data = JSON.parse(raw)
    return { errors: data.errors ?? {}, updatedAt: data.updatedAt ?? {} }
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
  },
  actions: {
    save() {
      if (import.meta.client) localStorage.setItem(QUALITY_KEY, JSON.stringify({ errors: this.errors, updatedAt: this.updatedAt }))
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
      this.save()
    },
    clearJuz(juz: number) {
      delete this.errors[juz]
      delete this.updatedAt[juz]
      this.save()
    },
    reset() {
      this.errors = {}
      this.updatedAt = {}
      this.save()
    },
    importData(errors: ErrorMap) {
      this.errors = errors
      this.save()
    },
  },
})

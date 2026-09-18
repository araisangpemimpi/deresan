// Log murajaah harian. Satu entri = 1 juz selesai dibaca. Persist localStorage.
import { defineStore } from 'pinia'
import { monthKey, toISODate, uid } from '~/utils/date'

const MURAJAAH_KEY = 'deresan:murajaah:v1'

export interface MurajaahLog {
  id: string
  date: string // YYYY-MM-DD
  juz: number
  createdAt: number
}

function loadMurajaah(): MurajaahLog[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(MURAJAAH_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export const useMurajaahStore = defineStore('murajaah', {
  state: () => ({ logs: loadMurajaah() as MurajaahLog[] }),
  getters: {
    countByDate: (s) => {
      const map = new Map<string, number>()
      for (const l of s.logs) map.set(l.date, (map.get(l.date) ?? 0) + 1)
      return map
    },
    todayCount(): number {
      return this.countByDate.get(toISODate(new Date())) ?? 0
    },
    juzDoneToday(): number[] {
      const today = toISODate(new Date())
      return this.logs.filter(l => l.date === today).map(l => l.juz).sort((a, b) => a - b)
    },
    totalAll(): number {
      return this.logs.length
    },
    streak(): number {
      // berapa hari beruntun (sampai hari ini/kemarin) ada murajaah
      const set = new Set(this.logs.map(l => l.date))
      let n = 0
      const d = new Date()
      if (!set.has(toISODate(d))) d.setDate(d.getDate() - 1)
      while (set.has(toISODate(d))) { n++; d.setDate(d.getDate() - 1) }
      return n
    },
  },
  actions: {
    save() {
      if (import.meta.client) localStorage.setItem(MURAJAAH_KEY, JSON.stringify(this.logs))
    },
    addLog(juz: number, date: string = toISODate(new Date())) {
      this.logs.push({ id: uid(), date, juz, createdAt: Date.now() })
      this.save()
    },
    removeLog(id: string) {
      this.logs = this.logs.filter(l => l.id !== id)
      this.save()
    },
    clearDay(date: string) {
      this.logs = this.logs.filter(l => l.date !== date)
      this.save()
    },
    countForMonth(month: string): Map<string, number> {
      const map = new Map<string, number>()
      for (const l of this.logs) {
        if (l.date.startsWith(month)) map.set(l.date, (map.get(l.date) ?? 0) + 1)
      }
      return map
    },
    monthTotal(month: string = monthKey()): number {
      return this.logs.filter(l => l.date.startsWith(month)).length
    },
    importLogs(logs: MurajaahLog[]) {
      this.logs = logs
      this.save()
    },
    reset() {
      this.logs = []
      this.save()
    },
  },
})

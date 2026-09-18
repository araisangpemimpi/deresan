// Snapshot bulanan: bekukan total murajaah + distribusi kualitas per bulan.
import { defineStore } from 'pinia'
import { monthKey, uid } from '~/utils/date'
import type { QualityColor } from '~/utils/quran'

const SNAPSHOT_KEY = 'deresan:snapshots:v1'

export interface Snapshot {
  id: string
  month: string // YYYY-MM
  totalMurajaah: number
  quality: Record<QualityColor, number>
  note?: string
  createdAt: number
}

function loadSnapshots(): Snapshot[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export const useSnapshotStore = defineStore('snapshots', {
  state: () => ({ items: loadSnapshots() as Snapshot[] }),
  getters: {
    byMonth: (s) => {
      const map = new Map<string, Snapshot[]>()
      for (const it of [...s.items].sort((a, b) => b.month.localeCompare(a.month))) {
        if (!map.has(it.month)) map.set(it.month, [])
        map.get(it.month)!.push(it)
      }
      return map
    },
    months(): string[] {
      return [...new Set(this.items.map(i => i.month))].sort().reverse()
    },
  },
  actions: {
    save() {
      if (import.meta.client) localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(this.items))
    },
    take(totalMurajaah: number, quality: Record<QualityColor, number>, month: string = monthKey(), note?: string) {
      this.items.push({ id: uid(), month, totalMurajaah, quality, note, createdAt: Date.now() })
      this.save()
    },
    remove(id: string) {
      this.items = this.items.filter(i => i.id !== id)
      this.save()
    },
    reset() {
      this.items = []
      this.save()
    },
    importData(items: Snapshot[]) {
      this.items = items
      this.save()
    },
  },
})

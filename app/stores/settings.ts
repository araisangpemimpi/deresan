// Pengaturan target harian & juz wajib. Persist ke localStorage (full offline).
import { defineStore } from 'pinia'

const SETTINGS_KEY = 'deresan:settings:v1'

export interface SettingsState {
  targetJuzPerHari: number
  juzWajib: number[] // juz yang baru dihafal / sedang diperbaiki
  nama: string
}

function loadSettings(): SettingsState {
  const fallback: SettingsState = { targetJuzPerHari: 1, juzWajib: [30], nama: '' }
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch { return fallback }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => loadSettings(),
  actions: {
    save() {
      if (import.meta.client) localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.$state))
    },
    setTarget(n: number) {
      this.targetJuzPerHari = Math.min(30, Math.max(1, Math.round(n) || 1))
      this.save()
    },
    toggleWajib(juz: number) {
      const i = this.juzWajib.indexOf(juz)
      if (i >= 0) this.juzWajib.splice(i, 1)
      else this.juzWajib.push(juz)
      this.juzWajib.sort((a, b) => a - b)
      this.save()
    },
    setNama(nama: string) {
      this.nama = nama
      this.save()
    },
    reset() {
      this.targetJuzPerHari = 1
      this.juzWajib = [30]
      this.nama = ''
      this.save()
    },
    importJSON(json: string) {
      const data = JSON.parse(json)
      if (typeof data.targetJuzPerHari === 'number') this.targetJuzPerHari = data.targetJuzPerHari
      if (Array.isArray(data.juzWajib)) this.juzWajib = data.juzWajib.filter((x: unknown) => typeof x === 'number')
      if (typeof data.nama === 'string') this.nama = data.nama
      this.save()
    },
  },
})

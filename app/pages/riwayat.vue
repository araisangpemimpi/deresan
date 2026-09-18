<template>
  <div class="px-4 pt-5 space-y-4">
    <div>
      <h1 class="text-xl font-bold">Riwayat 🗂️</h1>
      <p class="text-xs text-gray-500">Progres per bulan: stagnan, maju, atau mundur.</p>
    </div>

    <UCard v-if="!murajaah.totalAll && !hasQuality" class="text-center text-sm text-gray-500">
      Belum ada data. Mulai deres di halaman Target dan nilai hafalan di halaman Kualitas — riwayat terbentuk otomatis.
    </UCard>

    <!-- Navigator bulan + pilihan heatmap -->
    <UCard>
      <div class="flex items-center justify-between">
        <UButton icon="i-lucide-chevron-left" variant="ghost" color="neutral" @click="shift(-1)" aria-label="Bulan sebelumnya" />
        <button class="text-center" @click="selMonth = curMonth">
          <p class="font-bold">{{ monthLabel(selMonth) }}</p>
          <p class="text-[11px]" :class="selMonth === curMonth ? 'text-emerald-600 font-medium' : 'text-gray-400'">
            {{ selMonth === curMonth ? '● bulan berjalan' : 'ketuk untuk ke bulan ini' }}
          </p>
        </button>
        <UButton icon="i-lucide-chevron-right" variant="ghost" color="neutral" :disabled="!canNext" @click="shift(1)" aria-label="Bulan berikutnya" />
      </div>
      <div class="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mt-3">
        <UButton
          icon="i-lucide-calendar-days" class="justify-center"
          :variant="view === 'deresan' ? 'solid' : 'ghost'"
          :color="view === 'deresan' ? 'success' : 'neutral'"
          @click="view = 'deresan'"
        >
          Deresan
        </UButton>
        <UButton
          icon="i-lucide-chart-column" class="justify-center"
          :variant="view === 'kualitas' ? 'solid' : 'ghost'"
          :color="view === 'kualitas' ? 'success' : 'neutral'"
          @click="view = 'kualitas'"
        >
          Kualitas
        </UButton>
      </div>
    </UCard>

    <!-- ============ HEATMAP DERESAN ============ -->
    <template v-if="view === 'deresan'">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-semibold text-sm">Heatmap deres — {{ monthLabel(selMonth) }}</h2>
            <UBadge :color="deresanDelta.color" variant="subtle" class="shrink-0">
              <UIcon :name="deresanDelta.icon" class="size-3.5" /> {{ deresanDelta.label }}
            </UBadge>
          </div>
        </template>
        <MurajaahHeatmap :month="selMonth" :counts="monthCounts" :target="target" />
      </UCard>

      <div class="grid grid-cols-2 gap-2 text-center">
        <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950 p-3">
          <p class="text-2xl font-extrabold text-emerald-600">{{ monthTotal }}</p>
          <p class="text-[11px] text-gray-500">total juz</p>
        </div>
        <div class="rounded-xl bg-sky-50 dark:bg-sky-950 p-3">
          <p class="text-2xl font-extrabold text-sky-600">{{ activeDays }}</p>
          <p class="text-[11px] text-gray-500">hari aktif</p>
        </div>
        <div class="rounded-xl bg-amber-50 dark:bg-amber-950 p-3">
          <p class="text-2xl font-extrabold text-amber-600">{{ avgPerDay }}</p>
          <p class="text-[11px] text-gray-500">rata-rata juz/hari</p>
        </div>
        <div class="rounded-xl bg-violet-50 dark:bg-violet-950 p-3">
          <p class="text-2xl font-extrabold text-violet-600">{{ hitDays }}</p>
          <p class="text-[11px] text-gray-500">hari capai target (≥{{ target }})</p>
        </div>
      </div>
    </template>

    <!-- ============ HEATMAP KUALITAS (otomatis) ============ -->
    <template v-else>
      <UCard>
        <template #header>
          <h2 class="font-semibold text-sm">Tren kualitas per bulan</h2>
          <p class="text-xs text-gray-500">Otomatis dari kondisi hari terakhir tiap bulan. Hijau bertambah = kemajuan 📈</p>
        </template>
        <div v-if="hasQuality" class="space-y-2.5">
          <div v-for="row in trendRows" :key="row.month" class="flex items-center gap-2">
            <button class="w-16 shrink-0 text-left text-[11px] font-medium" :class="row.month === selMonth ? 'text-emerald-600 font-bold' : 'text-gray-500'" @click="selMonth = row.month">
              {{ shortMonth(row.month) }}
            </button>
            <div class="flex-1 h-5 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-800" :class="row.month === selMonth ? 'ring-2 ring-emerald-600 ring-offset-1' : ''">
              <div class="bg-green-500 h-full" :style="{ width: pct30(row.counts.hijau) }" />
              <div class="bg-yellow-400 h-full" :style="{ width: pct30(row.counts.kuning) }" />
              <div class="bg-orange-500 h-full" :style="{ width: pct30(row.counts.orange) }" />
              <div class="bg-red-500 h-full" :style="{ width: pct30(row.counts.merah) }" />
            </div>
            <UIcon :name="row.icon" class="size-4 shrink-0" :class="row.cls" />
          </div>
          <div class="flex flex-wrap gap-2 pt-1 text-[11px] text-gray-500">
            <span class="inline-flex items-center gap-1"><span class="size-2.5 rounded-sm bg-green-500" />Hijau</span>
            <span class="inline-flex items-center gap-1"><span class="size-2.5 rounded-sm bg-yellow-400" />Kuning</span>
            <span class="inline-flex items-center gap-1"><span class="size-2.5 rounded-sm bg-orange-500" />Orange</span>
            <span class="inline-flex items-center gap-1"><span class="size-2.5 rounded-sm bg-red-500" />Merah</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Belum ada penilaian. Nilai hafalan di halaman Kualitas — tren terbentuk sendiri tiap ada perubahan 📊</p>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold text-sm">Kualitas — {{ monthLabel(selMonth) }}</h2>
          <p v-if="selData" class="text-xs text-gray-500">
            {{ selData.live ? 'Live kondisi hari ini (otomatis tersimpan)' : `Otomatis dari kondisi ${formatID(selData.date)}` }}
          </p>
        </template>
        <div v-if="selData" class="grid grid-cols-4 gap-1.5 text-center text-[11px]">
          <div v-for="c in qualityCols" :key="c.key" class="rounded-lg p-2" :class="c.bg">
            <p class="font-extrabold text-base" :class="c.text">{{ selCounts[c.key] }}</p>
            {{ c.label }}
            <p class="font-bold" :class="deltaCls(qualityDelta[c.key])">{{ deltaStr(qualityDelta[c.key]) }}</p>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">Belum ada data kualitas sampai {{ monthLabel(selMonth) }}.</p>
        <p v-if="selData && prevData" class="text-[11px] text-gray-400 mt-2">
          vs akhir {{ shortMonth(prevMonth) }}: {{ hijauVerdict }}
        </p>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { daysInMonth, formatID, monthKey, monthLabel, monthRange } from '~/utils/date'
import type { QualityColor } from '~/utils/quran'

const murajaah = useMurajaahStore()
const quality = useQualityStore()

const curMonth = computed(() => monthKey())
const selMonth = ref(curMonth.value)
const view = ref<'deresan' | 'kualitas'>('deresan')
const canNext = computed(() => selMonth.value < curMonth.value)

function shiftKey(key: string, d: number): string {
  const [y, m] = key.split('-').map(Number)
  const dt = new Date(y, m - 1 + d, 1)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}
function shift(d: number) {
  if (d > 0 && !canNext.value) return
  selMonth.value = shiftKey(selMonth.value, d)
}

const PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
function shortMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${PENDEK[m - 1]} ${String(y).slice(2)}`
}

function countColors(colors: QualityColor[]): Record<QualityColor, number> {
  const c: Record<QualityColor, number> = { hijau: 0, kuning: 0, orange: 0, merah: 0, abu: 0 }
  for (const x of colors) c[x]++
  return c
}

// ---------- Heatmap deres ----------
const target = computed(() => useSettingsStore().targetJuzPerHari)
const monthCounts = computed(() => murajaah.countForMonth(selMonth.value))
const monthTotal = computed(() => murajaah.monthTotal(selMonth.value))
const activeDays = computed(() => monthCounts.value.size)
const avgPerDay = computed(() => {
  const [y, m] = selMonth.value.split('-').map(Number)
  const n = daysInMonth(y, m).length
  return (monthTotal.value / n).toFixed(1).replace('.', ',')
})
const hitDays = computed(() => [...monthCounts.value.values()].filter(c => c >= target.value).length)

const prevMonth = computed(() => shiftKey(selMonth.value, -1))
const deresanDelta = computed<{ color: 'success' | 'error' | 'neutral'; icon: string; label: string }>(() => {
  const d = monthTotal.value - murajaah.monthTotal(prevMonth.value)
  if (d > 0) return { color: 'success', icon: 'i-lucide-trending-up', label: `+${d} vs bln lalu` }
  if (d < 0) return { color: 'error', icon: 'i-lucide-trending-down', label: `${d} vs bln lalu` }
  return { color: 'neutral', icon: 'i-lucide-minus', label: 'stagnan vs bln lalu' }
})

// ---------- Heatmap kualitas (otomatis akhir bulan) ----------
const hasQuality = computed(() => quality.history.length > 0 || Object.keys(quality.errors).length > 0)

const trendMonths = computed(() => {
  if (!quality.history.length) return [curMonth.value]
  const first = [...quality.history].map(h => h.date.slice(0, 7)).sort()[0]
  return monthRange(first, curMonth.value)
})

const trendRows = computed(() => {
  let prevHijau: number | null = null
  return trendMonths.value.map((m) => {
    const data = quality.monthQuality(m)!
    const counts = countColors(data.colors)
    const d = prevHijau === null ? 0 : counts.hijau - prevHijau
    prevHijau = counts.hijau
    return {
      month: m,
      counts,
      icon: d > 0 ? 'i-lucide-trending-up' : d < 0 ? 'i-lucide-trending-down' : 'i-lucide-minus',
      cls: d > 0 ? 'text-green-600' : d < 0 ? 'text-red-500' : 'text-gray-400',
    }
  })
})

const selData = computed(() => quality.monthQuality(selMonth.value))
const prevData = computed(() => quality.monthQuality(prevMonth.value))
const selCounts = computed(() => countColors(selData.value?.colors ?? []))

const qualityCols: { key: QualityColor; label: string; bg: string; text: string }[] = [
  { key: 'hijau', label: 'Hijau', bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-700' },
  { key: 'kuning', label: 'Kuning', bg: 'bg-yellow-100 dark:bg-yellow-950', text: 'text-yellow-700' },
  { key: 'orange', label: 'Orange', bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700' },
  { key: 'merah', label: 'Merah', bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-700' },
]

const qualityDelta = computed<Record<QualityColor, number | null>>(() => {
  const none = { hijau: null, kuning: null, orange: null, merah: null, abu: null } as Record<QualityColor, number | null>
  if (!selData.value || !prevData.value) return none
  const a = countColors(selData.value.colors)
  const b = countColors(prevData.value.colors)
  return { hijau: a.hijau - b.hijau, kuning: a.kuning - b.kuning, orange: a.orange - b.orange, merah: a.merah - b.merah, abu: null }
})
function deltaStr(n: number | null): string {
  if (n === null) return '—'
  if (n > 0) return `+${n}`
  return `${n}`
}
function deltaCls(n: number | null): string {
  if (n === null) return 'text-gray-300'
  if (n > 0) return 'text-green-600'
  if (n < 0) return 'text-red-500'
  return 'text-gray-400'
}
const hijauVerdict = computed(() => {
  const d = qualityDelta.value.hijau
  if (d === null) return ''
  if (d > 0) return `hijau +${d}: ada kemajuan 📈`
  if (d < 0) return `hijau ${d}: kemunduran, semangat lagi 💪`
  return 'hijau sama: stagnan ➖'
})

const pct30 = (n: number) => `${(n / 30) * 100}%`
</script>

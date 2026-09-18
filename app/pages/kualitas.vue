<template>
  <div class="px-4 pt-5 space-y-4">
    <div>
      <h1 class="text-xl font-bold">Kualitas hafalan 📊</h1>
      <p class="text-xs text-gray-500">Pilih juz → pilih halaman → masukkan jumlah kesalahan.</p>
    </div>

    <!-- Pilih juz -->
    <UCard>
      <template #header><h2 class="font-semibold text-sm">1. Pilih juz</h2></template>
      <QualityHeatmap :colors="quality.allJuzColors" :counts="quality.qualityCounts" @select="selectedJuz = $event" />
    </UCard>

    <!-- Detail juz -->
    <UCard v-if="selectedJuz">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-sm">2. Juz {{ selectedJuz }} — {{ mushafRange }}</h2>
          <UBadge :color="badgeColor(stats.color)" variant="subtle">{{ QUALITY_META[stats.color].label }} · {{ stats.total }} salah</UBadge>
        </div>
        <p class="text-xs text-gray-500">Per halaman: hijau ≤1 · kuning 2–3 · orange 4–5 · merah ≥6 salah</p>
      </template>

      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="h in 20"
          :key="h"
          class="rounded-xl border p-2 text-center transition active:scale-95"
          :class="[
            selectedHal === h ? 'ring-2 ring-emerald-600' : '',
            halBg(quality.pageColor(selectedJuz, h)),
          ]"
          @click="selectedHal = h"
        >
          <div class="text-xs font-bold">Hlm {{ h }}</div>
          <div class="text-[10px] opacity-70">mshf {{ mushafPage(selectedJuz, h) }}</div>
          <div class="text-sm font-extrabold">{{ quality.pageErrors(selectedJuz, h) ?? '–' }}</div>
        </button>
      </div>

      <!-- Input salah -->
      <div v-if="selectedHal" class="mt-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold">Halaman {{ selectedHal }} <span class="font-normal text-gray-500">(mushaf {{ mushafPage(selectedJuz, selectedHal) }})</span></p>
          <UBadge :color="badgeColor(previewColor)" variant="subtle">{{ QUALITY_META[previewColor].label }}</UBadge>
        </div>

        <!-- Stepper besar -->
        <div class="flex items-stretch gap-2">
          <UButton icon="i-lucide-minus" size="lg" variant="outline" class="w-14 justify-center shrink-0" :disabled="formSalah <= 0" @click="adjust(-1)" aria-label="Kurangi" />
          <UInputNumber v-model="formSalah" :min="0" :max="99" size="lg" class="w-full" :ui="{ base: 'text-center text-xl font-extrabold' }" />
          <UButton icon="i-lucide-plus" size="lg" variant="outline" class="w-14 justify-center shrink-0" :disabled="formSalah >= 99" @click="adjust(1)" aria-label="Tambah" />
        </div>

        <!-- Pilih cepat sesuai warna -->
        <div>
          <p class="text-[11px] font-medium text-gray-500 mb-1.5">Pilih cepat jumlah salah</p>
          <div class="grid grid-cols-7 gap-1.5">
            <button
              v-for="opt in quickOpts"
              :key="opt.v"
              class="rounded-xl border py-1.5 flex flex-col items-center gap-1 transition active:scale-95 bg-white dark:bg-gray-950"
              :class="isOptActive(opt.v) ? 'border-emerald-600 ring-2 ring-emerald-600/40' : 'border-gray-200 dark:border-gray-700'"
              @click="pickOpt(opt.v)"
            >
              <span class="text-sm font-extrabold leading-none">{{ opt.label }}</span>
              <span class="size-2.5 rounded-full" :class="optDot(opt.v)" />
            </button>
          </div>
        </div>

        <!-- Pratinjau hasil -->
        <div class="rounded-xl px-3 py-2.5 text-center" :class="previewBg(previewColor)">
          <p class="text-sm font-bold">{{ QUALITY_META[previewColor].label }} — {{ previewVerdict(previewColor) }}</p>
        </div>

        <UButton color="success" size="lg" class="w-full justify-center" icon="i-lucide-save" @click="saveHal">
          Simpan nilai halaman ini
        </UButton>
        <UButton variant="ghost" color="error" size="sm" class="w-full justify-center" @click="clearHal">
          Hapus nilai halaman ini
        </UButton>
      </div>

      <div class="mt-4 space-y-2">
        <p class="text-xs text-gray-500 text-center">Total {{ stats.total }} salah dari {{ stats.filled }}/20 halaman dinilai</p>
        <div class="flex gap-2">
          <UButton color="success" variant="soft" icon="i-lucide-check-check" class="flex-1 justify-center" @click="confirmHijau = true">
            Semua hijau
          </UButton>
          <UButton variant="ghost" color="error" icon="i-lucide-rotate-ccw" class="flex-1 justify-center" @click="quality.clearJuz(selectedJuz)">
            Reset juz
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Konfirmasi semua hijau -->
    <UModal v-model:open="confirmHijau">
      <template #content>
        <UCard>
          <template #header><h3 class="font-bold">Tandai semua hijau? ✅</h3></template>
          <p class="text-sm text-gray-500">
            Seluruh 20 halaman <b>Juz {{ selectedJuz }}</b> akan diset <b class="text-green-600">0 salah (hijau)</b>.
            Nilai yang sudah ada akan tertimpa.
          </p>
          <div class="flex gap-2 mt-4">
            <UButton variant="soft" color="neutral" class="flex-1 justify-center" @click="confirmHijau = false">Batal</UButton>
            <UButton color="success" class="flex-1 justify-center" @click="markAllHijau">Ya, semua hijau</UButton>
          </div>
        </UCard>
      </template>
    </UModal>

    <!-- Legenda -->
    <UCard>
      <template #header><h2 class="font-semibold text-sm">Aturan penilaian</h2></template>
      <ul class="text-xs space-y-1.5">
        <li><b class="text-green-600">Hijau:</b> ≤1 salah/halaman · ≤5 salah/juz — lancar ✅</li>
        <li><b class="text-yellow-600">Kuning:</b> 2–3/halaman · 6–10/juz — cukup, perlu pengulangan</li>
        <li><b class="text-orange-600">Orange:</b> 4–5/halaman · 11–20/juz — perlu perbaikan 🔧</li>
        <li><b class="text-red-600">Merah:</b> ≥6/halaman · &gt;20/juz — wajib diulang dari awal 🔁</li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { QUALITY_META, mushafPage, juzRange, pageQuality, type QualityColor } from '~/utils/quran'

const route = useRoute()
const quality = useQualityStore()

const selectedJuz = ref<number>(Number(route.query.juz) || 30)
const selectedHal = ref<number | null>(null)
const formSalah = ref<number>(0)
const confirmHijau = ref(false)

const quickOpts = [
  { v: 0, label: '0' },
  { v: 1, label: '1' },
  { v: 2, label: '2' },
  { v: 3, label: '3' },
  { v: 4, label: '4' },
  { v: 5, label: '5' },
  { v: 6, label: '6+' },
]

watch(selectedHal, (h) => {
  if (h) formSalah.value = quality.pageErrors(selectedJuz.value, h) ?? 0
})
watch(selectedJuz, () => { selectedHal.value = null })

const stats = computed(() => quality.juzStats(selectedJuz.value))
const mushafRange = computed(() => {
  const r = juzRange(selectedJuz.value)
  return `mushaf ${r.from}–${r.to}`
})
const previewColor = computed<QualityColor>(() => pageQuality(formSalah.value))

function halBg(c: QualityColor): string {
  switch (c) {
    case 'hijau': return 'bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-800'
    case 'kuning': return 'bg-yellow-100 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800'
    case 'orange': return 'bg-orange-100 border-orange-300 dark:bg-orange-950 dark:border-orange-800'
    case 'merah': return 'bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800'
    default: return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
  }
}
function badgeColor(c: QualityColor): 'success' | 'warning' | 'error' | 'neutral' {
  if (c === 'hijau') return 'success'
  if (c === 'kuning' || c === 'orange') return 'warning'
  if (c === 'merah') return 'error'
  return 'neutral'
}
function adjust(d: number) {
  formSalah.value = Math.min(99, Math.max(0, (formSalah.value ?? 0) + d))
}
function pickOpt(v: number) {
  formSalah.value = v
}
function isOptActive(v: number): boolean {
  return v >= 6 ? formSalah.value >= 6 : formSalah.value === v
}
function optDot(v: number): string {
  if (v <= 1) return 'bg-green-500'
  if (v <= 3) return 'bg-yellow-400'
  if (v <= 5) return 'bg-orange-500'
  return 'bg-red-500'
}
function previewBg(c: QualityColor): string {
  switch (c) {
    case 'hijau': return 'bg-green-500 text-white'
    case 'kuning': return 'bg-yellow-400 text-yellow-950'
    case 'orange': return 'bg-orange-500 text-white'
    case 'merah': return 'bg-red-500 text-white'
    default: return 'bg-gray-200 dark:bg-gray-700 text-gray-500'
  }
}
function previewVerdict(c: QualityColor): string {
  switch (c) {
    case 'hijau': return 'lancar ✅'
    case 'kuning': return 'cukup, perlu pengulangan'
    case 'orange': return 'perlu perbaikan 🔧'
    case 'merah': return 'wajib diulang 🔁'
    default: return 'belum dinilai'
  }
}
function markAllHijau() {
  for (let h = 1; h <= 20; h++) quality.setErrors(selectedJuz.value, h, 0)
  if (selectedHal.value) formSalah.value = 0
  confirmHijau.value = false
}
function saveHal() {
  if (selectedHal.value) {
    quality.setErrors(selectedJuz.value, selectedHal.value, formSalah.value)
  }
}
function clearHal() {
  if (selectedHal.value) {
    quality.setErrors(selectedJuz.value, selectedHal.value, null)
    formSalah.value = 0
  }
}
</script>

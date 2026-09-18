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
      <div v-if="selectedHal" class="mt-4 rounded-xl border p-3 space-y-3 bg-gray-50 dark:bg-gray-900">
        <p class="text-sm font-semibold">Halaman {{ selectedHal }} (mushaf {{ mushafPage(selectedJuz, selectedHal) }})</p>
        <div class="flex items-center gap-2">
          <UButton icon="i-lucide-minus" variant="outline" @click="adjust(-1)" />
          <UInputNumber v-model="formSalah" :min="0" :max="99" class="flex-1" />
          <UButton icon="i-lucide-plus" variant="outline" @click="adjust(1)" />
        </div>
        <div class="flex flex-wrap gap-1.5">
          <UButton v-for="n in [0, 1, 2, 3, 5, 6]" :key="n" size="xs" variant="soft" @click="formSalah = n">{{ n }} salah</UButton>
          <UButton size="xs" variant="ghost" color="error" @click="clearHal">Hapus nilai</UButton>
        </div>
        <div class="flex gap-2">
          <UButton color="success" class="flex-1 justify-center" icon="i-lucide-save" @click="saveHal">Simpan ({{ QUALITY_META[previewColor].label }})</UButton>
        </div>
      </div>

      <div class="flex justify-between items-center mt-3">
        <p class="text-xs text-gray-500">Total {{ stats.total }} salah dari {{ stats.filled }}/20 halaman dinilai</p>
        <UButton variant="ghost" color="error" size="xs" @click="quality.clearJuz(selectedJuz)">Reset juz ini</UButton>
      </div>
    </UCard>

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

<template>
  <div class="px-4 pt-5 space-y-4">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-xl font-bold">Riwayat 🗂️</h1>
        <p class="text-xs text-gray-500">Snapshot jumlah murajaah & kualitas tiap bulan.</p>
      </div>
      <UButton icon="i-lucide-camera" color="success" @click="openSnap = true">Snapshot</UButton>
    </div>

    <UCard v-if="!snapshots.items.length && !murajaah.totalAll" class="text-center text-sm text-gray-500">
      Belum ada data. Mulai deres di halaman Target, lalu ambil snapshot tiap akhir bulan.
    </UCard>

    <!-- Ringkasan bulan berjalan -->
    <UCard>
      <template #header><h2 class="font-semibold text-sm">Bulan berjalan — {{ monthLabel(curMonth) }}</h2></template>
      <div class="grid grid-cols-2 gap-2 text-center">
        <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950 p-3">
          <p class="text-2xl font-extrabold text-emerald-600">{{ murajaah.monthTotal(curMonth) }}</p>
          <p class="text-[11px] text-gray-500">juz bulan ini</p>
        </div>
        <div class="rounded-xl bg-gray-100 dark:bg-gray-800 p-3">
          <p class="text-2xl font-extrabold">{{ quality.qualityCounts.hijau }}/30</p>
          <p class="text-[11px] text-gray-500">juz hijau saat ini</p>
        </div>
      </div>
      <UButton class="mt-3 w-full justify-center" variant="soft" @click="quickSnapshot">Bekukan bulan ini sebagai snapshot</UButton>
    </UCard>

    <!-- Daftar snapshot -->
    <div v-for="m in snapshots.months" :key="m" class="space-y-2">
      <h2 class="font-bold text-sm mt-2">{{ monthLabel(m) }}</h2>
      <UCard v-for="s in snapshots.byMonth.get(m) ?? []" :key="s.id">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-bold">{{ s.totalMurajaah }} juz dimurajaah</p>
            <p class="text-[11px] text-gray-500">{{ new Date(s.createdAt).toLocaleString('id-ID') }}{{ s.note ? ` · ${s.note}` : '' }}</p>
          </div>
          <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="xs" @click="snapshots.remove(s.id)" />
        </div>
        <div class="grid grid-cols-4 gap-1.5 mt-2 text-center text-[11px]">
          <div class="rounded-lg bg-green-100 dark:bg-green-950 p-2"><p class="font-extrabold text-green-700 text-base">{{ s.quality.hijau }}</p>Hijau</div>
          <div class="rounded-lg bg-yellow-100 dark:bg-yellow-950 p-2"><p class="font-extrabold text-yellow-700 text-base">{{ s.quality.kuning }}</p>Kuning</div>
          <div class="rounded-lg bg-orange-100 dark:bg-orange-950 p-2"><p class="font-extrabold text-orange-700 text-base">{{ s.quality.orange }}</p>Orange</div>
          <div class="rounded-lg bg-red-100 dark:bg-red-950 p-2"><p class="font-extrabold text-red-700 text-base">{{ s.quality.merah }}</p>Merah</div>
        </div>
      </UCard>
    </div>

    <!-- Modal snapshot -->
    <UModal v-model:open="openSnap">
      <template #content>
        <UCard>
          <template #header><h3 class="font-bold">Ambil snapshot</h3></template>
          <div class="space-y-3">
            <UFormField label="Bulan">
              <UInput v-model="formMonth" placeholder="YYYY-MM" />
            </UFormField>
            <UFormField label="Catatan (opsional)">
              <UInput v-model="formNote" placeholder="cth: Selesai 1 putaran" />
            </UFormField>
            <p class="text-xs text-gray-500">Akan menyimpan: {{ murajaah.monthTotal(formMonth || curMonth) }} juz & distribusi kualitas saat ini.</p>
            <div class="flex gap-2">
              <UButton variant="soft" class="flex-1 justify-center" @click="openSnap = false">Batal</UButton>
              <UButton color="success" class="flex-1 justify-center" @click="saveSnap">Simpan</UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { monthKey, monthLabel } from '~/utils/date'

const murajaah = useMurajaahStore()
const quality = useQualityStore()
const snapshots = useSnapshotStore()

const curMonth = computed(() => monthKey())
const openSnap = ref(false)
const formMonth = ref(curMonth.value)
const formNote = ref('')

function quickSnapshot() {
  snapshots.take(murajaah.monthTotal(curMonth.value), { ...quality.qualityCounts }, curMonth.value)
}

function saveSnap() {
  const m = /^\d{4}-\d{2}$/.test(formMonth.value) ? formMonth.value : curMonth.value
  snapshots.take(murajaah.monthTotal(m), { ...quality.qualityCounts }, m, formNote.value || undefined)
  openSnap.value = false
  formNote.value = ''
}
</script>

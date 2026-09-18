<template>
  <div class="px-4 pt-5 space-y-4">
    <div>
      <h1 class="text-xl font-bold">Target murajaah harian 🎯</h1>
      <p class="text-xs text-gray-500">Tandai setiap juz yang selesai dibaca hari ini. Data tersimpan offline.</p>
    </div>

    <UCard class="text-center">
      <p class="text-xs text-gray-500 uppercase tracking-wide">Progress hari ini</p>
      <p class="text-3xl font-extrabold">{{ done }}/{{ target }} juz</p>
      <UProgress :value="pct" class="mt-2" />
      <p v-if="done >= target" class="text-sm text-emerald-600 font-semibold mt-2">MasyaAllah, target tercapai! 🎉</p>
    </UCard>

    <UCard>
      <template #header><h2 class="font-semibold text-sm">Pilih juz yang sudah dibaca</h2></template>
      <div class="grid grid-cols-5 gap-2">
        <UButton
          v-for="j in 30"
          :key="j"
          :variant="doneList.includes(j) ? 'solid' : 'outline'"
          :color="doneList.includes(j) ? 'success' : wajib.includes(j) ? 'warning' : 'neutral'"
          class="justify-center"
          @click="toggle(j)"
        >
          {{ j }}
        </UButton>
      </div>
      <p class="text-[11px] text-gray-400 mt-2">Kuning = juz wajib. Hijau = sudah dibaca hari ini. Ketuk lagi untuk batalkan satu catatan.</p>
    </UCard>

    <UCard>
      <template #header><h2 class="font-semibold text-sm">Catatan hari ini ({{ logsToday.length }})</h2></template>
      <div v-if="logsToday.length" class="space-y-1.5">
        <div v-for="l in logsToday" :key="l.id" class="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
          <span>Juz {{ l.juz }} <span class="text-xs text-gray-400">· {{ new Date(l.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}</span></span>
          <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="xs" @click="murajaah.removeLog(l.id)" />
        </div>
      </div>
      <p v-else class="text-sm text-gray-500">Belum ada. Semangat deres! 💪</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { toISODate } from '~/utils/date'

const settings = useSettingsStore()
const murajaah = useMurajaahStore()

const target = computed(() => settings.targetJuzPerHari)
const wajib = computed(() => settings.juzWajib)
const today = toISODate(new Date())
const logsToday = computed(() => murajaah.logs.filter(l => l.date === today).sort((a, b) => a.juz - b.juz))
const doneList = computed(() => logsToday.value.map(l => l.juz))
const done = computed(() => logsToday.value.length)
const pct = computed(() => target.value ? Math.min(100, (done.value / target.value) * 100) : 0)

function toggle(juz: number) {
  const existing = logsToday.value.find(l => l.juz === juz)
  if (existing) murajaah.removeLog(existing.id)
  else murajaah.addLog(juz)
}
</script>

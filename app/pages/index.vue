<template>
  <div class="px-4 pt-5 space-y-4">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <p class="text-xs text-gray-500">{{ todayLong }}</p>
        <h1 class="text-xl font-bold">
          {{ settings.nama ? `Assalamu'alaikum, ${settings.nama} 👋` : `Deresan 📖` }}
        </h1>
        <p class="text-xs text-gray-500">Reminder murajaah harian & kualitas hafalan</p>
      </div>
      <UBadge :color="doneToday >= target ? 'success' : 'warning'" variant="subtle" size="lg">
        {{ doneToday }}/{{ target }} juz
      </UBadge>
    </header>

    <!-- Reminder target harian: klik -> /target -->
    <NuxtLink to="/target" class="block">
      <UCard class="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-emerald-100">Target hari ini</p>
            <p class="text-2xl font-extrabold">{{ remaining }} juz lagi</p>
            <p class="text-xs text-emerald-100 mt-1">
              {{ doneToday >= target ? 'Alhamdulillah, target tercapai 🎉' : `${doneToday} dari ${target} juz selesai — ketuk untuk deres` }}
            </p>
          </div>
          <UIcon name="i-lucide-book-open-check" class="size-12 opacity-80" />
        </div>
        <UProgress :value="pct" class="mt-3" color="neutral" />
      </UCard>
    </NuxtLink>

    <!-- Juz wajib hari ini -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-sm">Juz wajib hari ini</h2>
          <UButton to="/pengaturan" variant="ghost" size="xs" icon="i-lucide-pencil">Ubah</UButton>
        </div>
        <p class="text-xs text-gray-500">Juz yang baru dihafal / sedang diperbaiki</p>
      </template>
      <div v-if="settings.juzWajib.length" class="flex flex-wrap gap-2">
        <UBadge
          v-for="j in settings.juzWajib"
          :key="j"
          size="lg"
          :color="murajaah.juzDoneToday.includes(j) ? 'success' : 'neutral'"
          variant="subtle"
          class="cursor-pointer"
          @click="quickDone(j)"
        >
          <UIcon v-if="murajaah.juzDoneToday.includes(j)" name="i-lucide-check" class="size-3.5" />
          Juz {{ j }}
        </UBadge>
      </div>
      <p v-else class="text-sm text-gray-500">Belum ada juz wajib. Atur di Pengaturan.</p>
      <p class="text-[11px] text-gray-400 mt-2">Ketuk badge untuk menandai selesai dibaca hari ini.</p>
    </UCard>

    <!-- Heatmap murajaah bulan ini -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-sm">Murajaah bulan ini</h2>
          <UBadge variant="subtle" color="success">{{ monthTotal }} juz</UBadge>
        </div>
      </template>
      <MurajaahHeatmap :month="curMonth" :counts="monthCounts" :target="target" />
    </UCard>

    <!-- Heatmap kualitas -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-sm">Kualitas hafalan (30 juz)</h2>
          <UButton to="/kualitas" variant="ghost" size="xs" icon="i-lucide-pencil">Nilai</UButton>
        </div>
        <p class="text-xs text-gray-500">Hijau ≤5 salah · Kuning 6–10 · Orange 11–20 · Merah &gt;20 per juz</p>
      </template>
      <QualityHeatmap :colors="quality.allJuzColors" :counts="quality.qualityCounts" @select="goKualitas" />
    </UCard>

    <!-- Streak -->
    <UCard class="flex items-center gap-3">
      <UIcon name="i-lucide-flame" class="size-8 text-orange-500" />
      <div>
        <p class="font-bold">{{ murajaah.streak }} hari beruntun</p>
        <p class="text-xs text-gray-500">Total {{ murajaah.totalAll }} juz pernah dimurajaah</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { monthKey } from '~/utils/date'

const settings = useSettingsStore()
const murajaah = useMurajaahStore()
const quality = useQualityStore()
const router = useRouter()

const target = computed(() => settings.targetJuzPerHari)
const doneToday = computed(() => murajaah.todayCount)
const remaining = computed(() => Math.max(0, target.value - doneToday.value))
const pct = computed(() => target.value ? Math.min(100, (doneToday.value / target.value) * 100) : 0)
const curMonth = computed(() => monthKey())
const monthCounts = computed(() => murajaah.countForMonth(curMonth.value))
const monthTotal = computed(() => murajaah.monthTotal(curMonth.value))

const todayLong = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function quickDone(juz: number) {
  murajaah.addLog(juz)
}

function goKualitas(juz: number) {
  router.push({ path: '/kualitas', query: { juz } })
}
</script>

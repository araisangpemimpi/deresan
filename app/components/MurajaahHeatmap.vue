<template>
  <!-- Heatmap jumlah murajaah bulan ini, gaya GitHub -->
  <div>
    <div class="grid grid-cols-7 gap-1.5" data-testid="murajaah-heatmap">
      <div class="text-center text-[10px] text-gray-400 font-medium" v-for="d in ['S','S','R','K','J','S','M']" :key="d">{{ d }}</div>
      <template v-for="(day, i) in cells" :key="i">
        <div v-if="day === null" class="aspect-square" />
        <UTooltip v-else :text="`${formatID(day.date)} — ${day.count} juz`">
          <div
            class="aspect-square rounded-md border flex items-center justify-center text-[10px] font-semibold cursor-default"
            :class="levelClass(day.count, day.isToday)"
          >
            {{ day.count > 0 ? day.count : '' }}
          </div>
        </UTooltip>
      </template>
    </div>
    <div class="flex items-center justify-between mt-2 text-[11px] text-gray-500">
      <span>{{ monthLabel(month) }}</span>
      <span class="flex items-center gap-1">
        Sedikit
        <span class="size-3 rounded bg-gray-100 dark:bg-gray-800 border" />
        <span class="size-3 rounded bg-emerald-200" />
        <span class="size-3 rounded bg-emerald-400" />
        <span class="size-3 rounded bg-emerald-600" />
        Banyak
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { daysInMonth, formatID, monthLabel } from '~/utils/date'

const props = defineProps<{ month: string; counts: Map<string, number>; target: number }>()

const cells = computed(() => {
  const [y, m] = props.month.split('-').map(Number)
  const days = daysInMonth(y, m)
  // Senin-first offset: JS getDay 0=Min..6=Sab -> Senin index 0
  const firstDow = (days[0].getDay() + 6) % 7
  const today = new Date().toISOString().slice(0, 10)
  const out: ({ date: string; count: number; isToday: boolean } | null)[] = []
  for (let i = 0; i < firstDow; i++) out.push(null)
  for (const d of days) {
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    out.push({ date: iso, count: props.counts.get(iso) ?? 0, isToday: iso === today })
  }
  return out
})

function levelClass(count: number, isToday: boolean): string {
  const ring = isToday ? ' ring-2 ring-emerald-600 ring-offset-1' : ''
  if (count <= 0) return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-transparent' + ring
  if (count < props.target) return 'bg-emerald-200 dark:bg-emerald-900 border-emerald-300 text-emerald-900 dark:text-emerald-100' + ring
  if (count === props.target) return 'bg-emerald-400 border-emerald-500 text-white' + ring
  return 'bg-emerald-600 border-emerald-700 text-white' + ring
}
</script>

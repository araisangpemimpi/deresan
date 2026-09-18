<template>
  <!-- 30 kotak kualitas hafalan: 1 kotak = 1 juz, warna = kualitas -->
  <div>
    <div class="grid grid-cols-6 sm:grid-cols-10 gap-1.5" data-testid="quality-heatmap">
      <UTooltip v-for="juz in 30" :key="juz" :text="`Juz ${juz} — ${QUALITY_META[colors[juz - 1]].label}`">
        <div
          class="aspect-square rounded-lg border flex items-center justify-center text-xs font-bold cursor-pointer transition-transform active:scale-95"
          :class="boxClass(colors[juz - 1])"
          @click="$emit('select', juz)"
        >
          {{ juz }}
        </div>
      </UTooltip>
    </div>
    <div class="flex flex-wrap gap-2 mt-2 text-[11px]">
      <span v-for="(meta, key) in legend" :key="key" class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
        <span class="size-3 rounded" :class="meta.bg" /> {{ meta.label }} ({{ counts[key] }})
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QUALITY_META, type QualityColor } from '~/utils/quran'

defineProps<{ colors: QualityColor[]; counts: Record<QualityColor, number> }>()
defineEmits<{ select: [juz: number] }>()

const legend = {
  hijau: QUALITY_META.hijau,
  kuning: QUALITY_META.kuning,
  orange: QUALITY_META.orange,
  merah: QUALITY_META.merah,
}

function boxClass(c: QualityColor): string {
  switch (c) {
    case 'hijau': return 'bg-green-500 border-green-600 text-white'
    case 'kuning': return 'bg-yellow-400 border-yellow-500 text-yellow-950'
    case 'orange': return 'bg-orange-500 border-orange-600 text-white'
    case 'merah': return 'bg-red-500 border-red-600 text-white'
    default: return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
  }
}
</script>

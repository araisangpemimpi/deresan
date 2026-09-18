<template>
  <div class="min-h-dvh bg-gray-50 dark:bg-gray-950 pb-24 max-w-md mx-auto sm:border-x sm:border-gray-200 sm:dark:border-gray-800">
    <slot />
    <!-- Bottom Nav mobile-first -->
    <nav class="fixed bottom-0 inset-x-0 z-50">
      <div class="max-w-md mx-auto px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div class="grid grid-cols-5 gap-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg p-1.5">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors"
            :class="$route.path === item.to ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950' : 'text-gray-500 dark:text-gray-400'"
          >
            <UIcon :name="item.icon" class="size-5" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
const nav = [
  { to: '/', label: 'Depan', icon: 'i-lucide-house' },
  { to: '/target', label: 'Target', icon: 'i-lucide-target' },
  { to: '/kualitas', label: 'Kualitas', icon: 'i-lucide-chart-column' },
  { to: '/riwayat', label: 'Riwayat', icon: 'i-lucide-history' },
  { to: '/pengaturan', label: 'Atur', icon: 'i-lucide-settings' },
]
</script>

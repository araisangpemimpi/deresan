<template>
  <div class="px-4 pt-5 space-y-4">
    <h1 class="text-xl font-bold">Pengaturan ⚙️</h1>

    <UCard>
      <template #header><h2 class="font-semibold text-sm">Profil & target</h2></template>
      <div class="space-y-4">
        <UFormField label="Nama panggilan" description="Ditampilkan sebagai sapaan di halaman depan">
          <UInput
            v-model="nama"
            placeholder="cth: Ahmad"
            size="lg"
            icon="i-lucide-user"
            class="w-full"
            @change="settings.setNama(nama)"
          >
            <template v-if="nama" #trailing>
              <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="xs" @click="nama = ''; settings.setNama('')" aria-label="Hapus nama" />
            </template>
          </UInput>
        </UFormField>
        <UFormField label="Target juz per hari" description="Jumlah juz yang diingatkan setiap hari">
          <div class="flex items-stretch gap-2">
            <UButton
              icon="i-lucide-minus" size="lg" variant="outline" class="w-14 justify-center shrink-0"
              :disabled="settings.targetJuzPerHari <= 1"
              @click="settings.setTarget(settings.targetJuzPerHari - 1)" aria-label="Kurangi target"
            />
            <div class="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center py-2">
              <span class="text-3xl font-extrabold leading-none">{{ settings.targetJuzPerHari }}</span>
              <span class="text-[11px] text-gray-500 mt-0.5">juz / hari</span>
            </div>
            <UButton
              icon="i-lucide-plus" size="lg" variant="outline" class="w-14 justify-center shrink-0"
              :disabled="settings.targetJuzPerHari >= 30"
              @click="settings.setTarget(settings.targetJuzPerHari + 1)" aria-label="Tambah target"
            />
          </div>
        </UFormField>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-sm">Juz wajib (baru dihafal / diperbaiki)</h2>
        <p class="text-xs text-gray-500">Ketuk untuk pilih/batalkan</p>
      </template>
      <div class="grid grid-cols-5 gap-2">
        <UButton
          v-for="j in 30"
          :key="j"
          :variant="settings.juzWajib.includes(j) ? 'solid' : 'outline'"
          :color="settings.juzWajib.includes(j) ? 'warning' : 'neutral'"
          class="justify-center"
          @click="settings.toggleWajib(j)"
        >
          {{ j }}
        </UButton>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold text-sm">Backup offline (JSON)</h2>
        <p class="text-xs text-gray-500">Simpan & pulihkan seluruh data (murajaah, kualitas, pengaturan)</p>
      </template>
      <div class="flex gap-2">
        <UButton icon="i-lucide-download" variant="soft" size="lg" class="flex-1 justify-center" @click="exportJSON">Export</UButton>
        <UButton icon="i-lucide-upload" variant="soft" size="lg" class="flex-1 justify-center" @click="fileEl?.click()">Import</UButton>
        <input ref="fileEl" type="file" accept="application/json" class="hidden" @change="onImport" />
      </div>
      <UTextarea v-model="jsonPreview" :rows="2" readonly placeholder="Status backup akan muncul di sini…" class="w-full font-mono mt-3" />
    </UCard>

    <UCard>
      <template #header><h2 class="font-semibold text-sm text-red-600">Zona berbahaya</h2></template>
      <div class="flex gap-2">
        <UButton color="error" variant="soft" class="flex-1 justify-center" @click="confirmReset = true">Reset semua data</UButton>
      </div>
    </UCard>

    <UModal v-model:open="confirmReset">
      <template #content>
        <UCard>
          <template #header><h3 class="font-bold">Hapus semua data?</h3></template>
          <p class="text-sm text-gray-500">Murajaah, kualitas, dan pengaturan akan dihapus dari HP ini.</p>
          <div class="flex gap-2 mt-3">
            <UButton variant="soft" class="flex-1 justify-center" @click="confirmReset = false">Batal</UButton>
            <UButton color="error" class="flex-1 justify-center" @click="doReset">Ya, hapus</UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const settings = useSettingsStore()
const murajaah = useMurajaahStore()
const quality = useQualityStore()

const nama = ref(settings.nama)
const fileEl = ref<HTMLInputElement | null>(null)
const confirmReset = ref(false)
const jsonPreview = ref('')

watch(() => settings.nama, v => { nama.value = v })

function payload() {
  return {
    app: 'deresan',
    version: 2,
    exportedAt: new Date().toISOString(),
    settings: settings.$state,
    logs: murajaah.logs,
    errors: quality.errors,
    qualityHistory: quality.history,
  }
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(payload(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `deresan-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  jsonPreview.value = 'Backup diunduh ✅'
}

async function onImport(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  try {
    const data = JSON.parse(await f.text())
    if (data.settings) settings.importJSON(JSON.stringify(data.settings))
    if (Array.isArray(data.logs)) murajaah.importLogs(data.logs)
    if (data.errors) quality.importData(data.errors, data.qualityHistory)
    jsonPreview.value = 'Import berhasil ✅'
  } catch {
    jsonPreview.value = 'File tidak valid ❌'
  }
}

function doReset() {
  murajaah.reset()
  quality.reset()
  settings.reset()
  confirmReset.value = false
}
</script>

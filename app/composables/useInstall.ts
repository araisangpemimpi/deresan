// Helper instalasi PWA. Memanfaatkan $pwa dari @vite-pwa/nuxt
// (showInstallPrompt / install / cancelInstall / isPWAInstalled)
// + deteksi iOS yang tidak mendukung prompt otomatis.
export function useInstall() {
  const { $pwa } = useNuxtApp()

  const isIOS = computed(() => {
    if (!import.meta.client) return false
    return /iPhone|iPad|iPod/.test(navigator.userAgent)
  })
  const installed = computed(() => $pwa?.isPWAInstalled === true)
  const canPrompt = computed(() => $pwa?.showInstallPrompt === true)

  async function install() {
    await $pwa?.install()
  }
  function dismiss() {
    $pwa?.cancelInstall()
  }

  return { isIOS, installed, canPrompt, install, dismiss }
}

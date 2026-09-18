// Generate ikon PNG PWA dari public/icon.svg (dijalankan sekali, manual).
// Usage: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const src = join(pub, 'icon.svg')

// Ikon standar (any purpose)
for (const size of [192, 512]) {
  await sharp(src).resize(size, size).png().toFile(join(pub, `icon-${size}.png`))
  console.log(`icon-${size}.png ✓`)
}

// Maskable: full-bleed emerald dengan logo 70% di tengah (safe zone)
const inner = await sharp(src).resize(358, 358).toBuffer()
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#059669' },
})
  .composite([{ input: inner, gravity: 'centre' }])
  .png()
  .toFile(join(pub, 'icon-maskable-512.png'))
console.log('icon-maskable-512.png ✓')

// Apple touch icon 180
await sharp(src).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'))
console.log('apple-touch-icon.png ✓')

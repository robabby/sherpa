import { test } from '@playwright/test'
import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const manifest = JSON.parse(
  readFileSync(join(__dirname, 'routes.json'), 'utf-8')
)

const routes: { path: string; label: string }[] = manifest.routes
const viewports = manifest.viewports as Record<
  string,
  { width: number; height: number }
>

const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-')
const outDir = join(__dirname, '..', '.screenshots', `sweep-${timestamp}`)
mkdirSync(outDir, { recursive: true })

for (const [vpName, vpSize] of Object.entries(viewports)) {
  test.describe(`${vpName} (${vpSize.width}x${vpSize.height})`, () => {
    test.use({ viewport: vpSize })

    for (const route of routes) {
      test(`${route.label} — ${route.path}`, async ({ page }) => {
        await page.goto(route.path)
        await page.waitForLoadState('networkidle')
        const slug = route.path === '/' ? 'home' : route.path.slice(1).replace(/\//g, '-')
        await page.screenshot({
          path: join(outDir, `${vpName}-${slug}.png`),
          fullPage: true,
        })
      })
    }
  })
}

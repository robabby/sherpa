/**
 * Ad-hoc verification screenshot.
 *
 * Usage:
 *   pnpm exec playwright test e2e/verify.spec.ts --project desktop
 *
 * Override route and output via env:
 *   VERIFY_ROUTE=/skills VERIFY_OUT=.screenshots/skills.png pnpm exec playwright test e2e/verify.spec.ts
 */
import { test } from '@playwright/test'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

const route = process.env.VERIFY_ROUTE ?? '/'
const outPath = process.env.VERIFY_OUT ?? `.screenshots/verify${route === '/' ? '-home' : route.replace(/\//g, '-')}.png`

test(`verify ${route}`, async ({ page }) => {
  mkdirSync(dirname(outPath), { recursive: true })
  await page.goto(route)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: outPath, fullPage: true })
})

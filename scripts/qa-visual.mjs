// QA visual repetible: levanta `npm run preview` y revisa la app real con Chromium (Playwright).
// Uso: `npm run qa` (compila y corre). Salida: PASA/FALLA por comprobación; código de salida 1 si algo falla.
import { spawn, execSync } from 'node:child_process'
import { chromium } from 'playwright'

const PORT = 4180
// QA_URL: probar una app ya servida en otra dirección (no levanta preview). Por defecto levanta `npm run preview`.
const EXTERNAL = process.env.QA_URL
const URL = EXTERNAL ?? `http://localhost:${PORT}/`
const VIEWPORTS = [
  { name: '360 px', width: 360, height: 740 },
  { name: '1280 px', width: 1280, height: 800 },
]
const TABS = ['Grupo', 'Gastos', 'Saldos y pagos', 'Verificación']

const results = []
function report(name, ok, detail = '') {
  results.push({ name, ok })
  console.log(`${ok ? 'PASA ' : 'FALLA'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
async function check(name, fn) {
  try {
    const r = await fn()
    if (r === true || r === undefined) report(name, true)
    else report(name, r.ok, r.detail)
  } catch (e) {
    report(name, false, `excepción: ${String(e.message).split('\n')[0]}`)
  }
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(URL)
      if (r.ok) return
    } catch {
      /* aún no */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error('el servidor de preview no arrancó')
}

function stop(child) {
  try {
    if (process.platform === 'win32') execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' })
    else child.kill('SIGTERM')
  } catch {
    /* ya terminó */
  }
}

const openTab = async (page, name) => {
  await page.getByRole('tab', { name, exact: true }).click()
  await page.waitForTimeout(250)
}

// ---- comprobaciones que se ejecutan en la página ----
const noHorizontalScroll = () => {
  const w = window.innerWidth
  return { ok: document.documentElement.scrollWidth <= w && document.body.scrollWidth <= w, detail: `scrollWidth ${document.documentElement.scrollWidth}, ancho ${w}` }
}

const smallTargets = () => {
  const visible = (el) => {
    if (el.closest('dialog:not([open])')) return false
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'
  }
  const sel = 'button, [role=tab], select, textarea, a[href], input:not([type=hidden])'
  const bad = []
  let medidos = 0
  for (const el of document.querySelectorAll(sel)) {
    if (!visible(el)) continue
    medidos++
    // Las casillas se miden por su etiqueta (la parte pulsable).
    const target = el.matches('input[type=checkbox],input[type=radio]') ? el.closest('label') ?? el : el
    const r = target.getBoundingClientRect()
    if (r.width < 43.5 || r.height < 43.5) {
      bad.push(`${target.tagName.toLowerCase()}"${(target.textContent || target.getAttribute('aria-label') || target.id || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`)
    }
  }
  return { ok: bad.length === 0, detail: bad.length ? bad.slice(0, 5).join('; ') : `${medidos} objetivos, todos ≥ 44 x 44` }
}

async function focusVisibleOnEveryTab(page) {
  await page.evaluate(() => document.activeElement && document.activeElement.blur())
  const failures = []
  let count = 0
  const seen = new Set()
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab')
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      // Para casillas ocultas visualmente, mirar la etiqueta o el elemento hermano que muestra el foco.
      const wrap = el.closest('label') ?? el
      const wcs = getComputedStyle(wrap)
      const own = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2
      const wrapped = wcs.outlineStyle !== 'none' && parseFloat(wcs.outlineWidth) >= 2
      const shadow = cs.boxShadow !== 'none'
      // Identidad real del nodo (no por texto: hay varios botones "Renombrar").
      const key = el.dataset.qaSeen ?? (el.dataset.qaSeen = String(Math.random()))
      const label = `${el.tagName.toLowerCase()}"${(el.textContent || el.getAttribute('aria-label') || el.id || '').trim().slice(0, 20)}"`
      const focusRing = !!el.parentElement && [...el.parentElement.querySelectorAll('*')].some((n) => getComputedStyle(n).outlineStyle !== 'none' && parseFloat(getComputedStyle(n).outlineWidth) >= 2)
      return { key, label, ok: own || wrapped || shadow || focusRing }
    })
    if (info === null) continue
    if (seen.has(info.key)) break // dio la vuelta
    seen.add(info.key)
    count++
    if (!info.ok) failures.push(info.label)
  }
  return { ok: failures.length === 0 && count > 0, detail: failures.length ? `sin foco visible: ${failures.slice(0, 4).join(' ; ')}` : `${count} elementos con foco` }
}

async function main() {
  const server = EXTERNAL ? null : spawn('npm', ['run', 'preview', '--', '--port', String(PORT), '--strictPort'], { shell: true, stdio: 'ignore' })
  let browser
  try {
    await waitForServer()
    browser = await chromium.launch()

    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
      const page = await ctx.newPage()
      await page.goto(URL)
      await page.getByRole('tab', { name: 'Grupo', exact: true }).waitFor()

      for (const tab of TABS) {
        await openTab(page, tab)
        await check(`${vp.name} · ${tab}: sin scroll horizontal`, () => page.evaluate(noHorizontalScroll))
        await check(`${vp.name} · ${tab}: objetivos táctiles ≥ 44 px`, () => page.evaluate(smallTargets))
        await check(`${vp.name} · ${tab}: foco visible en cada Tab`, () => focusVisibleOnEveryTab(page))
      }

      // Editar (en 360 px el formulario queda lejos del botón)
      await check(`${vp.name} · Editar lleva al formulario y enfoca la descripción`, async () => {
        await openTab(page, 'Gastos')
        const editar = page.getByRole('button', { name: 'Editar', exact: true })
        await editar.last().scrollIntoViewIfNeeded()
        await editar.last().click()
        await page.waitForTimeout(400)
        const r = await page.evaluate(() => {
          const el = document.getElementById('exp-desc')
          const b = el.getBoundingClientRect()
          const bar = document.querySelector('header, nav, [role=tablist]')?.getBoundingClientRect()
          return {
            focused: document.activeElement === el,
            value: el.value,
            inView: b.top >= (bar ? bar.bottom - 1 : 0) && b.bottom <= window.innerHeight,
          }
        })
        return { ok: r.focused && r.inView && r.value === 'Alojamiento', detail: `enfocado ${r.focused}, visible ${r.inView}, valor "${r.value}"` }
      })
      await page.getByRole('button', { name: 'Cancelar edición' }).click()

      // ConfirmDialog: abrir, Esc cierra y devuelve el foco al botón
      await check(`${vp.name} · ConfirmDialog: Esc cierra y devuelve el foco`, async () => {
        await openTab(page, 'Gastos')
        const del = page.locator('main button', { hasText: /^Eliminar$/ }).first()
        await del.scrollIntoViewIfNeeded()
        await del.focus()
        await page.keyboard.press('Enter')
        await page.locator('dialog[open]').waitFor({ timeout: 2000 })
        await page.keyboard.press('Escape')
        await page.waitForTimeout(300)
        const r = await page.evaluate(() => ({
          abierto: !!document.querySelector('dialog[open]'),
          foco: document.activeElement?.textContent?.trim(),
          enMain: !!document.activeElement?.closest('main'),
        }))
        return { ok: !r.abierto && r.foco === 'Eliminar' && r.enMain, detail: `abierto ${r.abierto}, foco en "${r.foco}"` }
      })

      // Toast con Deshacer en la app real
      await check(`${vp.name} · Toast con Deshacer restaura el gasto`, async () => {
        await openTab(page, 'Gastos')
        const total = async () => (await page.locator('main').innerText()).match(/Total: \$ [\d.]+/)?.[0]
        const antes = await total()
        await page.locator('main button', { hasText: /^Eliminar$/ }).first().click()
        await page.locator('dialog[open]').waitFor({ timeout: 2000 })
        await page.locator('dialog[open] button', { hasText: /^Eliminar$/ }).click()
        await page.getByText('Gasto eliminado.').waitFor({ timeout: 2000 })
        const durante = await total()
        await page.getByRole('button', { name: 'Deshacer' }).click()
        await page.waitForTimeout(300)
        const despues = await total()
        return { ok: antes !== durante && antes === despues, detail: `${antes} → ${durante} → ${despues}` }
      })

      await ctx.close()
    }

    // Reduced motion: estado final inmediato en Saldos y pagos (y control: sin reduced motion NO es inmediato)
    const finalInmediato = (page) =>
      page.evaluate(async () => {
        const tab = [...document.querySelectorAll('[role=tab]')].find((b) => b.textContent.trim() === 'Saldos y pagos')
        tab.click()
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))) // ~2 fotogramas, mucho menos de 700 ms
        const t = document.querySelector('main').innerText
        const rows = [...document.querySelectorAll('main li')]
        const ocultas = rows.filter((li) => parseFloat(getComputedStyle(li).opacity) < 1).length
        const cifras = t.includes('137.500') && t.includes('462.500') && t.includes('Saldos finales: todos $ 0') && /4\s*pagos mínimos/.test(t)
        return { cifras, ocultas }
      })
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' })
      const page = await ctx.newPage()
      await page.goto(URL)
      await check(`${vp.name} · reduced motion: Saldos y pagos en estado final inmediato`, async () => {
        const r = await finalInmediato(page)
        return { ok: r.cifras && r.ocultas === 0, detail: `cifras finales ${r.cifras}, filas con opacidad < 1: ${r.ocultas}` }
      })
      await ctx.close()
    }
    // Control: sin reduced motion, a los ~2 fotogramas aún NO está todo en su estado final (si lo estuviera, la comprobación anterior no distinguiría nada).
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' })
      const page = await ctx.newPage()
      await page.goto(URL)
      await check('control: sin reduced motion la entrada es animada (la comprobación distingue)', async () => {
        const r = await finalInmediato(page)
        return { ok: !(r.cifras && r.ocultas === 0), detail: `cifras finales ${r.cifras}, filas con opacidad < 1: ${r.ocultas}` }
      })
      await ctx.close()
    }
  } finally {
    if (browser) await browser.close()
    if (server) stop(server)
  }

  const fallas = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - fallas} PASAN, ${fallas} FALLAN, ${results.length} comprobaciones`)
  process.exit(fallas > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error('FALLA  el script no pudo correr:', e.message)
  process.exit(2)
})

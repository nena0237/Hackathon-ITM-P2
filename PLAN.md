# PLAN

## Tareas

- [x] **T1 [F1] Esqueleto** (R8 base). Hecho cuando: `npm run dev` arranca, `npm run build` y `npm test` pasan. Stack: Vite + React + TS + Tailwind v4 + Vitest + fast-check.
- [x] **T2 [F1] Dinero** (R3, R9). `money.ts`: parsear, validar y formatear COP entero. Hecho cuando: los tests del caso 1 del BRIEF pasan ("150.000", "150000", "10,5", "10.5", "1e9", "abc", 0, negativo, vacío, Infinity, sobre el máximo, espacios).
- [x] **T3 [F1] División con redondeo** (R3). `split.ts`. Hecho cuando: 10.000/3, 1/3, 100/7 y monto < participantes cuadran; el resto va al orden del grupo; propiedad con 600 casos aleatorios (suma de partes = monto).
- [x] **T4 [F1] Saldos netos** (R4). `balances.ts`. Hecho cuando: el seed da los saldos del brief y la propiedad (500 escenarios de 2 a 6 integrantes, 1 a 12 gastos) cumple suma de saldos = 0.
- [x] **T5 [F1] Validación de integrantes** (R1, R9). `members.ts`. Hecho cuando: duplicados (sin mayúsculas, espacios ni tildes; ñ distinta), vacío, 31 caracteres, límite de 6 y bloqueo de eliminar con gastos están probados.
- [x] **T6 [F2] Algoritmo exacto `settle.ts`** (R5). Hecho cuando: el seed da 4 pagos, y los pagos dejan todos los saldos en 0.
- [x] **T7 [F2] Voraz `settleGreedy.ts` y oráculo `oraculo.ts`** (R5, R7). Hecho cuando: el oráculo enumera las 203 particiones de 6, no importa `settle.ts`, y el voraz da 5 en el seed.
- [x] **T8 [F2] Comparación algoritmo vs oráculo** (R5, R7). Hecho cuando: ≥ 5.000 escenarios aleatorios coinciden y voraz ≥ exacto.
- [x] **T9 [F3] Seed y persistencia** (R8). `seed.ts` y `storage/`. Hecho cuando: el seed se carga solo si no hay datos, y recargar conserva los datos; localStorage corrupto no rompe la app.
- [x] **T10 [F3] Flujo principal en UI** (R1, R2, R4, R5, R6). Hecho cuando: se pueden gestionar integrantes, registrar gastos, ver saldos y el plan con el seed.
- [x] **T11 [F4] Resto de requisitos** (R9, extra). Hecho cuando: mensajes en español en toda entrada inválida; editar y borrar gastos recalcula saldos y plan.
- [x] **T12 [F5] Panel de verificación y UX** (R6, R7). Hecho cuando: el panel muestra saldos en $0 tras el plan, n, G con grupos, pagos = n − G y la comparación con el voraz; responsive.
- [ ] **T13 [F7] Despliegue** (todos). Hecho cuando: README de 3 pasos, DEMO.md y URL en Vercel.
- [ ] **T14 [F6] Auditoría cruzada** (R1-R9). Un agente distinto al que construyó (GEM construye la UI; CC audita) prueba los casos hostiles del BRIEF, intenta romper el mínimo y registra en VERIFICATION.md síntoma, causa raíz, severidad y re-prueba. Hecho cuando: hay hallazgos reales (o su ausencia justificada), tests nuevos y `npm test` y `npm run build` en verde.
- [ ] **T15 [F8] DEMO.md** (todos). Guion de 3 a 5 minutos con pasos exactos, explicación de 30 s del mínimo (cota n − G, algoritmo exacto, oráculo, número de casos) y plan B. Hecho cuando: se ensayó una vez cronometrado y la corrida limpia pasa.

## Ajustes de instrucciones
- F0 (1.ª ejecución): BRIEF.md no estaba en la carpeta. El agente reconstruyó BRIEF.md y CONTEXT.md sin el brief real.
- Errores detectados en esa versión: entrada como deudas directas (es de gastos compartidos con división equitativa); n hasta 20 (el máximo es 6 personas); redondeo genérico (el resto va a los primeros participantes en el orden de la lista del grupo); ejemplo +5, +5, −5, −5 falso (el voraz da 2 pagos; el caso real es el seed: exacto 4, voraz 5); oráculo descrito como fuerza bruta sobre pagos (debe enumerar particiones de conjuntos, 203 con 6 personas, en archivo aparte).
- El usuario reemplazó BRIEF.md por el original (379 líneas). Se regeneraron CONTEXT.md, CLAUDE.md, GEMINI.md y AGENTS.md con el brief real. BRIEF.md no se modificó.
- F1: se registraron en CONTEXT.md ("Decisiones") las dos resoluciones del usuario: nombres sin tildes pero con ñ distinta, y empates por orden de la lista del grupo.
- F1: el scaffold se escribió a mano (no con `npm create vite`) para no tocar los archivos existentes. Tailwind v4 con `@tailwindcss/vite`.
- F1: el comando de Bash con heredocs largos falló dos veces por error de parseo; los archivos grandes se escribieron con la herramienta Write. Sin efecto en el resultado.
- F1: se agregó `*.tsbuildinfo` a .gitignore. `members.ts` (validación de integrantes) se hizo en F1 por pedido del caso 2 del BRIEF.
- F2: el oráculo quedó en `src/domain/__tests__/oraculo.ts` (no en `src/domain/tests/`), por coincidir con la carpeta ya existente y con el BRIEF.
- F2: la propiedad B falló en su primera ejecución por un defecto del generador del test (`-0`); el dominio no cambió. Registrado en VERIFICATION.md.
- F2: la propiedad A casi no produce G > 1 (G = 2 en 16 de 5.000, G = 3 en 1) porque los gastos reales rara vez crean subgrupos de suma cero. Por eso existe la propiedad B, que sí los planta.
- F3: trabajo en paralelo con GEM (COORDINACION.md): CC hace dominio, storage, hooks y pages; GEM hace src/ui. Fuentes: DESIGN.md. El orden numérico de T13 (F7) y T14 (F6) no es el cronológico: la auditoría va antes del despliegue.
- F3: `storage.test.ts` se movió a `src/storage/__tests__/` para tener una sola convención de carpetas de pruebas.
- F3 (parcial): hechos storage, seed, `src/hooks` (view-models y hooks, 6 tests) y fuentes. NO hecho: `App.tsx` y `src/pages`, a la espera de LISTO de GEM en HANDOFF.md (src/ui aún en construcción). T10 sigue sin marcar.
- F3: `App.tsx` y `src/pages` (Grupo y Gastos solo lectura, Saldos y pagos completa) hechas con los componentes de src/ui. Formato de dinero: una sola función, `formatAmount` en money.ts (DESIGN.md decía `formatMoney`; la fuente de verdad es el código). La UI pone el signo y pasa valores absolutos. Gestión de integrantes y formulario de gastos (parte de R1 y R2) siguen para F4; T10 se marcó por el flujo de lectura con el seed.
- F4: integrantes (agregar, renombrar, eliminar) y gastos (agregar, editar, borrar) en la UI, con ErrorSummary, ConfirmDialog y Toast con Deshacer. Decisión: eliminar un integrante con gastos se BLOQUEA (regla de CONTEXT.md) y la pantalla explica en cuáles gastos está; no hay "confirmar el efecto". Lógica en `src/domain/expenses.ts` y `src/hooks/actions.ts` (puras). Descripción máx. 60 caracteres (decisión nueva).
- F5: `oraculo.ts` pasó de `__tests__/` a `src/domain/` (se usa en vivo en la pestaña Verificación; sigue sin imports ni operaciones de bits). Nuevo `src/domain/analysis.ts` (n, G, detalle por grupo, exacto, voraz, pagos = n − G, comparación con el oráculo). Pestaña Verificación con `VerificationPanel` de GEM más mi sección de comprobación independiente y saldos tras el plan. README.md escrito (F7 preparada, sin desplegar). T13 sigue abierta (falta URL de Vercel).
- F5b: CC trabaja solo (se levantó la propiedad por rutas). Corregidos los 4 pedidos de la auditoría visual de GEM (error de eliminar integrante con `--error`, borde de 2 px y prefijo "Error:"; foco y scroll al pulsar Editar; `.num` solo en cifras; fines de línea de `src/ui/index.ts`). Se quitó el texto fijo "5.000 escenarios" de la pestaña Verificación. Nuevo `scripts/qa-visual.mjs` (`npm run qa`, Playwright con chromium).

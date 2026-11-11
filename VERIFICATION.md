# VERIFICATION

| Prueba | Resultado | Bug | Causa raíz | Fix | Re-prueba |
|---|---|---|---|---|---|
| F1: 44 tests de dinero, división, saldos e integrantes (+ 5 de monto con coma) | 49/49 pasan | — | — | — | — |
| F2: caso seed (exacto 4, voraz 5, grupos {Ana, Beto, Diego} y {Carla, Elena, Fabián}) | Pasa | — | — | — | — |
| F2: seed con las 720 permutaciones de integrantes | 720/720 dan 4 pagos | — | — | — | — |
| F2: casos 6 y 7 del BRIEF (1, 2 y 3 grupos, 6 con saldo ≠ 0, empates, saldo 0 fuera del plan, plan vacío, orden de salida) | Pasan | — | — | — | — |
| F2: oráculo enumera números de Bell (n = 2..6) | 2, 5, 15, 52, 203 | — | — | — | — |
| F2: propiedad B (grupos de suma cero plantados), 1.ª ejecución | FALLÓ en la corrida 28: `expected -0 to be +0` | Defecto del GENERADOR del test, no del dominio: un grupo plantado con suma 0 producía un saldo `-0` | El generador calculaba el último saldo como `-suma`; con suma 0 da `-0`, y `expect(-0).toBe(0)` falla por `Object.is`. `settle.ts`, `balances.ts` y `split.ts` no generan `-0` (`0 - 0` da `+0`) | Generador: `0 - suma` en lugar de `-suma` | Propiedad B: 5.000/5.000 pasan |
| F2: propiedad A (escenarios reales con split.ts y balances.ts), 5.000 corridas | Pasa; algoritmo = oráculo en las 5.000 | — | — | — | — |
| F2: propiedad B, 5.000 corridas | Pasa; algoritmo = oráculo en las 5.000; G = 2 en 2.645 casos y G = 3 en 435 | — | — | — | — |

Hallazgos de F2 en el dominio (`settle.ts`, `settleGreedy.ts`, `split.ts`, `balances.ts`, `money.ts`): ninguno. El único fallo fue el del generador de la propiedad B, ya corregido.

Cifras de F2 (salida `ESTADISTICAS_F2` de la corrida con `--reporter=verbose`):
- Propiedad A: 5.000 corridas. G = 0: 61, G = 1: 4.922, G = 2: 16, G = 3: 1. Voraz > exacto: 1 vez.
- Propiedad B: 5.000 corridas. G = 0: 40, G = 1: 1.880, G = 2: 2.645, G = 3: 435. Voraz > exacto: 244 veces.

## Cierre de F2 y avance de F3 (2026-11-11)
- Re-corrida de F2 con `--reporter=verbose`: 5.000 corridas por propiedad. A: G = 0: 63, G = 1: 4.914, G = 2: 23, voraz > exacto 1 vez. B: G = 0: 30, G = 1: 1.942, G = 2: 2.607, G = 3: 421, voraz > exacto 220 veces. Las cifras varían entre corridas (semillas aleatorias); la propiedad B es la que ejerce G > 1.
- `oraculo.ts`: sin ningún `import` ni bitmask (grep).
- Carpeta de pruebas única: `storage.test.ts` movido a `src/storage/__tests__/`.
- F3 hooks: `src/hooks/__tests__/viewModels.test.ts` (6 tests): seed (saldos, plan de 4, n = 6, G = 2, voraz 5, saldos finales 0), sin gastos, y propiedad de 1.000 escenarios (saldos suman 0, saldos finales 0, pagos = n − G, voraz ≥ exacto). Total: 83 tests en verde y `npm run build` sin errores.
- NO verificado aún: nada de la UI (App.tsx y pages no existen todavía), ni la demo en navegador.

## F3: pantallas (2026-11-11)
- `npm test`: 83/83 en verde. `npm run build`: sin errores.
- Navegador (Chrome, escritorio 1280 px, servidor en 5173), texto de la página con el seed: saldos −137.500, −137.500, −287.500, +275.000, −175.000, +462.500; 4 pagos (Ana→Diego 137.500, Beto→Diego 137.500, Carla→Fabián 287.500, Elena→Fabián 175.000); "4 pagos mínimos, comprobados. El método simple necesitaría 5."; "Saldos finales: todos $ 0". Captura de la parte superior: barras con trama (debe) y lima (le deben) correctas.
- Formato de dinero: `formatAmount` probado con $ 137.500, $ 0 y negativos (`-$ 287.500`) en money.test.ts. En pantalla el signo + o − lo pone la UI.
- NO verificado: 360 px (el redimensionado de la ventana no cambió el viewport), reduced motion, recarga conservando datos en el navegador, pestañas Grupo y Gastos en pantalla, animaciones, contraste y foco por teclado. No hay pruebas automáticas de componentes.

## F4: integrantes y gastos (2026-11-11)
- Fin de línea: `git ls-files --eol src/ui`: todos `i/lf w/lf`, salvo `src/ui/index.ts` con `w/mixed` (copia de trabajo con finales mezclados; el índice está en lf). Sin otros.
- `npm test`: 101/101 (8 archivos); 18 nuevos en `src/hooks/__tests__/actions.test.ts`: montos inválidos (8), todos los campos malos a la vez, descripción de 61 caracteres, pagador fuera del grupo, pagador que no participa, 6.º y 7.º integrante, duplicados sin tildes (ñ distinta), renombrar, eliminar bloqueado, agregar/editar/borrar/restaurar con saldos finales 0 y pagos = n − G, Propina 100.000 entre 3, ids. `npm run build` sin errores.
- Navegador (Chrome, 1280 px, manejado por script): formulario vacío da 4 errores en español con resumen; "10,5" da el mensaje de la coma; agregar Propina 100.000 (pagó Ana, 3 participantes) la lista y da "Saldos finales: todos $ 0" (5 pagos); editar precarga los valores; borrar pide confirmación, deja el total en $ 1.200.000 y 4 pagos con saldos en $ 0; Deshacer lo restaura; eliminar a Ana muestra los gastos donde está; renombrar a un duplicado ("  ana maria ") da error; Agregar queda deshabilitado con 6; recargar conserva el nombre nuevo.
- Hallazgo propio: mi primer script de prueba tomó el `<dialog>` equivocado (hay dos en el DOM); fue un defecto del script, no de la app.
- NO verificado: 360 px, reduced motion, teclado y foco del ConfirmDialog, lector de pantalla, localStorage corrupto desde el navegador (solo por pruebas de storage), y el aviso "método simple necesitaría N" con el caso de 5 pagos (el banner no lo muestra cuando simple = exacto). No hay pruebas automáticas de componentes: la UI se probó a mano.

## F5: análisis, oráculo en vivo y pestaña Verificación (2026-11-11)
- `npm test`: 110/110 (9 archivos); 9 nuevos en `src/hooks/__tests__/verification.test.ts`. `npm run build` sin errores.
- `oraculo.ts` movido a `src/domain/`: grep de `import` y operadores de bits: sin coincidencias (solo un comentario que dice que no los usa). Imports de las pruebas actualizados; las propiedades A y B siguen en verde.
- Caso semilla: n = 6, G = 2, exacto 4, oráculo 4, voraz 5, coinciden; 203 particiones; grupos {Ana, Beto, Diego} y {Carla, Elena, Fabián}, 2 pagos cada uno.
- 3 casos creados con el voraz peor, armados como estados reales (gastos de un participante) y balances [-4,-3,2,2,3], [-5,-4,2,3,4] y [-3,-2,-2,3,4] (×10.000): los tres dan n = 5, G = 2, exacto 3, oráculo 3, voraz 4. Búsqueda previa: en 5 personas con saldos de −5 a 5 hay casos; en 4 personas no encontré ninguno, y en 6 personas no encontré uno con G = 3 en ese rango.
- Aviso "el método simple necesitaría N" (antes sin probar): `renderToStaticMarkup(MinimumBanner)` da "necesitaría 4." en los 3 casos, "necesitaría 5." con 4 contra 5, y "necesita los mismos pagos" cuando son iguales. (El aviso con igualdad no dice "necesitaría", dato que mi grep de la entrega anterior no esperaba.)
- Navegador (`npm run preview` en 4173, 1280 px): con el seed, la pestaña Verificación muestra "Mínimo absoluto: 4 = 6 − 2", los dos grupos, "el método simple necesita 5; el plan exacto ahorra 1", oráculo 4 y coinciden, saldos finales $ 0. Tras agregar la Propina de 100.000 desde la pestaña Gastos, la pestaña se actualiza (oráculo 5, exacto 5, voraz 5, coinciden). Restaurar el ejemplo la devuelve a 4 contra 5.
- Revisión de repo: `npm run preview` funciona; sin secretos ni rutas absolutas en archivos versionados (grep).
- NO verificado: 360 px de la pestaña Verificación, reduced motion, la animación de armado al entrar al viewport, teclado y lector de pantalla, preview en otro equipo, `npm ci` desde cero (F7), despliegue en Vercel. El texto "5.000 escenarios aleatorios por propiedad" de la pestaña es fijo, no se calcula en vivo.

## F5b: QA visual repetible y correcciones de la auditoría de GEM (2026-11-11)
- Corregidos los 4 pedidos (error de eliminar integrante, foco al Editar en 360 px, `.num` solo en cifras, fines de línea de `src/ui/index.ts`; los 6 archivos de `src/ui` con una línea en blanco añadida se dejaron iguales al índice). El texto fijo de Verificación ahora solo remite a `npm test` y a este archivo.
- `npm run qa` (`scripts/qa-visual.mjs`, Playwright + Chromium 158, sobre `npm run preview`): **33 PASAN, 0 FALLAN**. Por viewport (360 y 1280 px) y por pestaña (Grupo, Gastos, Saldos y pagos, Verificación): sin scroll horizontal; objetivos táctiles ≥ 44 x 44 (19, 22, 5 y 5 objetivos medidos); foco visible en cada Tab (14, 19, 2 y 2 elementos recorridos). Además, por viewport: Editar enfoca la descripción y la deja visible; ConfirmDialog cierra con Esc y devuelve el foco; Toast con Deshacer restaura el total ($ 1.200.000 → $ 1.050.000 → $ 1.200.000). Reduced motion: estado final inmediato en Saldos y pagos (cifras finales y 0 filas con opacidad < 1).
- Defecto de MI script en la primera corrida: la comprobación de foco recorría solo 2 elementos por pestaña porque identificaba los nodos por su texto (varios botones "Renombrar") y cortaba el recorrido. Corregido con identidad de nodo; ahora recorre 14 y 19. Los 33 "PASA" de la primera corrida no valían para el foco.
- Controles (que el script distingue): contra el commit anterior a las correcciones (`d3ec983`, servido con `QA_URL`), FALLAN las 2 comprobaciones de Editar (360 y 1280 px) y pasan 31: el script detecta ese defecto. Con `reducedMotion: no-preference` la entrada NO es inmediata (4 filas con opacidad < 1), y esa comprobación de control pasa. No hay control equivalente para el error de eliminar integrante, `.num` ni fines de línea: el script no los mide (se corrigieron y se vieron en el diff, no hay prueba automática).
- Clon limpio (`git clone` del repo local en una carpeta temporal en el commit `64552d9`): `npm ci` sin vulnerabilidades, `npm test` 110/110 y `npm run build` sin errores. Carpeta temporal eliminada.
- Observación sobre el voraz: en la búsqueda de casos donde el voraz usa más pagos que el exacto, con 4 personas (saldos de −5 a 5, sin ceros) no encontré ninguno; con 5 personas sí (120 combinaciones con saldos de −4 a 4). No es una demostración de que con 4 no ocurra, solo lo que halló esa búsqueda.
- NO verificado: Safari y Firefox (solo Chromium), un teléfono real, lector de pantalla, contraste medido por herramienta (solo los valores del DESIGN.md), el armado animado de Verificación al entrar al viewport, y la comprobación automática de `.num` y del color del error. `npm run qa` necesita `npx playwright install chromium` la primera vez; en el clon limpio no corrí `npm run qa`.

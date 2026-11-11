<minimal_transactions_brief>

<como_usar_este_archivo>
Este archivo es el contexto base del reto **Minimal Transactions** (hackathon Prompt & Solve). Ponlo en tu proyecto de Claude Y copia el mismo archivo a la raíz del repo como `BRIEF.md` para que los agentes de código (Antigravity y Claude Code) lo lean.

Flujo de trabajo, fase por fase:
1. Dile a tu Claude "Fase N". Te entrega el prompt de esa fase, listo para pegar en el agente de código.
2. Pegas el prompt en el agente. Cuando termine, pegas su reporte a tu Claude.
3. Tu Claude revisa el reporte contra el checkpoint de la fase. Si algo no cumple, da UNA instrucción correctiva corta (no se reinicia). Si cumple, avanza.
4. Nunca se salta una fase ni se pasa a la siguiente sin cerrar el checkpoint.
</como_usar_este_archivo>

<instrucciones_para_el_asistente>
Eres el copiloto de estrategia. NO escribes el código: entregas prompts para los agentes de código y revisas sus reportes.

Reglas:
- Cuando la usuaria o el usuario diga "Fase N", entrega SOLO el prompt de esa fase (de <fases>), en un bloque de código, más 2 líneas: qué se espera al terminar y cómo saber si salió bien.
- Prompts cortos y densos. No repitas la rúbrica dentro del prompt.
- Cuando pegue el reporte del agente: compáralo con el <checkpoint>. Di con honestidad qué cumple y qué no. Si hay fallos, da una instrucción correctiva corta y pide que el agente la registre en "Ajustes de instrucciones" de PLAN.md.
- Este reto se gana en la verificación. Insiste en que la demostración de "el mínimo es mínimo" sea REAL: dos implementaciones independientes (algoritmo y oráculo) comparadas en miles de casos aleatorios. No aceptes "pasó los tests" sin ver el número de casos y el resultado.
- NO aceptes bugs inventados en VERIFICATION.md: deben ser reales (síntoma, causa raíz, fix, re-prueba). Si la auditoría no encontró nada, que lo registre así y agregue pruebas.
- Un solo CLI trabaja a la vez sobre el repo. Recomendación: Antigravity construye (F1 a F5), Claude Code audita (F6), luego quien prefieran para F7 y F8.
- La mitad de la nota es el proceso: CONTEXT.md, PLAN.md y VERIFICATION.md son parte del entregable.
- Si el tiempo se acaba, aplica el orden de recorte de <recorte_si_falta_tiempo>.
- Idioma de la interfaz y de los documentos: español.
</instrucciones_para_el_asistente>

<rubrica>
Cada criterio: 0 = ausente, 1 = limitado, 2 = adecuado, 3 = sólido, 4 = excelente.

| Criterio | Peso | Aspecto evaluado |
|---|---|---|
| Demostración funcional | 20 % | El flujo principal funciona en vivo de principio a fin |
| Resolución del problema | 15 % | Cumple los requisitos del reto |
| Experiencia de usuario y acabado | 15 % | Interfaz intuitiva; maneja errores comunes de entrada |
| Descomposición de tareas | 15 % | Tareas manejables; ajustan sus instrucciones según sea necesario |
| Gestión del contexto | 15 % | Dan requisitos, archivos y restricciones relevantes al agente |
| Verificación y depuración | 20 % | Revisan lo generado, investigan problemas, validan correcciones |

Producto (demo + problema + UX) = 50 %. Proceso con el agente (descomposición + contexto + verificación) = 50 %.
</rubrica>

<contexto_para_agente>

<reto_literal>
Evento Prompt & Solve: Hackathon asistida por IA. Equipos desarrollan una aplicación funcional con agentes de programación con IA, demostrando capacidad de entregar resultados Y de supervisar críticamente el trabajo generado por IA.

Alcance común: aplicación funcional que conserve los datos al recargar la página. Se permiten datos de ejemplo y almacenamiento local. Inicio de sesión, integraciones externas y funciones de IA dentro de la aplicación son opcionales.

Reto 4. Minimal Transactions: divisor de gastos con transacciones mínimas.
- Objetivo: ayudar a un grupo a saldar gastos compartidos mediante el menor número posible de pagos.
- Información requerida: integrantes del grupo; descripción del gasto, monto, persona que pagó y participantes entre quienes se divide.
- Funciones principales: registrar gastos; dividir cada gasto en partes iguales entre los participantes seleccionados; mostrar el saldo neto de cada persona; generar un plan que indique quién paga a quién y cuánto.
- Reglas básicas: admitir hasta seis personas y una sola moneda. Permitir pagos entre cualquier par de integrantes. Manejar el redondeo de forma consistente para que los totales cuadren. El plan debe utilizar el mínimo absoluto de pagos, no solo reducir su cantidad.
- Demostración: registrar gastos pagados por distintos integrantes, mostrar los saldos resultantes y demostrar que los pagos propuestos dejan todos los saldos en cero. Explicar brevemente cómo se verificó que la cantidad de pagos es mínima.
- Usar datos personales ficticios y priorizar el flujo requerido antes de agregar funciones adicionales.
</reto_literal>

<requisitos>
- R1: Gestionar integrantes del grupo (mínimo 2, máximo 6).
- R2: Registrar gastos: descripción, monto, quién pagó, participantes entre quienes se divide.
- R3: Dividir cada gasto en partes iguales entre los participantes, con redondeo consistente: los totales siempre cuadran.
- R4: Mostrar el saldo neto de cada persona.
- R5: Generar un plan de pagos (quién paga a quién y cuánto) con el MÍNIMO ABSOLUTO de pagos, permitiendo pagos entre cualquier par de integrantes.
- R6: Demostrar que, aplicando el plan, todos los saldos quedan en cero.
- R7: Explicar y evidenciar cómo se verificó que la cantidad de pagos es mínima (también dentro de la app).
- R8: Los datos persisten al recargar la página.
- R9: Validación de entradas con mensajes claros en español.
- Extra (solo después del flujo principal): editar y borrar gastos.
</requisitos>

<stack>
- React + Vite + TypeScript + Tailwind CSS. Responsive.
- Persistencia en localStorage (clave versionada, ej. `splitter:v1`).
- Vitest para pruebas y `fast-check` para pruebas de propiedades (casos aleatorios).
- Lógica de negocio en funciones PURAS en `src/domain/` (sin React, sin localStorage). La UI solo llama a esas funciones.
- Sin backend, sin login, sin APIs externas ni IA en la app.
- Despliegue: Vercel.
</stack>

<estructura_carpetas>
```
/
├─ BRIEF.md  CONTEXT.md  PLAN.md  VERIFICATION.md  DEMO.md  README.md
├─ GEMINI.md  CLAUDE.md  AGENTS.md          (copias de CONTEXT.md)
└─ src/
   ├─ domain/
   │  ├─ money.ts        (parseo, formato, validación de montos)
   │  ├─ split.ts        (división equitativa con redondeo)
   │  ├─ balances.ts     (saldos netos)
   │  ├─ settle.ts       (plan de pagos MÍNIMO exacto)
   │  ├─ settleGreedy.ts (método simple, SOLO para comparar)
   │  └─ __tests__/      (tests + oraculo.ts independiente)
   ├─ data/seed.ts
   ├─ storage/
   ├─ components/
   └─ pages/             (Grupo, Gastos, Saldos y pagos, Verificación)
```
</estructura_carpetas>

<reglas_de_dominio>
- Moneda única: pesos colombianos (COP), SIN decimales. Todo el dinero son números ENTEROS (pesos). Prohibido usar flotantes para dinero. La moneda es una constante única en `money.ts`.
- Entrada de monto: dígitos, con puntos de miles opcionales ("150.000" o "150000"). Se rechaza: vacío, 0, negativo, texto, decimales ("10.5", "10,5"), notación científica y montos mayores a 1.000.000.000.000. Mensajes claros en español.
- Formato de salida: `$ 137.500` (es-CO).
- Integrantes: de 2 a 6, nombres únicos (comparados sin tildes, sin mayúsculas, sin espacios extra), no vacíos, máximo 30 caracteres. No se puede eliminar un integrante que participa en gastos (mensaje que lo explique).
- Gasto: descripción obligatoria, monto válido, quien pagó (debe ser integrante) y al menos 1 participante. El pagador puede o no ser participante.
- División equitativa y redondeo: `base = floor(monto / k)`, `resto = monto − base·k`. A los primeros `resto` participantes, EN EL ORDEN DE LA LISTA DE INTEGRANTES DEL GRUPO (no en el orden de selección), se les suma 1 peso. Invariante: la suma de las partes es EXACTAMENTE el monto. Determinista: mismos datos, mismo resultado.
- Saldo neto de una persona = (suma de lo que pagó) − (suma de sus partes). Positivo: le deben. Negativo: debe. Invariante: la suma de todos los saldos es SIEMPRE 0.
- Plan de pagos: se consideran solo personas con saldo ≠ 0. Cada pago: de un deudor a un acreedor, monto entero > 0. Se permite cualquier par. Si todos están a mano, el plan es vacío con el mensaje "Todos están a mano".
- Orden de salida determinista del plan: por deudor (orden de la lista del grupo) y luego por acreedor.
</reglas_de_dominio>

<fundamento_algoritmo>
Resultado teórico que debe implementarse y documentarse en CONTEXT.md:

1. Sea `n` el número de personas con saldo ≠ 0.
2. Todo plan de pagos forma un grafo entre esas personas. Cada componente conexo del grafo debe sumar 0, y un componente de `m` personas necesita al menos `m − 1` pagos para estar conexo.
3. Por tanto, pagos ≥ `n − g`, donde `g` es el número de componentes, y `g` no puede superar `G`, el MÁXIMO número de grupos disjuntos con suma cero en que se pueden partir esas `n` personas.
4. Cota alcanzable: un grupo de suma cero de `m` personas se salda con exactamente `m − 1` pagos (cada pago cancela a al menos una persona, y el último cancela a dos).
5. **Mínimo absoluto = `n − G`.**

Cómo calcular `G` con 6 personas como máximo: programación dinámica sobre subconjuntos (bitmask, 2^n ≤ 64 máscaras): para cada subconjunto de suma cero, `f(máscara) = 1 + máx f(máscara ∖ s)` sobre submáscaras `s` de suma cero que contienen el primer bit. Se reconstruyen los grupos y cada uno se salda con `m − 1` pagos.

El método simple (voraz: el mayor deudor paga al mayor acreedor) NO siempre es mínimo. Se implementa aparte (`settleGreedy.ts`) solo para comparar y demostrar el valor del algoritmo exacto.
</fundamento_algoritmo>

<datos_seed>
Seis integrantes ficticios, en este orden: Ana, Beto, Carla, Diego, Elena, Fabián. Se cargan solo si no hay datos guardados.

| Gasto | Monto (COP) | Pagó | Participantes |
|---|---|---|---|
| Mercado | 150.000 | Fabián | los 6 |
| Cena | 600.000 | Fabián | Diego, Elena, Carla, Fabián |
| Alojamiento | 450.000 | Diego | Ana, Beto, Carla, Fabián |

Saldos esperados: Ana −137.500, Beto −137.500, Carla −287.500, Diego +275.000, Elena −175.000, Fabián +462.500 (suma 0).

Resultado esperado: el mínimo es **4 pagos** (grupos de suma cero {Diego, Ana, Beto} y {Fabián, Carla, Elena}): Ana→Diego 137.500, Beto→Diego 137.500, Carla→Fabián 287.500, Elena→Fabián 175.000. El método simple necesita **5 pagos** con estos mismos datos. Esa diferencia es el centro de la demo.

Caso de redondeo para la demo y las pruebas (se agrega EN VIVO, no va en el seed): "Propina" de 100.000 entre 3 participantes → partes 33.334, 33.333 y 33.333, y los totales cuadran.
</datos_seed>

<casos_de_prueba_hostiles>
Estos casos los debe cubrir la suite de pruebas (F1, F2) y la auditoría (F6):
1. Monto: "", 0, −5, "abc", "10.5", "10,5", "1e9", "150.000", "150000", Infinity, 1.000.000.000.001, espacios alrededor.
2. Integrantes: 1 (no se puede calcular el plan), 2, 6, 7 (rechazo con mensaje), nombres duplicados ("Ana" y " ana "), vacío, 31 caracteres, eliminar uno que tiene gastos.
3. Participantes: ninguno (rechazo), solo el pagador, todos, el pagador no participa.
4. Redondeo: 10.000 entre 3, 1 peso entre 3, 100 entre 7, monto menor que el número de participantes. La suma de partes es SIEMPRE el monto. El peso extra va a los primeros del orden del grupo.
5. Saldos: la suma es 0 siempre; todos a mano → plan vacío; un deudor y un acreedor; personas con saldo 0 no aparecen en el plan.
6. Algoritmo: el caso seed (exacto = 4, voraz = 5); un solo grupo sin sub-suma cero; dos y tres grupos; 6 personas todas con saldo ≠ 0; empates; el mismo caso con los integrantes en otro orden da la MISMA cantidad de pagos; resultado determinista.
7. Aplicar el plan deja todos los saldos en exactamente 0 y ningún pago tiene monto ≤ 0.
8. Persistencia: recargar tras agregar, editar y borrar; localStorage corrupto o de formato viejo no rompe la app; editar o borrar un gasto recalcula saldos y plan.
9. Aleatorios (fast-check): al menos 5.000 escenarios de 2 a 6 integrantes y 1 a 12 gastos; en cada uno: suma de saldos = 0; plan deja saldos en 0; pagos del algoritmo = pagos del oráculo; voraz ≥ exacto.
</casos_de_prueba_hostiles>

<verificacion_del_minimo>
Es el corazón del reto y del 20 % de verificación. Debe existir en tres lugares:
1. **Tests con oráculo independiente.** `__tests__/oraculo.ts` calcula el mínimo con OTRO método: enumera todas las particiones de conjuntos (para 6 personas son 203) y toma la que tenga más grupos de suma cero. No importa nada de `settle.ts` ni usa bitmask. Los tests comparan algoritmo contra oráculo en miles de casos aleatorios.
2. **Panel "Verificación" en la app.** Muestra: saldos después de aplicar el plan (todos $0 ✔), personas con saldo ≠ 0 (n), grupos de suma cero encontrados (G) con sus integrantes, pagos = n − G, la frase de por qué no puede haber menos, y la comparación con el método simple ("el método simple necesitaría N pagos").
3. **Texto en DEMO.md** con la explicación de 30 segundos y el número de casos aleatorios comprobados.
</verificacion_del_minimo>

<definicion_de_hecho>
- Un comando instala y corre (README de máximo 3 pasos).
- El flujo de demo funciona de principio a fin con los datos seed.
- Cada requisito R1 a R9 tiene su fila en la tabla requisito → dónde está en la app (README).
- Entradas inválidas muestran mensajes claros en español, sin pantallas rotas ni trazas.
- `npm test` pasa (incluyendo la comparación contra el oráculo en 5.000 casos o más). `npm run build` pasa sin errores.
- CONTEXT.md, PLAN.md y VERIFICATION.md existen y están actualizados.
</definicion_de_hecho>

</contexto_para_agente>

<fases>

<fase id="F0" nombre="Contexto y andamiaje de proceso">
<objetivo>El agente entiende el reto y deja los documentos de proceso listos. Sin código todavía.</objetivo>
<rubrica_que_suma>Gestión del contexto (15 %), Descomposición (15 %)</rubrica_que_suma>
<prompt>
```
Eres mi agente de desarrollo. Lee BRIEF.md, solo la sección <contexto_para_agente>.
Todavía NO escribas código. Crea:
1. CONTEXT.md: objetivo, requisitos R1-R9, reglas de dominio, fundamento del algoritmo, stack y por qué, estructura de carpetas, definición de hecho. Cópialo como GEMINI.md, CLAUDE.md y AGENTS.md.
2. PLAN.md con dos secciones vacías: "Tareas" y "Ajustes de instrucciones" (qué cambió y por qué).
3. VERIFICATION.md con la tabla vacía: Prueba | Resultado | Bug | Causa raíz | Fix | Re-prueba.
Al final dime en 5 líneas cómo entendiste el reto y por qué el voraz no garantiza el mínimo.
```
</prompt>
<checkpoint>Existen los 6 archivos. El resumen explica que el mínimo es n − G (grupos de suma cero) y que el voraz puede fallar. Si lo describe como "emparejar mayor con mayor" sin más, no entendió: corregir antes de seguir.</checkpoint>
</fase>

<fase id="F1" nombre="Plan, esqueleto, dinero, división y saldos">
<objetivo>Proyecto que corre, plan de tareas pequeñas y la base numérica (dinero entero, redondeo, saldos) probada.</objetivo>
<rubrica_que_suma>Descomposición (15 %), Verificación (20 %), Resolución (15 %)</rubrica_que_suma>
<prompt>
```
Fase 1. Haz en orden, cerrando cada paso:
1. Llena PLAN.md con tareas T1..Tn: checkbox, criterio de hecho verificable y requisito que cubren. Orden: esqueleto → dinero/división/saldos → algoritmo exacto + oráculo → flujo principal con seed → resto de requisitos → panel de verificación y UX → despliegue.
2. Esqueleto: Vite + React + TS + Tailwind + Vitest + fast-check. Corre con `npm run dev`.
3. src/domain, funciones puras, todo en pesos enteros: money.ts (parsear, validar, formatear), split.ts (división con resto a los primeros del orden del grupo), balances.ts (saldos netos).
4. Tests para los casos 1 a 5 de <casos_de_prueba_hostiles>, más un test de propiedad: suma de partes = monto y suma de saldos = 0 en cientos de casos aleatorios.
5. `npm test`. Registra en PLAN.md cada tarea cerrada y cualquier ajuste que hayas hecho a mis instrucciones.
Reporte: tareas cerradas, output de los tests, dudas.
```
</prompt>
<checkpoint>`npm test` pasa y muestra la salida real. No hay flotantes en el dinero (pide que lo confirme buscando `parseFloat` y divisiones sin `Math.floor`). PLAN.md tiene tareas con criterio de hecho.</checkpoint>
</fase>

<fase id="F2" nombre="Algoritmo mínimo exacto + oráculo independiente">
<objetivo>El plan de pagos mínimo, comprobado contra un oráculo independiente en miles de casos. Es la fase decisiva.</objetivo>
<rubrica_que_suma>Verificación (20 %), Resolución (15 %), Demostración (20 %)</rubrica_que_suma>
<prompt>
```
Fase 2. Implementa y verifica el plan mínimo, según <fundamento_algoritmo> y <verificacion_del_minimo>:
1. settle.ts: plan exacto con DP sobre subconjuntos. Devuelve pagos [{de, a, monto}], los grupos de suma cero y n, G. Orden de salida determinista. Aserción interna: pagos = n − G.
2. settleGreedy.ts: método simple (mayor deudor paga al mayor acreedor), solo para comparar.
3. __tests__/oraculo.ts: mínimo por enumeración de particiones de conjuntos. NO importes nada de settle.ts ni uses bitmask.
4. Tests: casos 6, 7 y 9 de <casos_de_prueba_hostiles> (5.000 escenarios aleatorios o más con fast-check). Confirma con el caso seed: exacto 4, voraz 5.
5. Si algún caso falla: investiga causa raíz, corrige, re-prueba y regístralo en VERIFICATION.md.
Reporte: nº de casos comprobados, nº de veces que voraz > exacto, resultado del oráculo, bugs encontrados.
```
</prompt>
<checkpoint>El reporte da el número exacto de casos aleatorios (5.000 o más) y que algoritmo y oráculo coinciden en todos. El caso seed da 4 contra 5. El oráculo está en un archivo separado, sin importar settle.ts. Si el agente no encontró ni un solo bug, es normal en esta fase: se verifica en F6.</checkpoint>
</fase>

<fase id="F3" nombre="Flujo principal de punta a punta">
<objetivo>La demo del reto funcionando con datos seed: gastos, saldos, plan mínimo y saldos en cero.</objetivo>
<rubrica_que_suma>Demostración funcional (20 %), Resolución (15 %)</rubrica_que_suma>
<prompt>
```
Fase 3. Construye el flujo principal sobre src/domain, sin duplicar lógica en la UI:
- src/data/seed.ts con el grupo y los 3 gastos de <datos_seed>.
- Storage en localStorage `splitter:v1`; si no hay datos, cargar seed; si está corrupto, no romper.
- Pantallas: Grupo (integrantes), Gastos (lista + formulario simple), Saldos y pagos (saldo neto por persona y plan "A paga $X a B"), con el total de pagos visible.
- Tras aplicar el plan mostrar "Saldos finales: todos $0".
Prueba la demo completa en el navegador y corrige. Marca tareas en PLAN.md y anota ajustes.
Reporte: qué se ve, qué falló y corregiste.
```
</prompt>
<checkpoint>Con el seed se ven los saldos de <datos_seed>, el plan tiene 4 pagos y los saldos finales son $0. Recargar conserva todo.</checkpoint>
</fase>

<fase id="F4" nombre="Resto de requisitos y validación">
<objetivo>Integrantes, gastos y validaciones completas. Todos los requisitos cubiertos.</objetivo>
<rubrica_que_suma>Resolución (15 %), UX (15 %)</rubrica_que_suma>
<prompt>
```
Fase 4. Completa R1-R9:
- Integrantes: agregar y quitar (2 a 6, únicos, bloquear quitar uno con gastos con mensaje claro).
- Formulario de gasto: descripción, monto, quién pagó, participantes (con "todos"). Errores en español debajo de cada campo, sin alertas del navegador. Vista previa de la división con el reparto del resto.
- Estado vacío con mensaje útil y botón "cargar datos de ejemplo".
- Extra solo si queda tiempo: editar y borrar gastos (recalcula todo).
Agrega al README la tabla requisito → dónde está en la app. Actualiza PLAN.md.
Reporte: tabla R1-R9 con su estado.
```
</prompt>
<checkpoint>Cada R1 a R9 tiene una fila con ubicación real. Probar a mano: monto "10,5", "abc" y 0 muestran error claro; un séptimo integrante se rechaza; agregar la Propina de 100.000 entre 3 reparte 33.334 / 33.333 / 33.333.</checkpoint>
</fase>

<fase id="F5" nombre="Panel de verificación en la app y pulido de UX">
<objetivo>La demostración de que el mínimo es mínimo, visible en la app, y una interfaz limpia.</objetivo>
<rubrica_que_suma>Demostración (20 %), UX (15 %), Verificación (20 %)</rubrica_que_suma>
<prompt>
```
Fase 5. Dos partes:
1. Pantalla "Verificación" según <verificacion_del_minimo> punto 2: saldos tras el plan, n, grupos de suma cero con sus integrantes, pagos = n − G, explicación corta de por qué no puede haber menos, y comparación con el método simple ("necesitaría N pagos").
2. Pulido: diseño limpio y consistente, responsive (360 px y escritorio), textos 100 % en español, formato $ 137.500, color más texto para positivo y negativo, foco y etiquetas accesibles, mensajes al guardar.
Corre `npm test` y `npm run build`. Anota en PLAN.md lo que cambiaste.
Reporte: qué se ve en la pantalla de verificación con el seed.
```
</prompt>
<checkpoint>Con el seed, la pantalla muestra n = 6, G = 2, pagos = 4, y "el método simple necesitaría 5 pagos". Una persona que no vio el código entiende en 20 segundos por qué 4 es el mínimo.</checkpoint>
</fase>

<fase id="F6" nombre="Verificación cruzada (la fase más importante)">
<objetivo>Un agente DISTINTO al que construyó audita la app y se documentan bugs reales con causa raíz y re-prueba.</objetivo>
<rubrica_que_suma>Verificación y depuración (20 %), Descomposición (15 %)</rubrica_que_suma>
<instruccion_previa>Cambia de CLI: si construyó Antigravity, audita Claude Code (o al revés). El auditor no debe haber visto el razonamiento del constructor. Haz commit antes de empezar.</instruccion_previa>
<prompt_auditor>
```
Eres auditor independiente. No asumas que lo generado funciona. Lee CONTEXT.md y BRIEF.md.
1. Ejecuta `npm test` y `npm run build`. Revisa src/domain buscando errores de lógica: flotantes, redondeo, orden del resto, saldos, la DP y la reconstrucción de grupos. Revisa que el oráculo sea de verdad independiente y que los tests aleatorios usen suficientes casos.
2. Prueba la app con <casos_de_prueba_hostiles> y entradas inesperadas (montos raros, nombres duplicados, quitar integrantes, localStorage corrupto, recargas, editar y borrar).
3. Intenta romper el mínimo: busca un escenario donde el plan no sea mínimo o deje un saldo ≠ 0.
4. Por cada hallazgo, en VERIFICATION.md: síntoma → causa raíz (investigada, no adivinada) → severidad. NO inventes bugs: si no hay, dilo y agrega los tests que faltan.
No corrijas todavía. Dame la lista priorizada.
```
</prompt_auditor>
<prompt_correccion>
```
Corrige los hallazgos de VERIFICATION.md uno por uno, de mayor a menor severidad. Por cada uno: fix → escribe un test que falle sin el fix → re-prueba y registra el resultado en VERIFICATION.md. No cierres un bug sin re-prueba. Al final corre todo `npm test` y `npm run build`.
```
</prompt_correccion>
<checkpoint>VERIFICATION.md tiene hallazgos reales con las 4 columnas llenas y tests nuevos. Si el auditor no halló nada, es sospechoso: pídele probar de nuevo redondeo con montos menores que el número de participantes, el orden del resto, el formato de monto "150.000" y la UI al editar o borrar gastos.</checkpoint>
</fase>

<fase id="F7" nombre="Despliegue y corrida limpia">
<objetivo>URL pública funcionando y proyecto que arranca desde cero con un comando.</objetivo>
<rubrica_que_suma>Demostración (20 %), Gestión del contexto (15 %)</rubrica_que_suma>
<prompt>
```
Fase 7. Prepara el despliegue:
- README: título, qué hace, instalación y ejecución en máximo 3 pasos, tabla requisito → app, cómo correr tests, cómo se verificó el mínimo (resumen), URL desplegada (placeholder).
- Verifica desde cero: borra node_modules y dist, `npm ci`, `npm test`, `npm run build`, `npm run preview`. Corrige lo que falle.
- Confirma que no hay secretos ni rutas locales en el repo y que .gitignore es correcto.
Reporte: salida de cada comando.
```
</prompt>
<pasos_manuales>
1. Subir el repo a GitHub.
2. En Vercel: Add New Project → importar el repo → framework Vite (detecta solo) → Deploy.
3. Abrir la URL, repetir la demo completa y recargar.
4. Pegar la URL en el README.
</pasos_manuales>
<checkpoint>La URL carga, el flujo de demo funciona con el seed y recargar conserva los datos. La corrida limpia pasó.</checkpoint>
</fase>

<fase id="F8" nombre="Guion de demo y corrida final">
<objetivo>Demo ensayada, con plan B, y documentación final actualizada.</objetivo>
<rubrica_que_suma>Demostración (20 %), todos los criterios de proceso</rubrica_que_suma>
<prompt>
```
Fase 8. Cierra el proyecto:
1. DEMO.md: guion de 3 a 5 minutos con pasos exactos y qué decir. Debe mostrar: grupo de 6, gastos pagados por distintas personas (seed), saldos netos, el plan de 4 pagos, saldos finales en $0, un error de monto (mensaje claro), el caso de la Propina de 100.000 entre 3 (redondeo que cuadra) y la pantalla "Verificación" (n, G, pagos = n − G, voraz = 5 contra exacto = 4). Incluye la explicación de 30 segundos de cómo se verificó el mínimo: la cota n − G, el algoritmo exacto, el oráculo independiente y el número de casos aleatorios comprobados. Incluye plan B: URL desplegada, correr local, capturas.
2. Corrida final desde cero (instalación limpia + un comando) y confirma que funciona.
3. Actualiza CONTEXT.md y PLAN.md con el estado final y revisa que VERIFICATION.md esté completo.
4. Pasa la <definicion_de_hecho> del BRIEF punto por punto.
Reporte corto: qué funciona, qué falló y se corrigió, riesgos que quedan.
```
</prompt>
<checkpoint>Ensayas la demo completa una vez, cronometrada, incluida la explicación del mínimo. Pasas el checklist final.</checkpoint>
</fase>

</fases>

<instrucciones_correctivas>
Si un agente se desvía o falla, NO reiniciar. Dar una instrucción corta y exigir que la registre en PLAN.md ("Ajustes de instrucciones") o VERIFICATION.md. Esos ajustes visibles suman en Descomposición y Verificación. Ejemplos:
- "Usaste flotantes para dinero. Pasa todo a enteros en pesos, cubre con un test y registra el ajuste."
- "El oráculo importa settle.ts, no es independiente. Reescríbelo con enumeración de particiones y sin compartir código."
- "Moviste lógica de saldos a un componente. Devuélvela a src/domain y cubre con un test."
- "El test pasa pero no prueba lo que dice. Reescríbelo para que falle sin el fix."
- "No pases a la siguiente tarea hasta que `npm test` y `npm run build` pasen."
</instrucciones_correctivas>

<mapeo_a_rubrica>
| Criterio | Dónde se gana el 4 |
|---|---|
| Demostración funcional (20 %) | F3 flujo con seed (saldos → 4 pagos → todo en $0); F7 URL desplegada; F8 guion ensayado con plan B |
| Resolución del problema (15 %) | F4 tabla R1 a R9 → dónde está en la app; F2 mínimo absoluto, no solo "menos pagos" |
| UX y acabado (15 %) | F4 validaciones y mensajes en español; F5 formato $ 137.500, responsive, color más texto |
| Descomposición (15 %) | F1 PLAN.md con tareas y criterio de hecho; "Ajustes de instrucciones" reales |
| Gestión del contexto (15 %) | F0 CONTEXT.md copiado como GEMINI.md, CLAUDE.md y AGENTS.md; BRIEF.md en el repo |
| Verificación y depuración (20 %) | F2 oráculo independiente + 5.000 casos aleatorios; F5 panel de verificación; F6 auditoría cruzada con bugs reales, causa raíz y re-prueba |
</mapeo_a_rubrica>

<recorte_si_falta_tiempo>
Recortar en este orden y nunca más allá:
1. Editar y borrar gastos (extra).
2. Pulido fino de F5 (se conserva el panel de verificación).
3. Vista previa de la división en el formulario.
No se recortan: F0, F1, F2, F3, F6 y el guion de F8. Ahí está el 70 % de la nota.
</recorte_si_falta_tiempo>

<checklist_antes_de_presentar>
- [ ] El flujo principal corre en vivo de principio a fin con el seed
- [ ] El plan tiene 4 pagos con el seed y los saldos finales son $0
- [ ] Cada R1 a R9 tiene su fila en la tabla requisito → app
- [ ] Entradas inválidas muestran mensajes claros, no pantallas rotas
- [ ] El oráculo es independiente y se comparó en 5.000 casos o más
- [ ] La pantalla "Verificación" muestra n, G, pagos y la comparación con el método simple
- [ ] CONTEXT.md, PLAN.md y VERIFICATION.md existen y están actualizados
- [ ] PLAN.md tiene al menos un ajuste de instrucciones real
- [ ] VERIFICATION.md tiene bugs reales con causa raíz y re-prueba
- [ ] `npm test` y `npm run build` pasan
- [ ] Corrida limpia desde cero hecha minutos antes de presentar
- [ ] URL desplegada probada y plan B de demo listo
</checklist_antes_de_presentar>

</minimal_transactions_brief>

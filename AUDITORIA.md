# AUDITORIA

Auditor independiente. Commit auditado: `525040e`. Clon temporal propio (ya borrado) para `npm ci`, pruebas, build, QA y mis pruebas; la carpeta principal no se modificó salvo este archivo.

## Resultados de comandos (reales)

| Comando | Resultado |
|---|---|
| `npm ci` | 0 vulnerabilidades |
| `npm test` | 9 archivos, 110/110 pasan |
| `npm run build` | sin errores |
| `npm run qa` | 33 PASAN, 0 FALLAN |

## Requisitos

| Req | Veredicto | Evidencia |
|---|---|---|
| R1 Integrantes 2 a 6 | CUMPLE | En la app: con 6, "Agregar" queda deshabilitado; con 2 no se puede eliminar (quedaron 2); nombres duplicados "ana" y "  ANA  " rechazados; renombrar y eliminar funcionan. Ver hallazgo M2 sobre acentos descompuestos. |
| R2 Registrar gastos | CUMPLE | Sin pagador ni participantes: ambos mensajes en español. Pagador que no participa: aceptado, total 1.201.000, saldos finales 0. |
| R3 Reparto con redondeo | CUMPLE | `splitExpense(100000, [c,a,b])` da a=33.334, b=33.333, c=33.333 (orden del grupo, no el de selección). 2 pesos entre d,e,f da d=1, e=1, f=0. |
| R4 Saldo neto | CUMPLE | Pantalla Saldos con el seed; suma 0 (pruebas y mis casos). |
| R5 Plan mínimo | CUMPLE | Ver sección Algoritmo: 13 casos propios, plan = fuerza bruta en todos. |
| R6 Saldos en cero | CUMPLE | `applyPlan` deja 0 en los 13 casos; la app muestra "Saldos finales: todos $ 0". |
| R7 Explicar/evidenciar el mínimo | CUMPLE | Pestaña Verificación (n, G, grupos, n − G, oráculo en vivo, voraz). |
| R8 Persistencia | CUMPLE | Agregar gasto, recargar: persiste. Ver B1 y B2 sobre estados guardados raros. |
| R9 Validación en español | CUMPLE | 17 entradas de monto hostiles, todas con mensaje claro o aceptadas correctamente. Ver Entradas. |

## Algoritmo

Probé 13 vectores de saldos (6 personas, suma 0), con un verificador de fuerza bruta propio (partición recursiva, escrito por mí, sin código del proyecto): `[-10,10,0,0,0,0]`, `[-5,-5,10,0,0,0]`, `[-3,-2,5,-4,4,0]`, `[-4,-3,2,2,3,0]`, `[-5,-4,2,3,4,0]`, `[-3,-2,-2,3,4,0]`, `[1,-1,2,-2,3,-3]`, `[-1,-1,-1,-1,-1,5]`, `[100,-30,-30,-40,7,-7]`, `[-6,-6,5,5,1,1]`, todos 0, `[-7,3,4,-2,2,0]`, `[-1,2,-3,4,-5,3]`.
- Pagos de `settle` = fuerza bruta en los 13; todos los pagos son enteros, > 0 y de una persona a otra distinta; saldos finales 0 en los 13.
- El voraz también deja saldos en 0 pero usó más pagos en 4 casos (3 contra 4 en los vectores 3 a 6); G = 3 en `[1,-1,2,-2,3,-3]` (3 pagos).
- `src/domain/oraculo.ts`: sin ningún `import` (grep), sin operadores de bits; no depende de `settle.ts`.
- Regla del resto: correcta (ver R3).
- Las propiedades de fast-check corren 5.000 casos (`settle.test.ts` líneas 197 y 232).

## Entradas hostiles en la app real (Chromium, preview propio)

Montos: "", "0", "-5", "abc", "10.5", "10,5", "1,000", "1.5", "1e9", "999999999999999999", "1.000.000.000.001", "Infinity", "1.00", dígitos árabes, "1 000": todos rechazados con mensaje en español, el total no cambió. "1.000.000.000.000" y "  150.000  " aceptados (correcto). Nombres: vacío, solo espacios, 30 y 31 caracteres, `<b>x</b>`: sin pantalla rota (React escapa). Sin errores de página (`pageerror`) en toda la sesión. localStorage `{{{`, `null`, `[]`, miembros vacíos, gasto con monto 1.5: restaura el seed sin trazas. Recarga a mitad de edición: el formulario queda vacío y el cambio sin guardar no se aplica (comportamiento razonable, no persiste el borrador).

## Hallazgos

### CRÍTICO
Ninguno.

### ALTO
Ninguno.

### MEDIO

**M1. Falta DEMO.md.** El BRIEF/CLAUDE.md lista DEMO.md como parte del entregable (explicación de 30 s y número de casos aleatorios) y lo cuenta entre los tres sitios de la verificación.
- Pasos: `ls DEMO.md` en la raíz.
- Esperado: el archivo existe. Obtenido: no existe. README tampoco lo menciona. (Puede ser trabajo pendiente de F7/F8; no lo pude saber.)

**M2. La unicidad de nombres no normaliza Unicode.** `nameKey` sustituye á é í ó ú ü, pero no aplica NFC/NFD, así que "Ana" + U+0301 (a con tilde descompuesta, que se ve igual que "Aná") no coincide con "Ana".
- Pasos: Grupo, con "Ana" existente, agregar `Aná` (o pegar un nombre con tilde descompuesta; también `A​na` con carácter de ancho cero).
- Esperado: "Ya existe un integrante con ese nombre." Obtenido: se acepta. Verificado en la app (queda un sexto integrante) y con `validateNewMember`; "Aná" precompuesto sí se rechaza.
- Efecto: dos integrantes que se ven idénticos.

### BAJO

**B1. Estado guardado con un solo integrante se descarta en silencio.** `isValidState` exige ≥ 2 integrantes; al recargar se carga el seed y se sobrescribe lo guardado. Alcanzable solo por edición manual del storage. Obtenido: datos reemplazados sin aviso.

**B2. Estado guardado con nombres duplicados o vacíos se acepta.** `isValidState` no revisa unicidad ni vacío ni longitud. Con `{"members":[{"id":"1","name":"A"},{"id":"2","name":"A"}],...}` o nombre `""` la app carga y muestra el grupo (sin romperse). Solo por storage manipulado.

**B3. `oraculo.ts` está en `src/domain/`, no en `src/domain/__tests__/`** como pide CLAUDE.md/BRIEF. Está documentado en VERIFICATION.md (se movió para usarlo en la pestaña en vivo); sigue sin importar `settle.ts`. Desviación menor.

**B4. Mínima: README dice "3 pasos" pero `npm run qa` requiere `npx playwright install chromium`.** Está dicho en el propio README para el QA opcional; sin impacto en el flujo principal.

**B5. README: "URL desplegada: pendiente".** Despliegue en Vercel no hecho (o no registrado).

## Honestidad (afirmaciones vs. evidencia)

- README/VERIFICATION: 5.000 casos por propiedad, 110 pruebas, 33 de QA, seed 4 contra 5, 720 permutaciones: coinciden con lo que corrí (110 y 33 reproducidos; 5.000 en el código).
- La pestaña Verificación no promete cifras de casos aleatorios (remite a `npm test` y a VERIFICATION.md): no hay afirmación sin respaldo.
- README admite no tener pruebas automáticas de componentes: es cierto (solo el script de QA visual y pruebas de hooks).
- El banner "N pagos mínimos, comprobados" se apoya en n − G con el oráculo en vivo; coherente.

## Qué no pude auditar

Despliegue en Vercel; Safari y Firefox (solo Chromium); teléfono real; lector de pantalla; contraste medido; localStorage lleno o modo privado; contenido de CONTEXT.md y PLAN.md; la verificación de la secuencia de F1 a F5 como proceso (solo estado final); `npm ci` en la carpeta principal (lo hice en clon). No corrí un barrido masivo propio contra el oráculo (usé las 5.000 corridas del proyecto y 13 casos míos).

# Minimal Transactions

Divisor de gastos compartidos para un grupo de 2 a 6 personas. Registra gastos, los divide en partes iguales entre los participantes, muestra el saldo neto de cada persona y genera un plan de pagos con el **mínimo absoluto** de pagos (no solo una reducción), con la demostración dentro de la app. Moneda única: COP, sin decimales. Datos ficticios.

URL desplegada: _pendiente (se agrega tras el despliegue en Vercel)_.

## Cómo correrlo (3 pasos)

1. `npm ci`
2. `npm run dev` y abrir http://localhost:5173
3. `npm test` para correr las pruebas, `npm run build` para compilar y `npm run preview` para servir la versión compilada.

QA visual opcional (360 px y 1280 px, foco, objetivos táctiles, reduced motion, diálogo y aviso): la primera vez `npx playwright install chromium` y luego `npm run qa`.

Probado con Node 22. Sin backend, sin cuentas y sin servicios externos: los datos se guardan en `localStorage` (clave `splitter:v1`). Al abrir por primera vez se carga un caso de ejemplo de 6 integrantes y 3 gastos.

## Qué hace cada pestaña

| Requisito | Dónde está en la app |
|---|---|
| R1 Integrantes (2 a 6) | Grupo: agregar, renombrar y eliminar |
| R2 Registrar gastos | Gastos: descripción, monto, quién pagó y participantes; editar y borrar |
| R3 División con redondeo consistente | Gastos (el reparto cuadra siempre) y `src/domain/split.ts` |
| R4 Saldo neto | Saldos y pagos: Saldo neto |
| R5 Plan con el mínimo de pagos | Saldos y pagos: Plan de pagos |
| R6 El plan deja los saldos en cero | Saldos y pagos: "Saldos finales" y Verificación: "Saldos tras aplicar el plan" |
| R7 Verificación del mínimo | Verificación (n, G, grupos, pagos = n − G, oráculo y método simple) |
| R8 Persistencia | `localStorage`; recargar conserva todo; "Restaurar datos de ejemplo" |
| R9 Validación con mensajes en español | Formularios de Grupo y Gastos, bajo cada campo y en un resumen |

## Decisiones de dominio

- Todo dinero es entero (pesos). Entrada: dígitos con puntos de miles opcionales (`150.000` o `150000`). Se rechaza vacío, 0, negativos, texto, decimales (`10.5` y `10,5`), notación científica y montos mayores a 1.000.000.000.000. Salida: `$ 137.500`. Una sola función de formato: `formatAmount` en `src/domain/money.ts`.
- Redondeo: `base = floor(monto / k)` y el resto se reparte de a 1 peso a los primeros participantes **en el orden de la lista del grupo**. Ejemplo: 100.000 entre 3 da 33.334, 33.333 y 33.333.
- Saldo neto = pagado − suma de sus partes. La suma de todos los saldos es 0.
- Nombres de integrantes únicos sin importar mayúsculas, espacios extra ni tildes; la ñ cuenta como letra distinta ("Nuño" y "Nuno" son distintos). Máximo 30 caracteres.
- No se puede eliminar a un integrante que participa en gastos: la pantalla indica en cuáles está.
- Salida determinista del plan: por deudor (orden del grupo) y luego por acreedor.

## Cómo se garantiza el mínimo

1. Solo cuentan las `n` personas con saldo distinto de cero. Todo plan forma un grafo entre ellas; cada componente conexo suma 0 y uno de `m` personas necesita al menos `m − 1` pagos. Por tanto, cualquier plan usa al menos `n − G` pagos, con `G` el máximo número de grupos disjuntos de suma cero.
2. Un grupo de suma cero de `m` personas se salda con exactamente `m − 1` pagos, así que `n − G` se alcanza. Ese es el mínimo absoluto.
3. `G` se calcula por programación dinámica sobre subconjuntos (como máximo 64 máscaras con 6 personas) en `src/domain/settle.ts`.
4. El método simple (el mayor deudor paga al mayor acreedor) no siempre es mínimo; se implementa aparte en `settleGreedy.ts` solo para comparar. En el caso de ejemplo usa 5 pagos contra 4 del exacto.
5. **Oráculo independiente** (`src/domain/oraculo.ts`): calcula el mínimo con otro método, enumerando todas las particiones de conjuntos (203 con 6 personas) sin importar `settle.ts` ni usar operaciones de bits. La pestaña Verificación lo ejecuta en vivo con los datos actuales y lo compara con el algoritmo exacto.
6. Pruebas (`npm test`): algoritmo contra oráculo en 5.000 escenarios aleatorios por propiedad (una con gastos reales y otra que planta grupos de suma cero para ejercitar G > 1), más casos hostiles. Los resultados y bugs están en `VERIFICATION.md`.

## Estructura

- `src/domain/`: lógica pura (dinero, división, saldos, plan, oráculo, análisis). Sin React ni `localStorage`.
- `src/hooks/`: transiciones de estado y view-models puros, y sus hooks.
- `src/storage/`, `src/data/`: persistencia y datos de ejemplo.
- `src/ui/`: componentes presentacionales. `src/pages/`: pantallas.
- Pruebas en carpetas `__tests__`.
- Documentos de proceso: `CONTEXT.md`, `PLAN.md`, `VERIFICATION.md`, `DESIGN.md`, `COORDINACION.md`.

## Límites conocidos

- Una sola moneda (COP) y sin decimales; no hay conversión.
- Solo división en partes iguales (sin porcentajes ni montos fijos).
- Un grupo por navegador: no hay cuentas ni sincronización entre dispositivos; borrar los datos del sitio borra el grupo.
- El oráculo enumera particiones y está pensado para 6 personas o menos.
- Las pruebas cubren dominio, estado y persistencia; la interfaz se probó a mano en el navegador, sin pruebas automáticas de componentes.

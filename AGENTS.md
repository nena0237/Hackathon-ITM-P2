# CONTEXT - Minimal Transactions (Reto 4, Prompt & Solve)

Documentos hermanos: DESIGN.md (dirección visual y contrato de componentes de src/ui) y COORDINACION.md (propiedad de rutas y reglas de git entre CC y GEM). Léelos antes de tocar código.

Fuente: BRIEF.md (original), sección <contexto_para_agente>.

## Objetivo
Divisor de gastos compartidos: un grupo (2 a 6 personas) registra gastos, se dividen en partes iguales entre los participantes seleccionados, se muestran saldos netos y se genera un plan de pagos con el MÍNIMO ABSOLUTO de pagos (no solo una reducción). Se debe demostrar que el plan deja todos los saldos en cero y que la cantidad de pagos es mínima. Datos ficticios; priorizar el flujo requerido antes de extras. La app debe conservar los datos al recargar.

## Requisitos
- R1 Gestionar integrantes (mín. 2, máx. 6).
- R2 Registrar gastos: descripción, monto, quién pagó, participantes.
- R3 Dividir en partes iguales con redondeo consistente; los totales cuadran.
- R4 Mostrar saldo neto de cada persona.
- R5 Plan de pagos con el mínimo absoluto, pagos entre cualquier par.
- R6 Demostrar que aplicar el plan deja todos los saldos en cero.
- R7 Explicar y evidenciar la verificación del mínimo (también dentro de la app).
- R8 Persistencia al recargar.
- R9 Validación de entradas con mensajes claros en español.
- Extra (solo tras el flujo principal): editar y borrar gastos.

## Reglas de dominio
- Una sola moneda: COP, sin decimales. Todo dinero es ENTERO. Prohibidos los flotantes. La moneda es una constante única en `money.ts`.
- Entrada de monto: dígitos con puntos de miles opcionales ("150.000" o "150000"). Se rechaza: vacío, 0, negativo, texto, decimales ("10.5", "10,5"), notación científica y montos > 1.000.000.000.000. Mensajes en español. Salida: `$ 137.500` (es-CO).
- Integrantes: 2 a 6, nombres únicos (sin tildes, sin mayúsculas, sin espacios extra), no vacíos, máx. 30 caracteres. No se elimina un integrante que participa en gastos (mensaje explicativo).
- Gasto: descripción obligatoria, monto válido, pagador integrante, al menos 1 participante. El pagador puede o no participar.
- Redondeo: `base = floor(monto / k)`, `resto = monto − base·k`. Los primeros `resto` participantes, EN EL ORDEN DE LA LISTA DE INTEGRANTES DEL GRUPO (no el de selección), reciben +1 peso. La suma de partes es exactamente el monto. Determinista.
- Saldo neto = pagado − suma de sus partes. Positivo: le deben; negativo: debe. La suma de todos los saldos es siempre 0.
- Plan: solo personas con saldo ≠ 0; cada pago de deudor a acreedor, entero > 0; cualquier par. Si todos están a mano: plan vacío con "Todos están a mano".
- Orden de salida del plan determinista: por deudor (orden del grupo), luego por acreedor.

## Fundamento del algoritmo (mínimo = n − G)
1. n = personas con saldo ≠ 0.
2. Todo plan forma un grafo entre ellas; cada componente conexo suma 0 y un componente de m personas necesita al menos m − 1 pagos.
3. Pagos ≥ n − g (g = número de componentes), y g ≤ G, el máximo número de grupos disjuntos de suma cero en que se pueden partir esas n personas.
4. Cota alcanzable: un grupo de suma cero de m personas se salda con exactamente m − 1 pagos.
5. Mínimo absoluto = n − G.

Cálculo de G (≤ 6 personas): DP sobre subconjuntos (bitmask, ≤ 64 máscaras): para cada máscara de suma cero, `f(máscara) = 1 + máx f(máscara ∖ s)` sobre submáscaras `s` de suma cero que contienen el primer bit. Se reconstruyen los grupos y cada uno se salda con m − 1 pagos.

El voraz (mayor deudor paga al mayor acreedor) NO siempre es mínimo; se implementa aparte (`settleGreedy.ts`) solo para comparar.

## Caso seed (centro de la demo)
Integrantes en orden: Ana, Beto, Carla, Diego, Elena, Fabián. Se cargan solo si no hay datos guardados.
- Mercado 150.000, pagó Fabián, los 6.
- Cena 600.000, pagó Fabián, participan Diego, Elena, Carla, Fabián.
- Alojamiento 450.000, pagó Diego, participan Ana, Beto, Carla, Fabián.

Saldos: Ana −137.500, Beto −137.500, Carla −287.500, Diego +275.000, Elena −175.000, Fabián +462.500 (suma 0).

Mínimo = 4 pagos (grupos {Diego, Ana, Beto} y {Fabián, Carla, Elena}): Ana→Diego 137.500, Beto→Diego 137.500, Carla→Fabián 287.500, Elena→Fabián 175.000. El voraz necesita 5 con los mismos datos.

Caso de redondeo en vivo (no va en el seed): "Propina" 100.000 entre 3 → 33.334, 33.333, 33.333.

## Plan de verificación (oráculo independiente)
- `src/domain/__tests__/oraculo.ts`: calcula el mínimo con otro método: enumera todas las particiones de conjuntos (203 para 6 personas) y toma la de más grupos de suma cero. No importa nada de `settle.ts` ni usa bitmask. Va en archivo aparte.
- Los tests comparan algoritmo vs oráculo en miles de casos aleatorios.
- Casos hostiles (F1, F2) y auditoría (F6): montos inválidos; integrantes (1, 2, 6, 7, duplicados, vacío, 31 caracteres, eliminar uno con gastos); participantes (ninguno, solo el pagador, todos, el pagador no participa); redondeo (10.000/3, 1/3, 100/7, monto < participantes); saldos (suma 0, todos a mano, un deudor y un acreedor, saldo 0 fuera del plan); algoritmo (seed 4 vs 5, un grupo sin sub-suma cero, 2 y 3 grupos, 6 con saldo ≠ 0, empates, otro orden de integrantes = misma cantidad, determinismo); el plan deja saldos en 0 sin pagos ≤ 0; persistencia (recarga, localStorage corrupto o formato viejo, editar/borrar recalcula).
- fast-check: ≥ 5.000 escenarios (2 a 6 integrantes, 1 a 12 gastos): suma de saldos = 0; plan deja saldos en 0; pagos del algoritmo = oráculo; voraz ≥ exacto.
- La verificación del mínimo existe en tres lugares: tests con oráculo; panel "Verificación" en la app (saldos tras el plan, n, G con sus grupos, pagos = n − G, por qué no puede haber menos, comparación con el voraz); texto en DEMO.md (explicación de 30 s y número de casos aleatorios).

## Stack y por qué
React + Vite + TypeScript + Tailwind CSS (responsive); persistencia en localStorage con clave versionada (`splitter:v1`); Vitest + fast-check; lógica en funciones PURAS en `src/domain/` (sin React ni localStorage). Sin backend, login, APIs externas ni IA en la app. Despliegue en Vercel.

## Estructura de carpetas
```
/
├─ BRIEF.md CONTEXT.md PLAN.md VERIFICATION.md DEMO.md README.md
├─ GEMINI.md CLAUDE.md AGENTS.md   (copias de CONTEXT.md)
└─ src/
   ├─ domain/ money.ts split.ts balances.ts settle.ts settleGreedy.ts __tests__/ (tests + oraculo.ts)
   ├─ data/seed.ts
   ├─ storage/ (con __tests__/)
   ├─ hooks/ (view-models puros + hooks, con __tests__/)
   ├─ ui/ (componentes presentacionales, de GEM)
   └─ pages/ (Grupo, Gastos, Saldos y pagos, Verificación)
```

## Definición de hecho
- Un comando instala y corre (README de máx. 3 pasos).
- El flujo de demo funciona de principio a fin con el seed.
- Cada R1-R9 tiene fila en la tabla requisito → dónde está en la app (README).
- Entradas inválidas muestran mensajes claros en español, sin pantallas rotas ni trazas.
- `npm test` pasa (incluido el oráculo en ≥ 5.000 casos) y `npm run build` sin errores.
- CONTEXT.md, PLAN.md y VERIFICATION.md existen y están actualizados.

## Decisiones
- Nombres duplicados: se comparan sin mayúsculas, sin espacios extra y sin tildes (á é í ó ú ü); la ñ se conserva como letra distinta ("Nuño" y "Nuno" son nombres diferentes).
- Empates entre acreedores o deudores: el orden es el de la lista del grupo. Dentro de cada grupo de suma cero, los deudores pagan en orden de lista a los acreedores en orden de lista.
- Pruebas: siempre en carpetas `__tests__` junto al código. Multiagente: CC (dominio, storage, hooks, pages, tests, configs) y GEM (src/ui, index.css); cruces por HANDOFF.md.

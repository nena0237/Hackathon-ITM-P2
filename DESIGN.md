<diseno_minimal_transactions>

<direccion>
Dirección E: "Monocromo y lima". Sobria, editorial y atrevida por contraste, no por adorno. Un solo acento: lima de marcador, usado como relleno. Los números mandan y el "4" (pagos mínimos) es la conclusión de cada pantalla.
Solo tema claro. No se hace modo oscuro.
</direccion>

<principios>
- Cero decoración: sin gradientes, sin sombras, sin emojis, sin ilustraciones dibujadas a mano. Esquinas rectas (radius 0) en TODO, sin excepciones.
- Líneas: 1 px tinta o gris para filas, 2 px tinta para separar secciones.
- Un solo acento (lima). Un solo color funcional extra, solo para errores de validación.
- Todo texto visible en español, sin guiones largos: usa coma, punto o dos puntos.
- Nada de eyebrows en mayúsculas con tracking, ni etiquetas tipo "Paso 1", ni micro-textos decorativos.
- El color nunca es la única señal: siempre hay texto, signo o trama.
</principios>

<tokens>
```css
--bg:      #F5F5F5;  /* fondo de página */
--surface: #FFFFFF;  /* hojas y paneles */
--ink:     #0D0D0D;  /* texto y líneas fuertes (17,8:1 sobre bg) */
--muted:   #5C5C5C;  /* texto secundario (6,1:1 sobre bg, 6,7:1 sobre blanco) */
--line:    #D4D4D4;  /* separadores de fila */
--lime:    #C8F31D;  /* RELLENO de marcador. Tinta encima: 15,1:1 */
--error:   #B3261E;  /* SOLO errores de validación (6,5:1 sobre blanco, 6,0:1 sobre bg) */
--hatch:   repeating-linear-gradient(135deg, #0D0D0D 0 1px, #FFFFFF 1px 6px); /* "debe" */
```
Reglas de color:
- Lima solo como relleno con tinta encima. Nunca texto lima sobre fondo claro. Única excepción: texto lima sobre tinta en el botón primario (15,1:1).
- "Le deben" = relleno lima con borde de tinta. "Debe" = trama diagonal con borde de tinta. Siempre acompañados del texto "le deben" o "debe" y del signo + o −.
- Foco visible: contorno de 3 px tinta con offset de 3 px en todo elemento interactivo.
</tokens>

<tipografia>
- Texto: Familjen Grotesk. Cifras y montos: JetBrains Mono con `font-variant-numeric: tabular-nums`.
- Autoalojadas con @fontsource (variable si existe). No enlazar Google Fonts en producción. Fallback: system-ui y ui-monospace.
- Escala: 12, 14, 16, 19, 24, 32, 46 px. Cuerpo mínimo 16 px en móvil (los inputs, 16 px para que iOS no haga zoom).
- Títulos: peso 700, tracking negativo (-0.04em el h1 de 46 px, -0.02em el resto), line-height 0.98 a 1.1. Cuerpo: tracking 0, line-height 1.5.
- Formato de dinero: `$ 137.500` (es-CO, puntos de miles, sin decimales). Negativos con el signo −, positivos con +. Usar siempre `formatMoney` de src/domain/money.ts.
</tipografia>

<espaciado_y_layout>
- Escala de 4 px: 4, 8, 12, 16, 20, 24, 32, 40, 64.
- Contenedor máximo 1120 px, centrado. Padding de página 40 px en escritorio y 16 px en móvil.
- Filas de datos de 38 a 44 px. Objetivos táctiles de al menos 44 x 44 px.
- AppShell: título de la app arriba a la izquierda, navegación por pestañas (Grupo, Gastos, Saldos y pagos, Verificación) en una sola línea en escritorio; en móvil, la barra se desplaza horizontalmente sin partir etiquetas. Barra sticky con línea inferior de 1 px.
- Viewport: `min-height: 100dvh`, nunca `100vh`. Sin scroll horizontal en 360 px.
- Pantalla Saldos y pagos: una columna. Secciones separadas por línea de 2 px: Saldo neto, Plan de pagos, y al final el bloque del mínimo.
</espaciado_y_layout>

<movimiento>
Antes de animar algo se responde: ¿con qué frecuencia lo ve la persona y qué comunica? Solo se anima transform y opacidad.

No se anima (uso frecuente): cambio de pestañas, escritura en formularios, abrir o cerrar listas, edición de gastos. Hover de filas: solo color de fondo, 120 ms.
Sí se anima (ocasional): la primera entrada a Saldos y pagos y cada vez que el plan cambia por una edición.

Valores:
- Curva general: `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out fuerte). Nada de ease-in ni linear en UI.
- Barras de saldo: scaleX de 0 a 1, 700 ms, cascada de 40 ms entre filas. Negativas con origen a la derecha, positivas a la izquierda (parten del eje central).
- Cifras: cuentan hasta su valor con el mismo timing (hook `useCountUp`, requestAnimationFrame limitado a 700 ms; es la única animación que actualiza estado por fotograma).
- Pagos: opacidad 0 a 1 y translateY de 8 px a 0, 360 ms, cascada de 90 ms, después de las barras.
- Resaltador lima detrás de cada monto de pago: scaleX de 0 a 1 con origen a la izquierda, 420 ms, justo después de que entra el pago.
- El "4" del mínimo: su resaltador entra al final de la secuencia. Es la conclusión.
- Press en botones y filas interactivas: scale 0.97 en 100 ms, activado al presionar, no al soltar.
- Interrumpible: si los datos cambian durante una animación, saltar al estado final del nuevo plan sin esperar ni encolar.
- prefers-reduced-motion: reduce: sin movimiento. Todo aparece en su estado final (cifras ya contadas, opacidad 1, resaltadores completos).

Scroll:
- Sin scroll-jacking, sin parallax, sin marquesinas.
- Un solo momento con propósito: la sección Verificación se arma una vez al entrar al viewport (IntersectionObserver, once): primero n, luego G, luego pagos = n − G.
- Barra de pestañas sticky con línea inferior. Nada más.
</movimiento>

<componentes_contrato>
Carpeta `src/ui/`. Son presentacionales: reciben datos por props y NO importan de `src/domain` salvo tipos y `formatMoney`. Montos siempre en pesos enteros.

```ts
AppShell({ title: string; subtitle?: string; tabs: {id: string; label: string}[]; active: string; onChange: (id: string) => void; children: ReactNode })
SectionTitle({ children: ReactNode })
BalanceRow({ name: string; balance: number /* + le deben, − debe */; maxAbs: number; animate?: boolean; index?: number })
PaymentRow({ from: string; to: string; amount: number; animate?: boolean; index?: number })
Highlight({ children: ReactNode; active?: boolean; delayMs?: number })        // marcador lima
MinimumBanner({ payments: number; simple?: number; animate?: boolean })        // "4 pagos mínimos, comprobados. El método simple necesitaría 5."
EmptyState({ title: string; body: string; action?: ReactNode })
Button({ variant: 'primary' | 'secondary'; children: ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' })
// hooks en src/ui/hooks: useCountUp(target, {durationMs, enabled}), useReducedMotion(), useInView(ref, {once})
```
Al terminar, GEM documenta las props reales en HANDOFF.md. Si difieren del contrato, la fuente de verdad es el código y HANDOFF.md.
</componentes_contrato>

<accesibilidad>
- Contraste mínimo 4,5:1 en texto y 3:1 en elementos gráficos.
- BalanceRow: la barra es decorativa (`aria-hidden`); el sentido va en texto: "Ana debe $ 137.500".
- Botones y pestañas son `<button>` reales; pestañas con `role="tablist"`, `role="tab"` y `aria-selected`.
- Errores de formulario: debajo del campo, texto en --error con prefijo "Error:", borde de 2 px --error, `aria-describedby` y `aria-live="polite"`. Etiqueta visible siempre, nunca solo placeholder.
- Estados: vacío con mensaje útil y acción; error claro con cómo corregirlo; éxito con marcador lima breve, sin depender del color.
- Se prueba en 360 px y en escritorio, y con reduced motion activado.
</accesibilidad>

<anti_patrones>
No usar: gradientes, sombras, esquinas redondeadas, tarjetas con sombra o borde lateral de color, etiquetas en mayúsculas con tracking sobre los títulos, emojis, iconos dibujados a mano, contadores o estados decorativos, textos de relleno cute, lima como color de texto, cifras sin tabular-nums, `h-screen`, listeners de scroll con `window.addEventListener('scroll')`.
</anti_patrones>

<decisiones_de_implementacion>
(GEM anota aquí, al final, las decisiones que tome durante la construcción y por qué.)
</decisiones_de_implementacion>

</diseno_minimal_transactions>

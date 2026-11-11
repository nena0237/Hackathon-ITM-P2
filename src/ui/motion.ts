/** Valores de movimiento de DESIGN.md. Solo transform y opacidad. */
export const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

export const BAR_MS = 700
export const BAR_STAGGER_MS = 40
/** Las barras de hasta 6 filas terminan de entrar antes de que empiecen los pagos. */
export const BARS_END_MS = BAR_MS + BAR_STAGGER_MS * 5 // 900

export const PAYMENT_MS = 360
export const PAYMENT_STAGGER_MS = 90
export const HIGHLIGHT_MS = 420

/** Retraso de entrada del pago i (después de las barras). */
export const paymentDelay = (index: number) => BARS_END_MS + index * PAYMENT_STAGGER_MS
/** El resaltador entra justo después de que entra el pago. */
export const highlightDelay = (index: number) => paymentDelay(index) + PAYMENT_MS
/** El resaltador del mínimo entra al final de la secuencia (pagos máximos: 6 filas). */
export const MINIMUM_HIGHLIGHT_DELAY_MS = highlightDelay(5) + HIGHLIGHT_MS


// Dinero: SIEMPRE enteros en pesos colombianos (COP). Sin flotantes.
export const CURRENCY = 'COP'
export const MAX_AMOUNT = 1_000_000_000_000

export const COMMA_MESSAGE =
  'Escribe el monto solo con dígitos y puntos de miles, por ejemplo 150.000. No uses comas ni decimales.'

export type ParseResult = { ok: true; value: number } | { ok: false; error: string }

/** Acepta dígitos con puntos de miles opcionales ("150.000" o "150000"). */
export function parseAmount(input: unknown): ParseResult {
  if (typeof input !== 'string') return { ok: false, error: 'El monto debe ser texto con dígitos.' }
  const s = input.trim()
  if (s === '') return { ok: false, error: 'El monto es obligatorio.' }
  if (s.startsWith('-')) return { ok: false, error: 'El monto no puede ser negativo.' }
  if (s.includes(',')) return { ok: false, error: COMMA_MESSAGE }
  if (/[.,]\d{1,2}$/.test(s) &&!/^\d{1,3}(\.\d{3})+$/.test(s)) {
    return { ok: false, error: 'El monto no admite decimales: use pesos enteros.' }
  }
  if (/e/i.test(s) && /^[\d.,]*e[+-]?\d+$/i.test(s)) {
    return { ok: false, error: 'No se admite notación científica.' }
  }
  const valid = /^\d+$/.test(s) || /^\d{1,3}(\.\d{3})+$/.test(s)
  if (!valid) return { ok: false, error: 'Monto inválido: use solo dígitos, con puntos de miles opcionales (ej. 150.000).' }
  const digits = s.replace(/\./g, '')
  if (digits.length > 13) return { ok: false, error: 'El monto supera el máximo permitido ($ 1.000.000.000.000).' }
  const value = Number(digits)
  if (value === 0) return { ok: false, error: 'El monto debe ser mayor que cero.' }
  if (value > MAX_AMOUNT) return { ok: false, error: 'El monto supera el máximo permitido ($ 1.000.000.000.000).' }
  return { ok: true, value }
}

/** Formato de salida es-CO: "$ 137.500" (puntos de miles manuales, sin Intl ni flotantes). */
export function formatAmount(n: number): string {
  if (!Number.isInteger(n)) throw new Error('formatAmount requiere un entero')
  const sign = n < 0 ? '-' : ''
  const digits = String(Math.abs(n))
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}$ ${grouped}`
}

import { describe, it, expect } from 'vitest'
import { parseAmount, formatAmount } from '../money'

const ok = (s: string) => {
  const r = parseAmount(s)
  return r.ok ? r.value : null
}

describe('parseAmount (caso 1)', () => {
  it('acepta "150.000" y "150000"', () => {
    expect(ok('150.000')).toBe(150000)
    expect(ok('150000')).toBe(150000)
  })
  it('acepta espacios alrededor', () => {
    expect(ok('  150.000  ')).toBe(150000)
  })
  it('acepta el máximo exacto', () => {
    expect(ok('1.000.000.000.000')).toBe(1_000_000_000_000)
  })
  it.each([
    ['vacío', ''],
    ['solo espacios', '   '],
    ['cero', '0'],
    ['cero con miles', '0.000'],
    ['negativo', '-5'],
    ['texto', 'abc'],
    ['decimal punto', '10.5'],
    ['decimal coma', '10,5'],
    ['notación científica', '1e9'],
    ['Infinity', 'Infinity'],
    ['sobre el máximo', '1.000.000.000.001'],
    ['miles mal formados', '1.00.000'],
    ['miles con coma', '1,000'],
  ])('rechaza %s', (_n, s) => {
    const r = parseAmount(s)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.length).toBeGreaterThan(5)
  })
  it('rechaza valores que no son texto (número, Infinity, NaN)', () => {
    expect(parseAmount(Infinity as unknown).ok).toBe(false)
    expect(parseAmount(NaN as unknown).ok).toBe(false)
    expect(parseAmount(10.5 as unknown).ok).toBe(false)
  })
  it('mensajes específicos en español', () => {
    const msg = (s: string) => {
      const r = parseAmount(s)
      return r.ok ? '' : r.error
    }
    expect(msg('')).toMatch(/obligatorio/)
    expect(msg('0')).toMatch(/mayor que cero/)
    expect(msg('-5')).toMatch(/negativo/)
    expect(msg('10.5')).toMatch(/decimales/)
    expect(msg('1e9')).toMatch(/científica/)
  })
})

describe('montos con coma', () => {
  it.each(['1,000', '10,5', '1.000,50', ',5', '5,'])('rechaza "%s" con el mensaje de formato', (s) => {
    const r = parseAmount(s)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error).toBe(
        'Escribe el monto solo con dígitos y puntos de miles, por ejemplo 150.000. No uses comas ni decimales.',
      )
    }
  })
})

describe('formatAmount', () => {
  it('formatea es-CO', () => {
    expect(formatAmount(137500)).toBe('$ 137.500')
    expect(formatAmount(0)).toBe('$ 0')
    expect(formatAmount(1_000_000_000_000)).toBe('$ 1.000.000.000.000')
    expect(formatAmount(-287500)).toBe('-$ 287.500')
  })
  it('rechaza no enteros', () => {
    expect(() => formatAmount(1.5)).toThrow()
  })
})

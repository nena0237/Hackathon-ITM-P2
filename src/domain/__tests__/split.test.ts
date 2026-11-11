import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { splitExpense } from '../split'

const G = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
const sum = (o: Record<string, number>) => Object.values(o).reduce((x, y) => x + y, 0)

describe('splitExpense: redondeo (caso 4)', () => {
  it('10.000 entre 3 → 3334, 3333, 3333', () => {
    const p = splitExpense(10000, ['a', 'b', 'c'], G)
    expect(p).toEqual({ a: 3334, b: 3333, c: 3333 })
    expect(sum(p)).toBe(10000)
  })
  it('100.000 entre 3 → 33.334, 33.333, 33.333', () => {
    expect(splitExpense(100000, ['a', 'b', 'c'], G)).toEqual({ a: 33334, b: 33333, c: 33333 })
  })
  it('1 peso entre 3 → el único peso va al primero', () => {
    expect(splitExpense(1, ['a', 'b', 'c'], G)).toEqual({ a: 1, b: 0, c: 0 })
  })
  it('100 entre 7 → 2 primeros con 15, resto 14', () => {
    const p = splitExpense(100, G, G)
    expect(Object.values(p)).toEqual([15, 15, 14, 14, 14, 14, 14])
    expect(sum(p)).toBe(100)
  })
  it('monto menor que el número de participantes', () => {
    const p = splitExpense(2, ['a', 'b', 'c', 'd', 'e'], G)
    expect(Object.values(p)).toEqual([1, 1, 0, 0, 0])
    expect(sum(p)).toBe(2)
  })
  it('el peso extra sigue el orden del grupo, no el de selección', () => {
    expect(splitExpense(10, ['c', 'a'], G)).toEqual({ a: 5, c: 5 })
    expect(splitExpense(11, ['c', 'a'], G)).toEqual({ a: 6, c: 5 })
    expect(splitExpense(11, ['c', 'b', 'a'], G)).toEqual({ a: 4, b: 4, c: 3 })
  })
  it('un solo participante recibe todo', () => {
    expect(splitExpense(777, ['d'], G)).toEqual({ d: 777 })
  })
  it('ninguno → error', () => {
    expect(() => splitExpense(100, [], G)).toThrow()
  })
  it('determinista', () => {
    expect(splitExpense(12345, ['b', 'c', 'e'], G)).toEqual(splitExpense(12345, ['e', 'c', 'b'], G))
  })
})

describe('propiedad: suma de partes = monto', () => {
  it('600 casos aleatorios', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000_000_000 }),
        fc.subarray(G.slice(0, 6), { minLength: 1 }),
        (amount, sel) => {
          const p = splitExpense(amount, sel, G)
          const vals = Object.values(p)
          return (
            sum(p) === amount &&
            vals.every((v) => Number.isInteger(v) && v >= 0) &&
            Math.max(...vals) - Math.min(...vals) <= 1
          )
        },
      ),
      { numRuns: 600 },
    )
  })
})

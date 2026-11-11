import { describe, it, expect } from 'vitest'
import { validateNewMember, canRemoveMember, nameKey } from '../members'

describe('integrantes (caso 2)', () => {
  it('rechaza duplicados sin mayúsculas ni espacios extra', () => {
    expect(validateNewMember(' ana ', ['Ana'])).toMatch(/Ya existe/)
    expect(validateNewMember('ANA', ['Ana'])).toMatch(/Ya existe/)
  })
  it('rechaza duplicados sin tildes', () => {
    expect(validateNewMember('Fabian', ['Fabián'])).toMatch(/Ya existe/)
    expect(nameKey('Müller')).toBe(nameKey('muller'))
  })
  it('la ñ es una letra distinta', () => {
    expect(validateNewMember('Nuno', ['Nuño'])).toBeNull()
    expect(nameKey('Nuño')).not.toBe(nameKey('Nuno'))
  })
  it('rechaza vacío y 31 caracteres; acepta 30', () => {
    expect(validateNewMember('   ', [])).toMatch(/vacío/)
    expect(validateNewMember('a'.repeat(31), [])).toMatch(/30/)
    expect(validateNewMember('a'.repeat(30), [])).toBeNull()
  })
  it('límite de 6: rechaza el 7.º y acepta hasta el 6.º', () => {
    const six = ['A', 'B', 'C', 'D', 'E', 'F']
    expect(validateNewMember('G', six)).toMatch(/máximo 6/)
    expect(validateNewMember('F', six.slice(0, 5))).toBeNull()
    expect(validateNewMember('B', ['A'])).toBeNull()
  })
  it('no se elimina un integrante con gastos', () => {
    const ex = [{ paidBy: 'a', participants: ['b'] }]
    expect(canRemoveMember('a', ex)).toMatch(/participa en gastos/)
    expect(canRemoveMember('b', ex)).toMatch(/participa en gastos/)
    expect(canRemoveMember('c', ex)).toBeNull()
  })
})

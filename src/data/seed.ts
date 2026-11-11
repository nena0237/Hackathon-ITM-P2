import type { Expense } from '../domain/balances'

export interface Member {
  id: string
  name: string
}

export interface AppState {
  members: Member[]
  expenses: Expense[]
}

const names = ['Ana', 'Beto', 'Carla', 'Diego', 'Elena', 'Fabián']
const id = (n: string) => `m-${n.toLowerCase().replace('á', 'a')}`

export function seedState(): AppState {
  const members = names.map((name) => ({ id: id(name), name }))
  const ids = (ns: string[]) => ns.map(id)
  return {
    members,
    expenses: [
      { id: 'e1', description: 'Mercado', amount: 150000, paidBy: id('Fabián'), participants: ids(names) },
      { id: 'e2', description: 'Cena', amount: 600000, paidBy: id('Fabián'), participants: ids(['Diego', 'Elena', 'Carla', 'Fabián']) },
      { id: 'e3', description: 'Alojamiento', amount: 450000, paidBy: id('Diego'), participants: ids(['Ana', 'Beto', 'Carla', 'Fabián']) },
    ],
  }
}

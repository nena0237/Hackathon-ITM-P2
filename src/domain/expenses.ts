import type { Expense } from './balances'
import { parseAmount } from './money'

export const MAX_DESCRIPTION_LENGTH = 60

export type ExpenseField = 'description' | 'amount' | 'paidBy' | 'participants'

export interface ExpenseInput {
  description: string
  amount: string // texto tal como lo escribió la persona
  paidBy: string // '' = sin elegir
  participants: string[]
}

export interface FieldError {
  field: ExpenseField
  message: string
}

export type ExpenseResult =
  | { ok: true; value: Omit<Expense, 'id'> }
  | { ok: false; errors: FieldError[] }

/** Valida en el límite. Los mensajes dicen cómo corregir. Participantes salen en el orden del grupo. */
export function validateExpense(input: ExpenseInput, memberIds: string[]): ExpenseResult {
  const errors: FieldError[] = []
  const description = input.description.trim().replace(/\s+/g, ' ')
  if (description === '') errors.push({ field: 'description', message: 'Escribe una descripción, por ejemplo "Mercado".' })
  else if (description.length > MAX_DESCRIPTION_LENGTH)
    errors.push({ field: 'description', message: `Acorta la descripción a ${MAX_DESCRIPTION_LENGTH} caracteres o menos.` })

  const amount = parseAmount(input.amount)
  if (!amount.ok) errors.push({ field: 'amount', message: amount.error })

  if (input.paidBy === '') errors.push({ field: 'paidBy', message: 'Elige quién pagó.' })
  else if (!memberIds.includes(input.paidBy)) errors.push({ field: 'paidBy', message: 'Quien pagó ya no está en el grupo. Elige a otra persona.' })

  const participants = memberIds.filter((id) => input.participants.includes(id))
  if (participants.length === 0) errors.push({ field: 'participants', message: 'Elige al menos un participante.' })

  if (errors.length > 0 || !amount.ok) return { ok: false, errors }
  return { ok: true, value: { description, amount: amount.value, paidBy: input.paidBy, participants } }
}

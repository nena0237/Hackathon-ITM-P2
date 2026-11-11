/**
 * Divide `amount` (pesos enteros) entre los participantes.
 * base = floor(amount / k); los primeros `resto` participantes, en el ORDEN DE LA LISTA
 * DEL GRUPO (no el de selección), reciben 1 peso más.
 * Devuelve un mapa persona -> parte. La suma de partes es exactamente `amount`.
 */
export function splitExpense(
  amount: number,
  participantIds: string[],
  groupOrder: string[],
): Record<string, number> {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('monto inválido')
  const selected = new Set(participantIds)
  const ordered = groupOrder.filter((id) => selected.has(id))
  const k = ordered.length
  if (k === 0) throw new Error('se requiere al menos un participante')
  if (k !== selected.size) throw new Error('participante fuera del grupo')
  const base = Math.floor(amount / k)
  const resto = amount - base * k
  const parts: Record<string, number> = {}
  ordered.forEach((id, i) => {
    parts[id] = base + (i < resto ? 1 : 0)
  })
  return parts
}

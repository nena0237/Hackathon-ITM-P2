export const MIN_MEMBERS = 2
export const MAX_MEMBERS = 6
export const MAX_NAME_LENGTH = 30

/** Clave de comparación: minúsculas, sin espacios extra, sin tildes (á é í ó ú ü). La ñ se conserva. */
export function nameKey(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
}

export function validateNewMember(name: string, existing: string[]): string | null {
  const clean = name.trim().replace(/\s+/g, ' ')
  if (clean === '') return 'El nombre no puede estar vacío.'
  if (clean.length > MAX_NAME_LENGTH) return `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.`
  if (existing.length >= MAX_MEMBERS) return `El grupo admite máximo ${MAX_MEMBERS} integrantes.`
  const key = nameKey(clean)
  if (existing.some((n) => nameKey(n) === key)) return 'Ya existe un integrante con ese nombre.'
  return null
}

export function canRemoveMember(
  id: string,
  expenses: { paidBy: string; participants: string[] }[],
): string | null {
  const used = expenses.some((e) => e.paidBy === id || e.participants.includes(id))
  return used ? 'No se puede eliminar: participa en gastos registrados. Elimine primero esos gastos.' : null
}

/** Renombrar: mismas reglas que agregar, pero el propio nombre actual no cuenta como duplicado. */
export function validateRename(id: string, name: string, members: { id: string; name: string }[]): string | null {
  const clean = name.trim().replace(/\s+/g, ' ')
  if (clean === '') return 'El nombre no puede estar vacío.'
  if (clean.length > MAX_NAME_LENGTH) return `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.`
  const key = nameKey(clean)
  if (members.some((m) => m.id !== id && nameKey(m.name) === key)) return 'Ya existe un integrante con ese nombre.'
  return null
}

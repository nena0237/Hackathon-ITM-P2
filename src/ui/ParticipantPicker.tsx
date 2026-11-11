import { useEffect, useRef } from 'react'

/**
 * Casillas por integrante y una casilla "Todos". Cada fila mide al menos 44 px y toda la fila es objetivo táctil.
 * onChange entrega los ids seleccionados en el orden de `members` (no el orden de clic).
 * El estado se dice con texto ("3 de 6 participan"), no solo con la casilla.
 */
export function ParticipantPicker({
  id,
  legend,
  members,
  selected,
  onChange,
  error,
  disabled = false,
}: {
  id: string
  legend: string
  members: { id: string; name: string }[]
  selected: string[]
  onChange: (ids: string[]) => void
  error?: string
  disabled?: boolean
}) {
  const allRef = useRef<HTMLInputElement>(null)
  const count = members.filter((m) => selected.includes(m.id)).length
  const all = members.length > 0 && count === members.length
  const some = count > 0 && !all

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = some
  }, [some])

  const toggle = (memberId: string) => {
    const next = new Set(selected)
    if (next.has(memberId)) next.delete(memberId)
    else next.add(memberId)
    onChange(members.filter((m) => next.has(m.id)).map((m) => m.id))
  }
  const toggleAll = () => onChange(all ? [] : members.map((m) => m.id))

  const errorId = `${id}-error`
  const rowClass = `row-hover flex min-h-[44px] items-center gap-3 px-3 ${
    disabled ? 'cursor-not-allowed text-muted' : 'cursor-pointer'
  }`

  return (
    <fieldset
      id={id}
      tabIndex={-1}
      disabled={disabled}
      aria-describedby={error ? errorId : undefined}
      className={`m-0 min-w-0 border-2 p-0 bg-surface ${error ? 'border-error' : 'border-ink'} ${disabled ? 'border-line bg-bg' : ''}`}
    >
      <legend className={`ml-2 px-2 text-[16px] font-bold ${disabled ? 'text-muted' : ''}`}>{legend}</legend>
      <label className={`${rowClass} border-b border-line font-bold`}>
        <input ref={allRef} type="checkbox" className="check" checked={all} onChange={toggleAll} disabled={disabled} />
        <span>Todos</span>
      </label>
      {members.map((m) => (
        <label key={m.id} className={`${rowClass} border-b border-line last:border-b-0`}>
          <input
            type="checkbox"
            className="check"
            checked={selected.includes(m.id)}
            onChange={() => toggle(m.id)}
            disabled={disabled}
          />
          <span className="min-w-0 truncate">{m.name}</span>
        </label>
      ))}
      <p className="m-0 border-t border-line px-3 py-2 text-[14px] text-muted" aria-live="polite">
        {count} de {members.length} participan
      </p>
      <div id={errorId} aria-live="polite" className={error ? 'px-3 pb-3' : ''}>
        {error ? <p className="m-0 text-[14px] font-bold text-error">Error: {error}</p> : null}
      </div>
    </fieldset>
  )
}

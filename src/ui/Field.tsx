import type { ReactNode } from 'react'

/** Clases comunes de controles: borde de 2 px tinta; con error, borde de 2 px --error. */
export function controlClass(error?: string): string {
  return [
    'block w-full min-h-[48px] border-2 px-3 py-2 text-[16px] leading-[1.5] bg-surface text-ink',
    'placeholder:text-muted',
    'disabled:cursor-not-allowed disabled:border-line disabled:bg-bg disabled:text-muted',
    error ? 'border-error' : 'border-ink',
  ].join(' ')
}

export interface FieldControlProps {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': boolean
  disabled: boolean
}

/**
 * Envoltorio de campo: etiqueta visible, ayuda y error debajo del control.
 * El error va en una región aria-live="polite" siempre montada, con prefijo "Error:".
 * El control recibe id, aria-describedby y aria-invalid por render prop.
 */
export function Field({
  id,
  label,
  help,
  error,
  disabled = false,
  children,
}: {
  id: string
  label: string
  help?: string
  error?: string
  disabled?: boolean
  children: (control: FieldControlProps) => ReactNode
}) {
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const describedBy = [help ? helpId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={`text-[16px] font-bold ${disabled ? 'text-muted' : ''}`}>
        {label}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': Boolean(error), disabled })}
      {help ? (
        <p id={helpId} className="m-0 text-[14px] text-muted">
          {help}
        </p>
      ) : null}
      <div id={errorId} aria-live="polite">
        {error ? <p className="m-0 text-[14px] font-bold text-error">Error: {error}</p> : null}
      </div>
    </div>
  )
}

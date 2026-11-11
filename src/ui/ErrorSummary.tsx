import { useEffect, useRef } from 'react'

/**
 * Resumen de errores de un formulario. Cada ítem enlaza al campo (fieldId) y le da el foco.
 * No se muestra si no hay errores. Cuando focusKey cambia (p. ej. un contador de intentos de envío)
 * y hay errores, el resumen recibe el foco para que se anuncie.
 */
export function ErrorSummary({
  errors,
  focusKey = 0,
  title = 'Revisa estos campos',
}: {
  errors: { fieldId: string; message: string }[]
  focusKey?: number
  title?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const hasErrors = errors.length > 0

  useEffect(() => {
    if (focusKey > 0 && hasErrors) ref.current?.focus()
  }, [focusKey, hasErrors])

  if (!hasErrors) return null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="border-2 border-error bg-surface p-4"
    >
      <h2 id="error-summary-title" className="text-[19px] font-bold leading-[1.1] tracking-[-0.02em]">
        {title}: {errors.length === 1 ? '1 error' : `${errors.length} errores`}
      </h2>
      <ul className="m-0 mt-3 flex list-none flex-col p-0">
        {errors.map((e) => (
          <li key={e.fieldId}>
            <a
              href={`#${e.fieldId}`}
              onClick={(ev) => {
                ev.preventDefault()
                document.getElementById(e.fieldId)?.focus()
              }}
              className="inline-flex min-h-[44px] items-center text-[16px] font-bold text-error underline underline-offset-4"
            >
              Error: {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

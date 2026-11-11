import { Field, controlClass } from './Field'

/**
 * Campo de monto. Entrega el texto tal cual lo escribió la persona: NO parsea ni formatea.
 * El parseo (puntos de miles, rechazos) lo hace parseAmount en src/domain/money.ts.
 */
export function MoneyInput({
  id,
  label,
  value,
  onChange,
  help,
  error,
  disabled = false,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (raw: string) => void
  help?: string
  error?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <Field id={id} label={label} help={help} error={error} disabled={disabled}>
      {(c) => (
        <input
          {...c}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`num ${controlClass(error)}`}
        />
      )}
    </Field>
  )
}

import { Field, controlClass } from './Field'

/** Campo de texto con etiqueta, ayuda y error. */
export function TextInput({
  id,
  label,
  value,
  onChange,
  help,
  error,
  disabled = false,
  placeholder,
  maxLength,
  autoComplete = 'off',
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  help?: string
  error?: string
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  autoComplete?: string
}) {
  return (
    <Field id={id} label={label} help={help} error={error} disabled={disabled}>
      {(c) => (
        <input
          {...c}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={controlClass(error)}
        />
      )}
    </Field>
  )
}

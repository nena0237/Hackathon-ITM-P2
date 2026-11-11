import { Field, controlClass } from './Field'

/** Selector del pagador (select nativo). value es el id del integrante, o '' si no hay elección. */
export function PayerSelect({
  id,
  label,
  members,
  value,
  onChange,
  help,
  error,
  disabled = false,
  placeholder = 'Elige quién pagó',
}: {
  id: string
  label: string
  members: { id: string; name: string }[]
  value: string
  onChange: (memberId: string) => void
  help?: string
  error?: string
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <Field id={id} label={label} help={help} error={error} disabled={disabled}>
      {(c) => (
        <select {...c} value={value} onChange={(e) => onChange(e.target.value)} className={controlClass(error)}>
          <option value="">{placeholder}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

import type { ReactNode } from 'react'

/** Botón real. Primario: tinta con texto lima. Secundario: blanco con borde de tinta de 2 px. */
export function Button({
  variant,
  children,
  onClick,
  disabled = false,
  type = 'button',
  autoFocus = false,
}: {
  variant: 'primary' | 'secondary'
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  autoFocus?: boolean
}) {
  const look = disabled
    ? 'cursor-not-allowed border-2 border-line bg-surface text-muted'
    : variant === 'primary'
      ? 'border-2 border-ink bg-ink text-lime'
      : 'border-2 border-ink bg-surface text-ink hover:bg-bg'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`press inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-5 py-2 text-[16px] font-bold ${look}`}
    >
      {children}
    </button>
  )
}


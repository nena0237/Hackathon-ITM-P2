import type { ReactNode } from 'react'

/** Estado vacío: mensaje útil y, si aplica, una acción. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="border border-ink bg-surface p-5 md:p-8">
      <h3 className="text-[24px] font-bold tracking-[-0.02em] leading-[1.1]">{title}</h3>
      <p className="mt-3 max-w-[60ch] text-[16px] text-muted">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}


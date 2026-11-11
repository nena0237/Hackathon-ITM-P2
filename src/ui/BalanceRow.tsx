import { formatAmount } from '../domain/money'
import { useCountUp, useEntered } from './hooks'
import { BAR_MS, BAR_STAGGER_MS, EASE } from './motion'

/**
 * Fila de saldo neto. La barra es decorativa; el sentido va en texto ("debe", "le deben").
 * Positivo: relleno lima, crece a la derecha del eje. Negativo: trama, crece a la izquierda.
 */
export function BalanceRow({
  name,
  balance,
  maxAbs,
  animate = false,
  index = 0,
}: {
  name: string
  balance: number
  maxAbs: number
  animate?: boolean
  index?: number
}) {
  const abs = Math.abs(balance)
  const shown = useCountUp(abs, { durationMs: BAR_MS, enabled: animate })
  const entered = useEntered(animate)
  const positive = balance > 0
  const negative = balance < 0
  const widthPct = maxAbs > 0 ? Math.min(50, (abs / maxAbs) * 50) : 0
  const delay = index * BAR_STAGGER_MS

  const sign = positive ? '+' : negative ? '\u2212' : ''
  const verb = positive ? 'le deben' : negative ? 'debe' : 'est\u00e1 a mano'

  return (
    <li className="row-hover list-none border-b border-line px-1 py-3 md:px-2">
      <div className="flex min-h-[24px] items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[16px] font-bold">{name}</span>
        <span className="num shrink-0 text-[16px]">
          <span className="font-sans text-[14px] text-muted">{verb}</span>{' '}
          {sign}
          {formatAmount(shown)}
        </span>
      </div>
      <div aria-hidden="true" className="relative mt-2 h-4">
        <div className="absolute inset-y-0 left-1/2 w-px bg-ink" />
        {(positive || negative) && (
          <div
            className={`absolute inset-y-0 border border-ink ${positive ? 'bg-lime' : 'hatch'}`}
            style={{
              width: `${widthPct}%`,
              ...(positive ? { left: '50%' } : { right: '50%' }),
              transformOrigin: positive ? 'left center' : 'right center',
              transform: entered ? 'scaleX(1)' : 'scaleX(0)',
              transition:
                animate ? `transform ${BAR_MS}ms ${EASE} ${delay}ms` : 'none',
            }}
          />
        )}
      </div>
    </li>
  )
}


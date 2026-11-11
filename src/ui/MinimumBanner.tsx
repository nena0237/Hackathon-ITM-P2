import { useCountUp } from './hooks'
import { Highlight } from './Highlight'
import { BAR_MS, MINIMUM_HIGHLIGHT_DELAY_MS } from './motion'

/**
 * Conclusión de la pantalla: "4 pagos mínimos, comprobados. El método simple necesitaría 5."
 * El resaltador del número entra al final de la secuencia.
 */
export function MinimumBanner({
  payments,
  simple,
  animate = false,
}: {
  payments: number
  simple?: number
  animate?: boolean
}) {
  const shown = useCountUp(payments, { durationMs: BAR_MS, enabled: animate })

  let comparison: string | null = null
  if (simple !== undefined) {
    comparison =
      simple > payments
        ? `El m\u00e9todo simple necesitar\u00eda ${simple}.`
        : 'El m\u00e9todo simple necesita los mismos pagos.'
  }

  return (
    <div className="border-2 border-ink bg-surface p-5 md:p-8" role="status">
      <p className="m-0 text-[32px] font-bold leading-[1.05] tracking-[-0.02em] md:text-[46px]">
        <Highlight active delayMs={MINIMUM_HIGHLIGHT_DELAY_MS} instant={!animate}>
          <span className="num">{shown}</span>
        </Highlight>{' '}
        {payments === 1 ? 'pago m\u00ednimo' : 'pagos m\u00ednimos'}, {payments === 1 ? 'comprobado' : 'comprobados'}.
      </p>
      {comparison ? <p className="mt-3 text-[19px]">{comparison}</p> : null}
    </div>
  )
}

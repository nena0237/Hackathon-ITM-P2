import { useRef } from 'react'
import { Highlight } from './Highlight'
import { useInView, useReducedMotion } from './hooks'
import { EASE, PAYMENT_MS } from './motion'

export interface VerificationGroupDetail {
  members: string[]
  payments: number
}

/**
 * Demostración visual del mínimo absoluto (pagos = n − G).
 * Se arma una sola vez al entrar al viewport (IntersectionObserver, once):
 * primero n, luego G, luego pagos = n − G. Con reduced motion, estado final directo.
 */
export function VerificationPanel({
  people,
  groups,
  minPayments,
  simplePayments,
  detail,
}: {
  people: number
  groups: number
  minPayments: number
  simplePayments?: number
  detail?: VerificationGroupDetail[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const shown = reduced || inView

  const stepStyle = (delayMs: number) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? 'translateY(0)' : 'translateY(8px)',
    transition: reduced
      ? 'none'
      : `opacity ${PAYMENT_MS}ms ${EASE} ${delayMs}ms, transform ${PAYMENT_MS}ms ${EASE} ${delayMs}ms`,
  })

  let comparison: string | null = null
  if (simplePayments !== undefined && minPayments > 0) {
    comparison =
      simplePayments > minPayments
        ? `Con estos mismos saldos, el m\u00e9todo simple (pagar al mayor acreedor) necesita ${simplePayments} pagos; el plan exacto ahorra ${simplePayments - minPayments}.`
        : `Con estos mismos saldos, el m\u00e9todo simple tambi\u00e9n necesita ${simplePayments} ${simplePayments === 1 ? 'pago' : 'pagos'}.`
  }

  return (
    <div ref={ref} className="border-2 border-ink bg-surface p-5 md:p-8">
      <div className="flex flex-col gap-5">
        <div className="border-b border-line pb-4" style={stepStyle(0)}>
          <p className="m-0 text-[19px] font-bold leading-[1.2] tracking-[-0.02em]">
            Personas con saldo distinto de cero:{' '}
            <Highlight active={shown} delayMs={200} instant={reduced}>
              <span className="num">n = {people}</span>
            </Highlight>
          </p>
          <p className="m-0 mt-1 text-[16px] text-muted">
            Quienes ya están a mano (saldo{' '}
            <span className="num">$ 0</span>) no participan en ningún pago.
          </p>
        </div>

        <div className="border-b border-line pb-4" style={stepStyle(450)}>
          <p className="m-0 text-[19px] font-bold leading-[1.2] tracking-[-0.02em]">
            Grupos disjuntos que se saldan solos:{' '}
            <Highlight active={shown} delayMs={650} instant={reduced}>
              <span className="num">G = {groups}</span>
            </Highlight>
          </p>
          <p className="m-0 mt-1 text-[16px] text-muted">
            Un grupo independiente de{' '}
            <span className="num">m</span> personas cuya suma es{' '}
            <span className="num">$ 0</span> necesita al menos{' '}
            <span className="num">m − 1</span> pagos para quedar en cero, porque sus integrantes deben quedar conectados.
          </p>
        </div>

        <div style={stepStyle(900)}>
          <p className="m-0 text-[24px] font-bold leading-[1.1] tracking-[-0.02em] md:text-[32px]">
            Mínimo absoluto:{' '}
            <Highlight active={shown} delayMs={1100} instant={reduced}>
              <span className="num">
                {minPayments} = {people} − {groups}
              </span>
            </Highlight>
          </p>
          <p className="m-0 mt-2 text-[16px]">
            {people === 0
              ? 'No hay saldos pendientes: todos están a mano.'
              : `No puede existir un plan con menos de ${minPayments} ${minPayments === 1 ? 'pago' : 'pagos'}: con ${groups} ${groups === 1 ? 'componente' : 'componentes'} como máximo, todo grafo que cierre saldos necesita al menos n − G pagos.`}
          </p>
        </div>

        {detail && detail.length > 0 ? (
          <div className="border-t border-line pt-4" style={stepStyle(1250)}>
            <h3 className="text-[19px] font-bold leading-[1.1] tracking-[-0.02em]">
              Descomposición encontrada
            </h3>
            <ul className="m-0 mt-3 p-0">
              {detail.map((g, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-2 text-[16px] last:border-b-0"
                >
                  <span>{g.members.join(', ')}</span>
                  <span className="text-[14px] text-muted">
                    <span className="num">{g.members.length}</span> personas,{' '}
                    <span className="num">{g.payments}</span> {g.payments === 1 ? 'pago' : 'pagos'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {comparison ? (
          <p className="m-0 border-t border-line pt-4 text-[16px]" style={stepStyle(1350)}>
            {comparison}
          </p>
        ) : null}
      </div>
    </div>
  )
}

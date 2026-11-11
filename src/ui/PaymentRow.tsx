import { formatAmount } from '../domain/money'
import { useEntered } from './hooks'
import { Highlight } from './Highlight'
import { EASE, PAYMENT_MS, highlightDelay, paymentDelay } from './motion'

/** Fila de pago: "Ana paga a Diego" y el monto con resaltador lima. */
export function PaymentRow({
  from,
  to,
  amount,
  animate = false,
  index = 0,
}: {
  from: string
  to: string
  amount: number
  animate?: boolean
  index?: number
}) {
  const entered = useEntered(animate)
  const delay = paymentDelay(index)
  return (
    <li
      className="row-hover flex min-h-[44px] list-none flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-1 py-2 md:px-2"
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(8px)',
        transition: animate
          ? `opacity ${PAYMENT_MS}ms ${EASE} ${delay}ms, transform ${PAYMENT_MS}ms ${EASE} ${delay}ms`
          : 'none',
      }}
    >
      <span className="text-[16px]">
        <strong className="font-bold">{from}</strong> paga a <strong className="font-bold">{to}</strong>
      </span>
      <span className="num text-[16px] font-bold">
        <Highlight active={entered} instant={!animate} delayMs={highlightDelay(index)}>
          {formatAmount(amount)}
        </Highlight>
      </span>
    </li>
  )
}


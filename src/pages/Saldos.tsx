import { formatAmount } from '../domain/money'
import type { BalanceView, PlanView } from '../hooks/viewModels'
import { BalanceRow, EmptyState, Highlight, MinimumBanner, PaymentRow, SectionTitle } from '../ui'

interface Props {
  balances: BalanceView[]
  maxAbs: number
  plan: PlanView
  finals: BalanceView[]
}

export function Saldos({ balances, maxAbs, plan, finals }: Props) {
  const allZero = finals.every((f) => f.balance === 0)
  // La key cambia con el plan: repite la entrada animada tras una edición.
  const planKey = plan.payments.map((p) => `${p.from}>${p.to}:${p.amount}`).join('|')
  return (
    <div key={planKey}>
      <section>
        <SectionTitle>Saldo neto</SectionTitle>
        <ul>
          {balances.map((b, i) => (
            <BalanceRow key={b.id} name={b.name} balance={b.balance} maxAbs={maxAbs} animate index={i} />
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <SectionTitle>Plan de pagos</SectionTitle>
        {plan.allSettled ? (
          <EmptyState title="Todos están a mano" body="Nadie le debe nada a nadie. No hace falta ningún pago." />
        ) : (
          <>
            <ul>
              {plan.payments.map((p, i) => (
                <PaymentRow key={`${p.from}-${p.to}`} from={p.fromName} to={p.toName} amount={p.amount} animate index={i} />
              ))}
            </ul>
            <div className="mt-6">
              <MinimumBanner payments={plan.payments.length} simple={plan.simple} animate />
            </div>
          </>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle>Saldos finales</SectionTitle>
        {allZero ? (
          <p className="text-[19px] font-bold">
            <Highlight instant>Saldos finales: todos <span className="num">{formatAmount(0)}</span></Highlight>
          </p>
        ) : (
          <p role="alert" className="text-[16px] text-error">
            Error: tras aplicar el plan quedan saldos distintos de {formatAmount(0)}.
          </p>
        )}
        <ul className="mt-2">
          {finals.map((f) => (
            <li key={f.id} className="list-none border-b border-line px-1 py-2 text-[14px] md:px-2">
              {f.name}: <span className="num">{formatAmount(f.balance)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

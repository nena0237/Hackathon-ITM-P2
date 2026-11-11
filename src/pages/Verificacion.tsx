import { formatAmount } from '../domain/money'
import type { VerificationView } from '../hooks/viewModels'
import { EmptyState, SectionTitle, VerificationPanel } from '../ui'

export function Verificacion({ v }: { v: VerificationView }) {
  if (v.n === 0) {
    return (
      <section>
        <SectionTitle>Verificación</SectionTitle>
        <EmptyState title="Todos están a mano" body="Sin saldos pendientes no hay pagos que verificar. Registra gastos para ver la comprobación." />
      </section>
    )
  }
  const o = v.oracle
  return (
    <div>
      <section>
        <SectionTitle>Por qué este plan es el mínimo</SectionTitle>
        <VerificationPanel people={v.n} groups={v.G} minPayments={v.exact} simplePayments={v.greedy} detail={v.groups} />
      </section>

      <section className="mt-8">
        <SectionTitle>Comprobación independiente</SectionTitle>
        <p className="max-w-[640px] text-[16px]">
          Con los datos actuales, otro método (enumerar las {o.particiones} formas de partir a las personas con saldo y quedarse con la que tiene más
          grupos de suma cero) calcula {o.oraculo} {o.oraculo === 1 ? 'pago' : 'pagos'} como mínimo. El algoritmo exacto usa {o.exacto}.{' '}
          <strong>{o.coinciden ? 'Coinciden.' : 'No coinciden: hay un error.'}</strong> El método simple usa {o.voraz}.
        </p>
        <p className="mt-2 max-w-[640px] text-[14px] text-muted">
          Las pruebas automáticas repiten esta comparación con escenarios aleatorios: se ejecutan con npm test y sus resultados están en VERIFICATION.md.
        </p>
        {!o.coinciden && (
          <p role="alert" className="mt-2 text-[16px] text-error">Error: el oráculo y el algoritmo exacto no coinciden.</p>
        )}
        {!v.formulaHolds && (
          <p role="alert" className="mt-2 text-[16px] text-error">Error: los pagos no son n − G.</p>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle>Saldos tras aplicar el plan</SectionTitle>
        <p className="text-[19px] font-bold">
          {v.allZero ? (
            <>Todos <span className="num">{formatAmount(0)}</span></>
          ) : (
            `Error: quedan saldos distintos de ${formatAmount(0)}`
          )}
        </p>
        <ul className="mt-2">
          {v.finals.map((f) => (
            <li key={f.id} className="list-none border-b border-line px-1 py-2 text-[14px] md:px-2">
              {f.name}: <span className="num">{formatAmount(f.balance)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

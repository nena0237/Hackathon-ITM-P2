import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import {
  AppShell,
  BalanceRow,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorSummary,
  MinimumBanner,
  MoneyInput,
  ParticipantPicker,
  PaymentRow,
  PayerSelect,
  SectionTitle,
  TextInput,
  Toast,
  VerificationPanel,
} from './index'

// Datos de ejemplo SOLO para este banco de pruebas.
// Plan A: caso semilla (4 pagos, método simple 5). Plan B: otro plan para probar la interrupción.
const PLAN_A = {
  balances: [
    { name: 'Ana', balance: -137500 },
    { name: 'Beto', balance: -137500 },
    { name: 'Carla', balance: -287500 },
    { name: 'Diego', balance: 275000 },
    { name: 'Elena', balance: -175000 },
    { name: 'Fabián', balance: 462500 },
  ],
  payments: [
    { from: 'Ana', to: 'Diego', amount: 137500 },
    { from: 'Beto', to: 'Diego', amount: 137500 },
    { from: 'Carla', to: 'Fabián', amount: 287500 },
    { from: 'Elena', to: 'Fabián', amount: 175000 },
  ],
  simple: 5,
}
const PLAN_B = {
  balances: [
    { name: 'Ana', balance: -50000 },
    { name: 'Beto', balance: -50000 },
    { name: 'Carla', balance: 100000 },
    { name: 'Diego', balance: -200000 },
    { name: 'Elena', balance: 120000 },
    { name: 'Fabián', balance: 80000 },
  ],
  payments: [
    { from: 'Ana', to: 'Carla', amount: 50000 },
    { from: 'Beto', to: 'Carla', amount: 50000 },
    { from: 'Diego', to: 'Elena', amount: 120000 },
    { from: 'Diego', to: 'Fabián', amount: 80000 },
  ],
  simple: 4,
}
const MEMBERS = [
  { id: 'ana', name: 'Ana' },
  { id: 'beto', name: 'Beto' },
  { id: 'carla', name: 'Carla' },
  { id: 'diego', name: 'Diego' },
  { id: 'elena', name: 'Elena' },
  { id: 'fabian', name: 'Fabián' },
]
const TABS = [
  { id: 'grupo', label: 'Grupo' },
  { id: 'gastos', label: 'Gastos' },
  { id: 'saldos', label: 'Saldos y pagos' },
  { id: 'verificacion', label: 'Verificación' },
]

function Verification() {
  return (
    <VerificationPanel
      people={6}
      groups={2}
      minPayments={4}
      simplePayments={5}
      detail={[
        { members: ['Ana', 'Beto', 'Diego'], payments: 2 },
        { members: ['Carla', 'Elena', 'Fabián'], payments: 2 },
      ]}
    />
  )
}

/** Formularios: estados normal, error y deshabilitado, más un formulario interactivo. */
function Forms() {
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('')
  const [parts, setParts] = useState<string[]>([])
  const [attempts, setAttempts] = useState(0)
  const [sent, setSent] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Validación mínima SOLO para el showcase (la real la hace CC con parseAmount y el dominio).
  const errs = {
    desc: desc.trim() === '' ? 'La descripción es obligatoria.' : undefined,
    amount: !/^\d+(\.\d{3})*$/.test(amount.trim()) ? 'Escribe el monto solo con dígitos, por ejemplo 150.000.' : undefined,
    payer: payer === '' ? 'Elige quién pagó.' : undefined,
    parts: parts.length === 0 ? 'Elige al menos un participante.' : undefined,
  }
  const show = attempts > 0
  const summary = [
    { fieldId: 'f-desc', message: errs.desc },
    { fieldId: 'f-amount', message: errs.amount },
    { fieldId: 'f-payer', message: errs.payer },
    { fieldId: 'f-parts', message: errs.parts },
  ].filter((e): e is { fieldId: string; message: string } => show && Boolean(e.message))

  return (
    <>
      <div className="grid gap-6 md:grid-cols-3">
        <TextInput id="n-text" label="Normal" value="Mercado" onChange={() => {}} help="Texto de ayuda debajo del campo." />
        <TextInput id="e-text" label="Con error" value="" onChange={() => {}} error="La descripción es obligatoria." />
        <TextInput id="d-text" label="Deshabilitado" value="Mercado" onChange={() => {}} disabled />
        <MoneyInput id="n-money" label="Monto normal" value="150.000" onChange={() => {}} help="Solo dígitos, con puntos de miles opcionales." />
        <MoneyInput id="e-money" label="Monto con error" value="10,5" onChange={() => {}} error="No uses comas ni decimales." />
        <MoneyInput id="d-money" label="Monto deshabilitado" value="150.000" onChange={() => {}} disabled />
        <PayerSelect id="n-payer" label="Pagador normal" members={MEMBERS} value="diego" onChange={() => {}} />
        <PayerSelect id="e-payer" label="Pagador con error" members={MEMBERS} value="" onChange={() => {}} error="Elige quién pagó." />
        <PayerSelect id="d-payer" label="Pagador deshabilitado" members={MEMBERS} value="diego" onChange={() => {}} disabled />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <ParticipantPicker id="n-parts" legend="Participan (normal)" members={MEMBERS} selected={['ana', 'carla', 'diego']} onChange={() => {}} />
        <ParticipantPicker id="e-parts" legend="Participan (error)" members={MEMBERS} selected={[]} onChange={() => {}} error="Elige al menos un participante." />
        <ParticipantPicker id="d-parts" legend="Participan (deshabilitado)" members={MEMBERS} selected={['ana', 'beto']} onChange={() => {}} disabled />
      </div>

      <SectionTitle>Formulario interactivo</SectionTitle>
      <form
        noValidate
        className="flex max-w-[560px] flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          setAttempts((a) => a + 1)
          const ok = !errs.desc && !errs.amount && !errs.payer && !errs.parts
          setSent(ok)
          if (ok) setToast('Gasto guardado.')
        }}
      >
        <ErrorSummary errors={summary} focusKey={attempts} />
        <TextInput id="f-desc" label="Descripción" value={desc} onChange={setDesc} error={show ? errs.desc : undefined} />
        <MoneyInput id="f-amount" label="Monto" value={amount} onChange={setAmount} help="Ejemplo: 150.000" error={show ? errs.amount : undefined} />
        <PayerSelect id="f-payer" label="Quién pagó" members={MEMBERS} value={payer} onChange={setPayer} error={show ? errs.payer : undefined} />
        <ParticipantPicker id="f-parts" legend="Participantes" members={MEMBERS} selected={parts} onChange={setParts} error={show ? errs.parts : undefined} />
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" type="submit">Guardar gasto</Button>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>Eliminar gasto</Button>
        </div>
        {sent ? <p className="m-0 text-[16px]">Último envío: válido.</p> : null}
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar este gasto?"
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          setToast('Gasto eliminado.')
        }}
      >
        Se recalcularán los saldos y el plan de pagos. Puedes deshacerlo unos segundos.
      </ConfirmDialog>
      <Toast message={toast} onAction={() => setToast('Eliminación deshecha.')} onDismiss={() => setToast(null)} />
    </>
  )
}

function Showcase() {
  const [tab, setTab] = useState('saldos')
  const [run, setRun] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [plan, setPlan] = useState<'A' | 'B'>('A')
  const data = plan === 'A' ? PLAN_A : PLAN_B
  const maxAbs = Math.max(...data.balances.map((b) => Math.abs(b.balance)))

  return (
    <AppShell title="Minimal Transactions" subtitle="Showcase" tabs={TABS} active={tab} onChange={setTab}>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={() => setRun((r) => r + 1)}>
          Repetir animación
        </Button>
        <Button variant="secondary" onClick={() => setPlan((p) => (p === 'A' ? 'B' : 'A'))}>
          Cambiar plan (interrumpe)
        </Button>
        <Button variant="secondary" onClick={() => setAnimate((a) => !a)}>
          {animate ? 'Ver estado final' : 'Activar animación'}
        </Button>
        <Button variant="secondary" disabled>
          Deshabilitado
        </Button>
      </div>

      <div key={`${run}-${animate}`}>
        <SectionTitle>Saldo neto</SectionTitle>
        <ul className="m-0 p-0">
          {data.balances.map((b, i) => (
            <BalanceRow key={b.name} {...b} maxAbs={maxAbs} animate={animate} index={i} />
          ))}
          <BalanceRow name="Gaby" balance={0} maxAbs={maxAbs} animate={animate} index={6} />
        </ul>

        <SectionTitle>Plan de pagos</SectionTitle>
        <ul className="m-0 p-0">
          {data.payments.map((p, i) => (
            <PaymentRow key={i} {...p} animate={animate} index={i} />
          ))}
        </ul>

        <SectionTitle>El mínimo</SectionTitle>
        <MinimumBanner payments={data.payments.length} simple={data.simple} animate={animate} />
      </div>

      <SectionTitle>Verificación al entrar al viewport</SectionTitle>
      <Verification />

      <SectionTitle>Estado vacío</SectionTitle>
      <EmptyState
        title="Todos están a mano"
        body="No hay pagos pendientes. Agrega un gasto para ver el plan de pagos."
        action={<Button variant="primary">Agregar gasto</Button>}
      />

      <SectionTitle>Botones</SectionTitle>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primario</Button>
        <Button variant="secondary">Secundario</Button>
        <Button variant="primary" disabled>
          Primario deshabilitado
        </Button>
      </div>

      <SectionTitle>Formularios</SectionTitle>
      <Forms />
    </AppShell>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Showcase />
  </StrictMode>,
)

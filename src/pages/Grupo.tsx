import { useState } from 'react'
import type { AppState } from '../data/seed'
import { MAX_MEMBERS, MAX_NAME_LENGTH, MIN_MEMBERS } from '../domain/members'
import { expensesOf, type Outcome } from '../hooks/actions'
import { Button, EmptyState, SectionTitle, TextInput } from '../ui'

interface Props {
  state: AppState
  onAdd: (name: string) => Outcome
  onRename: (id: string, name: string) => Outcome
  onRemove: (id: string) => Outcome
  onRestoreSeed: () => void
}

export function Grupo({ state, onAdd, onRename, onRemove, onRestoreSeed }: Props) {
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState<string | undefined>()
  const [editId, setEditId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [editError, setEditError] = useState<string | undefined>()
  const [blocked, setBlocked] = useState<{ id: string; message: string } | null>(null)

  const full = state.members.length >= MAX_MEMBERS

  function submitAdd(e: React.FormEvent) {
    e.preventDefault()
    const r = onAdd(newName)
    if (r.ok) {
      setNewName('')
      setAddError(undefined)
    } else setAddError(r.error)
  }

  function submitRename(e: React.FormEvent) {
    e.preventDefault()
    if (editId === null) return
    const r = onRename(editId, draft)
    if (r.ok) {
      setEditId(null)
      setEditError(undefined)
    } else setEditError(r.error)
  }

  function remove(id: string) {
    const r = onRemove(id)
    if (r.ok) setBlocked(null)
    else {
      const used = expensesOf(state, id)
      const detail = used.length > 0 ? ` Está en: ${used.map((x) => x.description).join(', ')}. Edita o borra esos gastos y vuelve a intentarlo.` : ''
      setBlocked({ id, message: r.error + detail })
    }
  }

  return (
    <section>
      <SectionTitle>Integrantes</SectionTitle>
      {state.members.length === 0 ? (
        <EmptyState
          title="Todavía no hay integrantes"
          body={`Agrega entre ${MIN_MEMBERS} y ${MAX_MEMBERS} personas, o carga el ejemplo.`}
          action={<Button variant="secondary" onClick={onRestoreSeed}>Cargar datos de ejemplo</Button>}
        />
      ) : (
        <ul>
          {state.members.map((m) => {
            const count = expensesOf(state, m.id).length
            return (
              <li key={m.id} className="list-none border-b border-line px-1 py-3 md:px-2">
                {editId === m.id ? (
                  <form noValidate onSubmit={submitRename} className="flex flex-col gap-3">
                    <TextInput
                      id={`rename-${m.id}`}
                      label={`Nuevo nombre para ${m.name}`}
                      value={draft}
                      onChange={setDraft}
                      maxLength={MAX_NAME_LENGTH + 10}
                      error={editError}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary" type="submit">Guardar nombre</Button>
                      <Button variant="secondary" onClick={() => { setEditId(null); setEditError(undefined) }}>Cancelar</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[16px] font-bold">{m.name}</span>
                      <span className="ml-3 text-[14px] text-muted">
                        {count === 0 ? 'Sin gastos' : count === 1 ? 'En 1 gasto' : `En ${count} gastos`}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => { setEditId(m.id); setDraft(m.name); setEditError(undefined) }}>
                        Renombrar
                      </Button>
                      <Button variant="secondary" onClick={() => remove(m.id)}>Eliminar</Button>
                    </div>
                  </div>
                )}
                {blocked?.id === m.id && (
                  <p role="alert" className="mt-2 border-2 border-error px-3 py-2 text-[14px] font-bold text-error">Error: {blocked.message}</p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      <form noValidate onSubmit={submitAdd} className="mt-6 flex max-w-[560px] flex-col gap-4">
        <TextInput
          id="new-member"
          label="Agregar integrante"
          value={newName}
          onChange={setNewName}
          disabled={full}
          maxLength={MAX_NAME_LENGTH + 10}
          help={full ? `El grupo ya tiene el máximo de ${MAX_MEMBERS} integrantes.` : `Hasta ${MAX_NAME_LENGTH} caracteres. No se repiten nombres, aunque cambien mayúsculas o tildes.`}
          error={addError}
        />
        <div>
          <Button variant="primary" type="submit" disabled={full}>Agregar</Button>
        </div>
      </form>
      <p className="mt-4 text-[14px] text-muted">{state.members.length} de {MAX_MEMBERS} integrantes (mínimo {MIN_MEMBERS}).</p>
    </section>
  )
}

// ORÁCULO INDEPENDIENTE del mínimo de pagos.
// Método distinto al de settle.ts: enumeración recursiva de TODAS las particiones de conjuntos
// (203 para 6 personas, número de Bell B6). Se queda con la partición cuyos bloques son todos
// de suma cero y que tiene más bloques. Mínimo = n − (bloques).
// No importa nada de settle.ts y no usa bitmask.

export interface OracleResult {
  /** Mínimo de pagos = n − G. */
  minPayments: number
  /** G: máximo número de grupos de suma cero. */
  G: number
  /** Particiones enumeradas (Bell(n)). */
  partitionsSeen: number
}

/** `balances`: saldos de las personas CON saldo ≠ 0 (se filtran ceros por si acaso). */
export function oracleMinPayments(balances: number[]): OracleResult {
  const xs = balances.filter((b) => b !== 0)
  const n = xs.length
  if (n === 0) return { minPayments: 0, G: 0, partitionsSeen: 1 }

  let bestBlocks = 0
  let seen = 0
  const blocks: number[][] = [] // cada bloque = lista de saldos

  const recurse = (i: number): void => {
    if (i === n) {
      seen++
      if (blocks.length > bestBlocks && blocks.every((b) => b.reduce((s, v) => s + v, 0) === 0)) {
        bestBlocks = blocks.length
      }
      return
    }
    // Poner el elemento i en cada bloque existente...
    for (const b of blocks) {
      b.push(xs[i])
      recurse(i + 1)
      b.pop()
    }
    // ...o abrir un bloque nuevo.
    blocks.push([xs[i]])
    recurse(i + 1)
    blocks.pop()
  }
  recurse(0)

  return { minPayments: n - bestBlocks, G: bestBlocks, partitionsSeen: seen }
}

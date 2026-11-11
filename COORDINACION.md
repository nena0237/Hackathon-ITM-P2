<coordinacion_multiagente>

<objetivo>
Dos agentes (CC = Claude Code, GEM = Gemini en Antigravity) trabajan a la vez en la MISMA carpeta y la MISMA rama (main). Sin ramas extra, sin worktrees. La seguridad viene de tres cosas: cada archivo tiene un solo dueño, cada agente hace commit solo de sus rutas, y todo cruce se pide por escrito en HANDOFF.md.
</objetivo>

<propiedad_por_ruta>
CC es dueño de: package.json, package-lock.json, configs (vite, tsconfig, tailwind, vitest, .gitattributes, .gitignore), index.html, src/main.tsx, src/App.tsx, src/domain/**, src/data/**, src/storage/**, src/pages/**, src/hooks/**, cualquier `__tests__/**`, README.md, PLAN.md, VERIFICATION.md, CONTEXT.md y sus copias (CLAUDE.md, GEMINI.md, AGENTS.md; deben ser idénticas, se comprueban con `cmp`), DEMO.md.

GEM es dueño de: src/ui/** (componentes y hooks de animación), src/index.css, showcase.html, src/ui/showcase-main.tsx, public/**.

Compartidos: BRIEF.md y DESIGN.md (solo lectura para ambos; los cambia el humano), COORDINACION.md (solo lectura), HANDOFF.md (solo se AÑADE al final, nunca se edita lo anterior).

Regla de oro: si necesitas cambiar un archivo que no es tuyo, NO lo toques. Escribe un PEDIDO en HANDOFF.md y sigue con otra cosa.
</propiedad_por_ruta>

<reglas_git>
Prohibido, para ambos: `git add .`, `git add -A`, `git commit -a`, `git stash`, `git reset`, `git checkout -- <archivo>`, `git restore`, `git clean`, `git rebase`, `git push --force`, crear ramas.
Permitido: `git status`, `git diff`, `git log`, `git add <rutas propias>`, `git commit`.
- Commit solo de rutas propias: `git add src/ui src/index.css` y luego `git commit -m "[GEM] ..."`. Prefijos: `[CC]` y `[GEM]`.
- Antes de commitear: `git status --short`. Si ves cambios en rutas ajenas, ignóralos; no los agregues ni los reviertas.
- Si aparece `.git/index.lock`, espera 5 segundos y reintenta (hasta 3 veces). No lo borres. Si persiste, escribe BLOQUEO en HANDOFF.md.
- Commits chicos y frecuentes, un tema por commit.
- HANDOFF.md se commitea al final de cada entrada: `git add HANDOFF.md && git commit -m "[CC|GEM] handoff"`. Es la única ruta que ambos pueden commitear.
</reglas_git>

<reglas_de_ejecucion>
- Solo CC modifica package.json y ejecuta `npm install` y `npm run build`.
- GEM verifica con `npx tsc --noEmit` y `npm test` NO (los tests son de CC). Si GEM necesita una dependencia nueva, la pide con un PEDIDO.
- Servidores de desarrollo: CC usa el puerto 5173, GEM usa el 5174 (`npx vite --port 5174`). No matar procesos ajenos.
- No renombrar ni mover archivos del otro agente.
- Nunca pegar secretos en el repo.
</reglas_de_ejecucion>

<handoff_formato>
Archivo HANDOFF.md en la raíz. Primera línea: `# HANDOFF (solo se añade al final)`. Cada entrada:

`## [CC|GEM] AAAA-MM-DD HH:MM TIPO: resumen en una línea`
y debajo, las líneas de detalle necesarias.

TIPO es uno de:
- LISTO: algo terminado y commiteado que el otro puede usar. Incluye rutas y, para componentes, las props reales.
- PEDIDO: necesito que el otro cambie o instale algo en sus rutas. Incluye qué y por qué.
- BLOQUEO: no puedo seguir sin ayuda del humano o del otro.
- NOTA: información útil, sin acción requerida.

Antes de cada tarea nueva, cada agente lee HANDOFF.md desde la última entrada propia.
</handoff_formato>

<conflictos>
Si un archivo propio aparece modificado sin que lo hayas tocado, o un archivo ajeno cambió de forma que te rompe algo: NO lo arregles tú. Escribe BLOQUEO con el nombre del archivo y el `git diff` resumido. El humano decide.
</conflictos>

</coordinacion_multiagente>

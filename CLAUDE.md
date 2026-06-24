# FnTs's life — app de rotina pessoal

App pessoal de controle de rotina (hábitos, dieta, treinos, sono, hidratação).

## Stack & infra
- **Next.js 15** (App Router, React 19, TypeScript), Tailwind 4, Radix UI, lucide-react, recharts.
- **Banco:** Postgres (Neon serverless) via **Drizzle ORM**. Schema em `db/schema.ts`, client em `db/client.ts`. `DATABASE_URL` no `.env.local` (mesmo banco usado em produção).
- **Migrations:** `npm run db:push` aplica o schema no banco (sem gerar arquivos de migration).
- **Deploy:** Vercel, projeto `fn-ts/fnts-life` → https://fnts-life.vercel.app
  - GitHub `FnTsz/myroutine` **conectado** à Vercel: push na `main` faz **deploy automático em produção** (~1 min). Não precisa rodar `vercel --prod` manual.
  - `DATABASE_URL` configurada em Production na Vercel.

## Estrutura
- `app/(tabs)/` — páginas: `dashboard`, `habits`, `training` (+ `mobilidade`, `musculacao`), `diet` (+ `historico`), `sleep`, `hydration`.
- `app/api/` — rotas: `habits` (+ `[id]/toggle`, `[id]/logs`, `monthly`), `diet`, `training`, `workouts`, `sleep`, `hydration`, `strava/*`.
- Páginas são client components que buscam dados das rotas `/api/*` via `fetch` no `useEffect`.
- `lib/utils.ts` — helpers (`today()`, formatadores de data, `MEAL_LABELS`, `ACTIVITY_LABELS`).

## Convenções importantes
- Macros de dieta (`calories`/`protein`/`carbs`) e afins: usar `real` no schema quando precisar aceitar decimais.
- Handlers de POST no client devem checar `res.ok` e mostrar erro (não fechar o diálogo calado).
- Hábitos por nome: comparar normalizado (`.trim().toLowerCase()`) — ex.: o hábito de água está salvo como `"Água "` (com espaço).
- Datas sempre no formato `yyyy-MM-dd` (string).

## Automações de hábitos (auto-check)
- Registrar **treino feito** marca o hábito conforme a categoria: `corrida`→**Correr**, `mobilidade`→**Mobilidade**, `outro`→**Exercicio** (lógica em `app/api/workouts/route.ts`).
- Atingir **3000 ml de água** marca o hábito **Água** (lógica em `app/api/hydration/route.ts`, `HYDRATION_GOAL = 3000`).
- Auto-checks são idempotentes: nunca desmarcam nem duplicam.

## Comandos
- `npm run dev` — servidor de desenvolvimento (porta 3000).
- `npm run build` — build de produção (usar para validar antes de subir).
- `npm run db:push` — aplicar schema no banco.

---

# Diário de desenvolvimento

> Mantido por sessão. Entradas mais recentes no topo. Sempre que terminarmos algo,
> registro aqui um resumo curto do que foi feito (e por quê), para a próxima sessão já ter contexto.

## 2026-06-23
- **PWA (app instalável):** site agora pode ser instalado como programa no PC/celular. Adicionados `app/manifest.ts` (abre no `/dashboard`, `display: standalone`, tema `#09090b`), ícones em `public/` (`icon-192/512.png`, `apple-icon.png` — fundo âmbar com "F"), service worker `public/sw.js` (network-first; ignora `/api`, cache só como fallback offline) registrado via `components/sw-register.tsx`. Metadata (manifest, theme-color, apple icon) no `app/layout.tsx`. Instalação exige HTTPS → funciona na URL da Vercel.
- **Correção da dieta:** colunas `calories`/`protein`/`carbs` mudadas de `integer`→`real` (registro de almoço falhava silenciosamente com valores decimais). Botão "Adicionar" agora valida descrição e mostra erro em vez de fechar calado. (commit `e5b1d72`)
- **Treinos realizados:** nova tabela `workout_logs` + API `/api/workouts`. Na aba Treinos, botão "Treino feito" com nome, categoria, tempo (min) e calorias gastas. Aparecem no calendário (cor âmbar) e numa lista "Treinos realizados" com totais da semana. (commit `24944ef`)
- **Auto-check de hábitos:** categoria do treino marca Correr/Mobilidade/Exercicio; atingir 3000ml de água marca o hábito Água.
- **Infra:** GitHub conectado à Vercel (auto-deploy na `main` ativado e verificado). Produção no ar e validada.

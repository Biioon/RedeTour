## Diagnóstico Atual
- Erros de sintaxe reportados pelo compilador em:
  - `app/(dashboard)/afiliado/page.tsx:126` (Unexpected token `div` — bloco `return` fora/sem função)
  - `app/(dashboard)/cliente/page.tsx:123` (Unexpected token `div`)
  - `app/(dashboard)/parceiro/page.tsx:142` (Unexpected token `div`)
- Verificar possíveis restos de cache (`.next`) causando mensagens defasadas.
- Confirmar dependências e imports usados nas páginas do dashboard.

## Correções de Código
1. Páginas do App Router
- Garantir assinatura correta do componente em cada página:
  - Trocar para `export default function Page()` no topo das páginas: `afiliado/page.tsx`, `cliente/page.tsx`, `parceiro/page.tsx`.
- Garantir que o bloco `return (...)` esteja dentro da função e com fechamento correto de JSX.
- Adicionar `import * as React from 'react'` quando não presente (para JSX e alguns padrões).
- Remover exports duplicados no fim dos arquivos.

2. Imports de UI
- Confirmar `components/ui/dialog.tsx` existente e exportações (`Dialog`, `DialogContent`, etc.).
- Validar imports nas páginas de produtos:
  - `app/(dashboard)/products/acomodacoes/page.tsx`
  - `app/(dashboard)/products/categorias/page.tsx`
  - `app/(dashboard)/products/passeios/page.tsx`
  - `app/(dashboard)/products/transportes/page.tsx`

3. Dependências
- Confirmar instalação de `@supabase/auth-helpers-nextjs` para `components/dashboard/role-based-dashboard.tsx`.

4. Middleware e Ambiente (apenas checagem)
- Confirmar que o `middleware.ts` não bloqueia navegação em dev; manter como está se ok.
- Validar `.env.local` com chaves públicas se necessário (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Limpeza e Validação
- Apagar `.next` e reiniciar `npm run dev`.
- Validar Preview em `http://localhost:3000/`.
- Rodar `npm run build` para garantir que o build de produção conclui.

## Entrega
- Preview local funcionando sem erros nas rotas principais.
- Build de produção bem-sucedido.
- Opcional: preparar staging na Vercel (`staging`) para URL pública.

Posso aplicar todas as correções agora e te entregar
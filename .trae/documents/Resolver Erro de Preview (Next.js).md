## Diagnóstico
- Verificar logs do servidor local e compilações para identificar o ponto de falha (webpack/TypeScript).
- Confirmar porta ativa do dev server e URL usada no Preview (3000 ou 3001) para evitar “Service is unavailable”.
- Checar páginas do App Router com foco em `app/(dashboard)/parceiro/page.tsx` e imports quebrados.

## Correções de Código
- Garantir export padrão correto em páginas do App Router:
  - `export default function Page()` em `app/(dashboard)/parceiro/page.tsx` (linha inicial) e remover export duplicado no final.
- Corrigir imports ausentes/paths incorretos:
  - Confirmar `@/components/ui/dialog` existente (`components/ui/dialog.tsx`).
  - Ajustar todas as páginas que importam `@/components/ui/dialog` (produtos: acomodações, categorias, passeios, transportes) para compilar sem erro.
- Validar `app/providers.tsx` com `'use client'` e imports de `ThemeProvider`, `SessionProvider` e `Toaster` — arquivo já restaurado.

## Dependências
- Instalar `@supabase/auth-helpers-nextjs` caso haja import em `components/dashboard/role-based-dashboard.tsx`.
- Conferir versões de `next` (14.2.x) e compatibilidade dos pacotes Radix/Lucide.

## Ambiente e Variáveis
- Criar/validar `.env.local` com chaves públicas usadas em runtime:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- Evitar que `middleware.ts` bloqueie navegação sem sessão; revisar lógica para ambiente de desenvolvimento.

## Fluxo de Build/Preview
- Limpar caches: remover `.next` e reiniciar dev server.
- Rodar `npm install`, `npm run dev` e garantir inicialização sem webpack errors.
- Testar navegação local em `http://localhost:3000` (ou `3001` se a 3000 estiver ocupada).

## Validação
- Executar `npm run build` para confirmar que o projeto compila em modo produção.
- Abrir páginas críticas: Login, Dashboard do Parceiro, Produtos (acomodações/categorias/passeios/transportes).

## Staging na Vercel (opcional após Preview local)
- Configurar variáveis de ambiente de Preview no Vercel.
- Ativar deploy da branch `staging` para gerar Preview Deployment com URL pública.
- Validar as mesmas rotas no ambiente de Preview.

Confirma que posso aplicar este plano agora? Vou executar as correções e subir o Preview local em seguida.
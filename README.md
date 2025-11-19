# 🏖️ RedeTour - Plataforma de Turismo com Sistema de Afiliados

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=flat&logo=stripe)](https://stripe.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

> **Nota**: Este é um MVP (Minimum Viable Product) de uma plataforma de turismo completa com sistema de afiliados, preparada para escalar e ser internacionalizada como "Voyager Tour".

## 🎯 Visão Geral

RedeTour é uma plataforma web moderna que conecta viajantes com pousadas, experiências turísticas e serviços de transporte. O sistema inclui:

- ✅ **Marketplace de Turismo**: Acomodações, experiências e veículos
- ✅ **Sistema de Afiliados**: Rastreamento de indicações e comissões
- ✅ **Pagamentos com Stripe**: Checkout seguro e webhooks
- ✅ **Dashboards Multi-Role**: Cliente, Parceiro, Afiliado e Admin
- ✅ **Internacionalização**: Preparado para múltiplos idiomas
- ✅ **Segurança Enterprise**: RLS, CSP, Rate Limiting, HSTS

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14** (App Router) - Framework React moderno
- **TypeScript 5** - Type safety completo
- **TailwindCSS + Shadcn/UI** - Design system consistente
- **Framer Motion** - Animações suaves
- **next-intl** - Internacionalização

### Backend & Infraestrutura
- **Supabase** - BaaS com PostgreSQL, Auth e Storage
- **Stripe** - Processamento de pagamentos
- **Vercel** - Hospedagem com edge functions
- **Upstash Redis** - Rate limiting (opcional)

### Segurança & Performance
- **Row Level Security (RLS)** - Controle de acesso no banco
- **Content Security Policy (CSP)** - Proteção contra XSS
- **Rate Limiting** - Proteção contra abuso
- **CSRF Protection** - Proteção contra ataques CSRF
- **Input Validation** - Validação com Zod

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recomendado)
- **Git** para versionamento
- Contas em:
  - [Supabase](https://supabase.com) (gratuito)
  - [Stripe](https://stripe.com) (para pagamentos)
  - [Vercel](https://vercel.com) (para deploy)

## 🛠️ Instalação Local

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/redetour.git
cd redetour
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Preencha as variáveis necessárias (veja seção de configuração).

### 4. Configure o Supabase

#### Crie um novo projeto no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto
3. Copie as credenciais para seu `.env.local`

#### Execute as migrations

```bash
# Execute o schema SQL no Supabase Dashboard ou CLI
supabase db reset

# Ou use o CLI para aplicar migrations
supabase migration up
```

#### Configure as RLS Policies

Execute o arquivo `/database/policies.sql` no Supabase Dashboard.

### 5. Configure o Stripe

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Obtenha suas chaves de API
3. Configure o webhook endpoint: `https://seu-dominio.vercel.app/api/stripe/webhook`
4. Copie o webhook secret

### 6. Rode o servidor de desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔧 Configuração Detalhada

### Variáveis de Ambiente Obrigatórias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave
STRIPE_SECRET_KEY=sk_test_sua-chave
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret

# Vercel
NEXT_PUBLIC_VERCEL_URL=http://localhost:3000
```

### Configuração do Supabase

#### 1. Auth Providers

Habilite os providers de autenticação desejados:
- Email/Password (já habilitado por padrão)
- Google (opcional)
- Facebook (opcional)

#### 2. Storage Buckets

Crie os seguintes buckets:
- `accommodations` - Para imagens de acomodações
- `experiences` - Para imagens de experiências
- `vehicles` - Para imagens de veículos
- `profiles` - Para avatares de usuários

Configure as políticas de acesso apropriadas.

#### 3. Edge Functions (Opcional)

Para processamento de imagens e webhooks avançados:

```bash
supabase functions new process-image
supabase functions new webhook-handler
```

### Configuração do Stripe

#### 1. Webhooks

Configure os seguintes eventos no webhook:
- `checkout.session.completed`
- `payment_intent.payment_failed`
- `payment_intent.succeeded`
- `invoice.payment_succeeded`

#### 2. Connect (para afiliados)

Se quiser pagar afiliados automaticamente:
1. Ative Stripe Connect
2. Configure as taxas de plataforma
3. Configure transferências automáticas

## 📁 Estrutura do Projeto

```
redetour/
├── app/                    # Next.js App Router
│   ├── (public)/          # Rotas públicas
│   ├── auth/              # Autenticação
│   ├── dashboard/         # Dashboards por role
│   ├── api/               # API Routes
│   └── layout.tsx         # Root layout
├── components/            # Componentes React
│   ├── ui/               # Shadcn/UI components
│   ├── cards/            # Cards específicos
│   ├── forms/            # Formulários
│   └── layouts/          # Layouts reutilizáveis
├── lib/                   # Utilitários e configurações
│   ├── supabaseClient.ts # Cliente Supabase browser
│   ├── serverSupabase.ts # Cliente Supabase server
│   ├── stripe.ts         # Configuração Stripe
│   └── csrf.ts           # Proteção CSRF
├── database/              # SQL e migrations
│   ├── schema.sql        # Schema principal
│   └── policies.sql      # RLS Policies
├── types/                 # Tipos TypeScript
├── hooks/                 # Custom hooks
├── utils/                 # Funções utilitárias
└── public/               # Assets estáticos
```

## 🧪 Testes

### Testes Unitários

```bash
# Rodar todos os testes
pnpm test

# Rodar em modo watch
pnpm test:watch

# Gerar coverage
pnpm test:coverage
```

### Testes E2E

```bash
# Instalar Playwright
pnpm playwright install

# Rodar testes E2E
pnpm test:e2e

# Abrir interface UI
pnpm test:e2e:ui
```

## 🚀 Deploy na Vercel

### 1. Conecte ao GitHub

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Importe seu repositório do GitHub
3. Configure as variáveis de ambiente

### 2. Configure as variáveis no Vercel

Adicione todas as variáveis de ambiente do `.env.local` no dashboard da Vercel.

### 3. Deploy automático

Cada push para a branch `main` irá disparar um deploy automático.

### 4. Configure domínio customizado

1. Vá para Settings > Domains
2. Adicione seu domínio
3. Configure os DNS conforme instruído

## 📊 Monitoramento

### Sentry (Opcional)

1. Crie um projeto no Sentry
2. Adicione o DSN às variáveis de ambiente
3. Configure alerts para erros críticos

### Analytics

A aplicação já vem com Vercel Analytics integrado. Para analytics adicionais:

```bash
# PostHog (recomendado)
npm install posthog-js

# Google Analytics
gtag.js já configurado
```

## 🔒 Segurança

### Checklist de Segurança

- [ ] HTTPS forçado com HSTS
- [ ] CSP configurado e testado
- [ ] Cookies com secure, httponly, samesite
- [ ] RLS ativado em todas as tabelas
- [ ] Rate limiting implementado
- [ ] Validação de webhook do Stripe
- [ ] Sanitização de inputs com Zod
- [ ] Headers de segurança configurados
- [ ] Logs de segurança implementados
- [ ] Backup automativo configurado

### Relatórios de Segurança

Logs de segurança são armazenados na tabela `security_events`. Monitore regularmente para:
- Tentativas de login falhadas
- Acessos não autorizados
- Rate limiting ativado
- Atividades suspeitas

## 🌍 Internacionalização

### Preparando para Voyager Tour

A aplicação já está preparada para ser clonada como "Voyager Tour" com:

1. **Traduções completas** em `/i18n/locales/`
2. **Sistema de temas** configurável
3. **Assets separados** por marca
4. **Configurações por domínio**

### Adicionando novo idioma

1. Crie nova pasta em `/i18n/locales/`
2. Copie arquivos `.json` existentes
3. Traduza os textos
4. Adicione à configuração do Next.js

## 💰 Sistema de Afiliados

### Como funciona

1. **Cadastro**: Qualquer usuário pode se tornar afiliado
2. **Código único**: Sistema gera código personalizado
3. **Rastreamento**: Cookies duram 30 dias
4. **Comissões**: Automáticas por tipo de produto
5. **Saques**: Via Pix ou Stripe Connect

### Configuração de Comissões

Edite a tabela `commissions` para configurar percentuais:

```sql
-- Acomodações: 5%
-- Experiências: 8%
-- Veículos: 3%
```

## 📞 Suporte

### Documentação Adicional

- [Documentação Técnica](./docs/technical.md)
- [Guia de Deploy](./docs/deploy.md)
- [API Reference](./docs/api.md)
- [Component Library](./docs/components.md)

### Comunidade

- [Discord](https://discord.gg/redetour)
- [GitHub Discussions](https://github.com/seu-usuario/redetour/discussions)
- [Issues](https://github.com/seu-usuario/redetour/issues)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏆 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework incrível
- [Supabase](https://supabase.com/) - BaaS que simplifica tudo
- [Shadcn/UI](https://ui.shadcn.com/) - Componentes lindos
- [Vercel](https://vercel.com/) - Hospedagem impecável

---

**Desenvolvido com ❤️ pela equipe RedeTour**
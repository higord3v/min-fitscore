# Mini FitScore

O Mini FitScore é uma ferramenta de avaliação de candidatos que calcula um "Fit Score" com base em respostas a um formulário. Ele ajuda a agilizar o processo de triagem, fornecendo uma pontuação de compatibilidade do candidato com a cultura e os requisitos da empresa.

## File Tree

```
├── 📁 .git/ 🚫 (auto-hidden)
├── 📁 .next/ 🚫 (auto-hidden)
├── 📁 app/
│   ├── 📁 api/
│   │   ├── 📁 auth/
│   │   │   └── 📁 resend-confirmation/
│   │   │       └── 📄 route.ts
│   │   ├── 📁 candidates/
│   │   │   └── 📄 route.ts
│   │   └── 📁 send-email/
│   │       └── 📄 route.ts
│   ├── 📁 dashboard/
│   │   └── 📄 page.tsx
│   ├── 📁 form/
│   │   └── 📄 page.tsx
│   ├── 📁 login/
│   │   └── 📄 page.tsx
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   └── 📄 page.tsx
├── 📁 components/
│   ├── 📁 Auth/
│   │   └── 📄 ProtectedRoute.tsx
│   ├── 📄 Header.tsx
│   └── 📄 LogoutButton.tsx
├── 📁 contexts/
│   └── 📄 AuthContext.tsx
├── 📁 docs/
├── 📁 lib/
│   └── 📁 supabase/
│       ├── 📄 client.ts
│       ├── 📄 middleware.ts
│       └── 📄 server.ts
├── 📁 node_modules/ 🚫 (auto-hidden)
├── 📁 public/
├── 📄 .env.example
├── 📄 .env.local 🚫 (auto-hidden)
├── 🚫 .gitignore
├── 📖 README.md
├── 📄 eslint.config.mjs
├── 📄 next-env.d.ts 🚫 (auto-hidden)
├── 📄 next.config.ts
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 postcss.config.mjs
└── 📄 tsconfig.json
```


## Funcionalidades

- **Autenticação de Usuários**: Sistema de login e cadastro com confirmação por e-mail.
- **Dois Níveis de Acesso**:
  - **Usuário (Avaliador)**: Preenche o formulário de avaliação para um candidato.
  - **Admin (Gestor)**: Acessa um dashboard com todos os candidatos avaliados, estatísticas e filtros.
- **Formulário de Avaliação**: Um questionário de 10 perguntas divididas em 3 categorias: Performance, Energia e Cultura.
- **Cálculo de Fit Score**: Gera uma pontuação de 0 a 100 e uma classificação para cada candidato.
- **Notificações por E-mail**: Envia o resultado da avaliação para o e-mail do candidato.
- **Dashboard de Admin**: Painel para visualização e gerenciamento dos resultados.

## Tecnologias Utilizadas

- **Next.js**: Framework React para desenvolvimento de aplicações web full-stack.
- **React**: Biblioteca para construção de interfaces de usuário.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Supabase**: Plataforma open-source que oferece banco de dados PostgreSQL, autenticação, e APIs auto-geradas.
- **Tailwind CSS**: Framework de CSS utility-first para estilização rápida e customizável.
- **Resend**: Serviço para envio de e-mails transacionais.
- **n8n**: Ferramenta de automação de workflows para tarefas agendadas e processos de back-end.

## O que foi aprendido

- **Desenvolvimento Full-Stack com Next.js**: Utilização do App Router para criar uma aplicação completa, com front-end e back-end integrados.
- **Integração com Supabase**: Implementação de autenticação (login, cadastro, confirmação de e-mail) e operações de banco de dados (CRUD) de forma segura.
- **Gerenciamento de Rotas e Acesso**: Criação de rotas protegidas e diferenciação de acesso com base em perfis de usuário (admin vs. user).
- **Envio de E-mails Transacionais**: Integração com o Resend para notificar os candidatos sobre os resultados da avaliação.
- **Criação de Formulários Multi-Etapas**: Desenvolvimento de um formulário complexo com estado gerenciado em React.
- **Estilização com Tailwind CSS**: Aplicação de um design moderno e responsivo de forma eficiente.
- **Automação de Processos**: Concepção de um workflow no n8n para automatizar o envio de relatórios, otimizando a comunicação com os gestores.

## Design da API

A aplicação utiliza uma abordagem de API com endpoints específicos para lidar com as operações de back-end.

### Endpoints

- `POST /api/auth/resend-confirmation`
  - Reenvia o e-mail de confirmação para o usuário autenticado.
  - Protegido por autenticação.

- `GET /api/candidates`
  - Retorna uma lista de todos os candidatos avaliados.
  - Protegido por autenticação (requer perfil de admin).

- `POST /api/send-email`
  - Envia um e-mail para o candidato com o resultado da avaliação.
  - Utiliza o serviço Resend para o envio.

## Schema do Banco de Dados

O projeto utiliza o Supabase como banco de dados. O schema é composto por duas tabelas principais:

### Tabela `user_profiles`

Armazena informações adicionais dos usuários, como a função (role).

```sql
table public.user_profiles (
  id uuid not null,
  email text not null,
  role text not null default 'user'::text,
  created_at timestamp with time zone null default now(),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
)
```

### Tabela `candidates`

Armazena os dados dos candidatos avaliados, incluindo o Fit Score e a classificação.

```sql
table public.candidates (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text not null,
  fit_score integer not null,
  classification text not null,
  created_at timestamp with time zone null default now(),
  evaluated_by uuid null,
  constraint candidates_pkey primary key (id),
  constraint candidates_evaluated_by_fkey foreign KEY (evaluated_by) references auth.users (id)
)
```

## Automação com n8n

Para manter os gestores atualizados, foi criado um workflow no n8n que envia relatórios periódicos.

### Relatório de Candidatos Aprovados

- **Frequência**: O workflow é executado a cada 12 horas.
- **Processo**:
  1. **Buscar Candidatos**: O workflow se conecta ao banco de dados Supabase e busca por candidatos que foram avaliados nas últimas 12 horas e obtiveram a classificação de "Fit Aprovado" ou "Fit Altíssimo".
  2. **Gerar Relatório**: Com os dados coletados, é gerado um relatório resumido contendo o nome, e-mail, Fit Score e classificação de cada candidato aprovado.
  3. **Enviar E-mail**: O relatório é enviado por e-mail para todos os usuários com a função de "admin".

Este processo garante que os gestores recebam informações atualizadas sobre os candidatos mais promissores de forma automática.
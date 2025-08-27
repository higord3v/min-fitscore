# Mini FitScore

O Mini FitScore é uma ferramenta de avaliação de candidatos que calcula um "Fit Score" com base em respostas a um formulário. Ele ajuda a agilizar o processo de triagem, fornecendo uma pontuação de compatibilidade do candidato com a cultura e os requisitos da empresa.

## Funcionalidades

- **Autenticação de Usuários**: Sistema de login e cadastro com confirmação por e-mail.
- **Dois Níveis de Acesso**:
  - **Usuário (Avaliador)**: Preenche o formulário de avaliação para um candidato.
  - **Admin (Gestor)**: Acessa um dashboard com todos os candidatos avaliados, estatísticas e filtros.
- **Formulário de Avaliação**: Um questionário de 10 perguntas divididas em 3 categorias: Performance, Energia e Cultura.
- **Cálculo de Fit Score**: Gera uma pontuação de 0 a 100 e uma classificação para cada candidato.
- **Notificações por E-mail**: Envia o resultado da avaliação para o e-mail do candidato.
- **Dashboard de Admin**: Painel para visualização e gerenciamento dos resultados.

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
  3. **Enviar E-mail**: O relatório é enviado por e-mail para todos os usuários com a função de "admin" (Se não achar, verificar SPAM).

Este processo garante que os gestores recebam informações atualizadas sobre os candidatos mais promissores de forma automática.

src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # Formulário principal
│   ├── dashboard/
│   │   └── page.tsx    # Dashboard de candidatos
│   └── api/
│       ├── submit/route.ts
│       └── candidates/route.ts
├── components/         # Componentes React
│   ├── Form/
│   ├── Dashboard/
│   └── UI/
├── lib/               # Utilitários
│   ├── supabase.ts
│   ├── calculations.ts
│   └── email-templates.ts
└── types/             # TypeScript definitions
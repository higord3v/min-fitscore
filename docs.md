
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

---

# Schema Tabelas

table public.user_profiles (
  id uuid not null,
  email text not null,
  role text not null default 'user'::text,
  created_at timestamp with time zone null default now(),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
)

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


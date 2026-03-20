# FraudWatch

Plataforma para víctimas de fraude y estafas. Organízate colectivamente, documenta pruebas de forma segura y ejerce tus derechos con plenas garantías RGPD.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Base de datos & Auth:** Supabase (PostgreSQL + Supabase Auth)
- **Storage:** Supabase Storage (bucket privado)
- **Validación:** Zod
- **Sanitización:** isomorphic-dompurify

## Puesta en marcha

### 1. Configura Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve al **SQL Editor** y ejecuta el contenido completo de `supabase/00_schema.sql`
3. En **Authentication → Configuration → Email**, activa _Confirm email_
4. En **Authentication → URL Configuration**, añade como Redirect URL:
   ```
   http://localhost:3000/api/auth/callback
   ```

### 2. Configura las variables de entorno

Edita `.env.local` con tus claves:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Las claves las encuentras en **Project Settings → API**.

### 3. Instala dependencias y ejecuta

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/          # Login y registro
│   ├── (dashboard)/     # Casos, crear, perfil
│   ├── api/             # API Routes
│   └── page.tsx         # Landing page (SSG)
├── components/
│   ├── forms/           # AuthFields, FileUploader
│   ├── layout/          # Header, Footer, DashboardNav
│   ├── cases/           # CaseCard, Filters, Pagination...
│   └── landing/         # Secciones de la landing
├── lib/
│   ├── supabase/        # client.ts, server.ts, admin.ts
│   ├── sanitize.ts      # DOMPurify server-side
│   ├── validators.ts    # Zod schemas
│   └── auth-actions.ts  # Server actions
├── hooks/
│   └── useAuth.ts
├── middleware.ts         # Protección de rutas
└── types/
    └── database.ts      # TypeScript types
supabase/
└── 00_schema.sql        # Schema, RLS, storage, funciones RPC
```

## Seguridad y RGPD

- **RLS** habilitado en todas las tablas
- **Bucket privado** para evidencias (nunca público)
- **Signed URLs** con expiración de 60 segundos
- **Sanitización** DOMPurify server-side en todos los inputs
- **consent_logs** inmutable para auditoría (Art. 7.1 RGPD)
- **Exportación** de datos (Art. 20 RGPD — Portabilidad)
- **Eliminación/Anonimización** de cuenta (Art. 17 RGPD — Derecho al olvido)
- **Double Opt-In** en el registro (confirmación de email)
- **Privacy by Design** — checkboxes de consentimiento desmarcados por defecto

## Deploy en Vercel

```bash
vercel --prod
```

Añade las variables de entorno en el dashboard de Vercel y actualiza `NEXT_PUBLIC_SITE_URL` con tu dominio de producción.

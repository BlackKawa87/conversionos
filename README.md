# ConversionOS

Conversion Intelligence Platform. Diagnoses, prioritizes, and guides digital funnel optimization.

---

## Temporary Password Login

> **REMOVE OR DISABLE BEFORE GO LIVE**
>
> Use this for local development when the magic link email is not yet configured.
> Uses `supabase.auth.signInWithPassword()` — real Supabase Auth, real JWT, RLS fully intact.

### How it works

Setting `VITE_ENABLE_PASSWORD_LOGIN=true` adds a **password form** to the login page.
Entering valid credentials calls `signInWithPassword`, which produces a real JWT.
All Supabase RLS policies apply normally. No mocks, no fake users.

### Setup

**Step 1 — Create a user in Supabase**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **Authentication → Users**
3. Click **Add user → Create new user**
4. Enter email and password
5. Check **Auto confirm user** (or manually confirm via the user row menu → **Send confirmation email**)

**Step 2 — Enable the flag**

Add to `.env.local` (already gitignored):

```env
VITE_ENABLE_PASSWORD_LOGIN=true
```

**Step 3 — Start the dev server**

```bash
npm run dev
```

**Step 4 — Sign in**

The login page now shows an email + password form. Enter the credentials you set in Supabase.
A real JWT is created and stored — all data queries work normally via RLS.

### Disabling

Remove or set `VITE_ENABLE_PASSWORD_LOGIN=false` in `.env.local` and restart the dev server.

### Error messages

| Supabase error | Displayed message |
|----------------|-------------------|
| Invalid login credentials | E-mail ou senha incorretos. |
| Email not confirmed | E-mail não confirmado. Confirme em Supabase Dashboard → Authentication → Users. |
| User not found | Usuário não encontrado. |
| Network error | Erro de conexão. Verifique sua internet e tente novamente. |

---

## Development Auth Bypass

> **REMOVE OR DISABLE BEFORE GO LIVE**
>
> Skips frontend auth guards without creating fake users. Supabase RLS is **not** bypassed.
> Requires a real Supabase session in localStorage — sign in via magic link or password first.

### Setup

```env
# .env.local
VITE_DISABLE_AUTH=true
VITE_DEV_USER_ID=your-real-user-uuid
VITE_DEV_ORG_ID=your-real-org-uuid
VITE_DEV_USER_EMAIL=dev@yourdomain.com   # optional, display only
```

Restart `npm run dev`. An amber **"Auth Disabled — Dev Only"** badge appears in the Topbar.
If `VITE_DEV_USER_ID` or `VITE_DEV_ORG_ID` is missing, access is blocked with an explicit error.

### Security rules (both dev modes)

| Rule | Status |
|------|--------|
| Magic Link not removed | LoginPage.tsx — full flow intact |
| Supabase Auth not removed | Architecture constraint |
| RLS not weakened | Architecture constraint |
| `service_role` key never in frontend | Architecture constraint |
| No fake users or mock data | Architecture constraint |
| Visual warning always shown | Badge in Topbar / dev badge on form |
| Console warning always logged | devBypass.ts |

### Files involved

```
src/features/auth/devBypass.ts             ← bypass config + validation singleton
src/features/auth/hooks/useAuth.ts         ← bypass branch
src/features/auth/components/LoginPage.tsx ← password form + bypass redirect
src/features/shell/Topbar.tsx              ← amber badge when bypass active
src/vite-env.d.ts                          ← env var types
.env.example                               ← documented placeholders
```

---

## Stack

- React 18 + TypeScript + Vite
- Supabase (auth + database, RLS on all tables)
- Vercel (deploy + serverless functions)
- OpenAI API (contextual recommendations)
- react-i18next (en/pt/es)

## Commands

```bash
npm run dev      # Dev server
npm run build    # TypeScript check + build
npm run lint     # ESLint
npm run preview  # Preview production build
```

# Deploy — Lorgen Invitational

## Steg 1 — Supabase SQL-skjema

1. Gå til: https://supabase.com/dashboard/project/fybgegusbmdhoafkmutc/sql/new
2. Klikk **New query**
3. Paste hele innholdet fra `supabase/schema.sql`
4. Klikk **Run** (grønn knapp)

✅ Ferdig — alle tabeller og tilganger er satt opp.

---

## Steg 2 — Storage bucket (kjør lokalt)

```bash
# Klon repo og installer avhengigheter
npm install

# Kjør setup-scriptet (oppretter bucket automatisk)
node scripts/setup.js
```

Alternativt manuelt i Supabase dashboard:
1. Gå til **Storage** i venstre meny
2. Klikk **New bucket**
3. Navn: `tournament-photos`
4. Huk av **Public bucket**
5. Klikk **Save**

---

## Steg 3 — Vercel deploy

### 3a. Koble til repo
1. Gå til https://vercel.com/new
2. Velg GitHub-repoet `Lorgen-Invitational`
3. Framework: **Next.js** (oppdages automatisk)

### 3b. Sett miljøvariabler
Under **Environment Variables**, legg til disse 4:

| Navn | Verdi |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fybgegusbmdhoafkmutc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YmdlZ3VzYm1kaG9hZmttdXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzY4NTksImV4cCI6MjA5MDcxMjg1OX0.VzZWPCHp0uY2uvur4IL7-OjLwoTGSXjTq9chAd59DS4` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YmdlZ3VzYm1kaG9hZmttdXRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTEzNjg1OSwiZXhwIjoyMDkwNzEyODU5fQ._9Ag8lL_oLAwCr4MxkAJhGzTs2FbcI9G7ECt_XwqNxw` |
| `ADMIN_PASSWORD` | `lorgen2026` |

### 3c. Deploy
Klikk **Deploy** — Vercel bygger og publiserer automatisk.

---

## Etter deploy

1. Gå til `/admin` → logg inn med passordet
2. Opprett turnering under **Turnering**-fanen
3. Legg til lag under **Lag**-fanen (PIN genereres automatisk)
4. Del PIN med hvert lag — de logger inn via `/scorekort`

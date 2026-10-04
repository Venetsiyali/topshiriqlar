# PyRace — jonli dars platformasi

Dars davomida talabalar real vaqtda musobaqalashadigan, o'qituvchi katta ekranda poygani kuzatadigan veb-platforma.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Supabase (Postgres, Auth, Realtime) · Pyodide · Vercel

## Holat

- [x] 1-bosqich — poydevor: loyiha skeleti, Supabase sxemasi + RLS, o'qituvchi autentifikatsiyasi
- [ ] 2-bosqich — guruh / quiz / topshiriq CRUD
- [ ] 3-bosqich — sessiya, PIN, QR, lobby
- [ ] 4-bosqich — realtime
- [ ] 5-bosqich — topshiriq turlari (crossword, choice, short, python, order)
- [ ] 6-bosqich — katta ekran (poyga treki, podium)
- [ ] 7-bosqich — natijalar, CSV, sayqal

## Ishga tushirish

1. [supabase.com](https://supabase.com) da loyiha yarating.
2. SQL Editor'da `supabase/migrations/0001_init.sql` faylini ishga tushiring.
3. `.env.example` dan `.env.local` yarating va kalitlarni kiriting (Supabase → Project Settings → API).
4. ```bash
   npm install
   npm run dev
   ```

## Deploy (Vercel)

Vercel'da GitHub repo'ni import qiling va quyidagi muhit o'zgaruvchilarini kiriting:

| O'zgaruvchi | Qayerdan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (maxfiy!) |
| `NEXT_PUBLIC_APP_URL` | Vercel bergan domen, masalan `https://pyrace.vercel.app` |

Supabase → Authentication → URL Configuration'da **Site URL** va **Redirect URLs** ga Vercel domenini (`https://<domen>/auth/callback`) qo'shing.

## Xavfsizlik

- Topshiriqning to'g'ri javobi hech qachon klientga yuborilmaydi — `tasks` jadvalini faqat quiz egasi o'qiy oladi, tekshirish server tomonda.
- `players.device_token` da token xeshi saqlanadi va ustun klient rollaridan yashirilgan.
- `SUPABASE_SERVICE_ROLE_KEY` faqat `lib/supabase/server.ts` → `createAdminClient()` orqali, server kodida ishlatiladi.

# In The Paint

AAU travel basketball team app — built for the Sandhills Ballers, designed to scale to other teams later.

## Stack
- Static HTML/CSS/JS (no build step)
- Vercel — hosting, auto-deploy on `git push`
- Supabase — auth, Postgres database, realtime
- PWA — installed via "Add to Home Screen" (iOS + Android)

## Local dev
No build step required. Open `public/index.html` directly, or serve the `public/` folder with any static server.

## Deploy
```
git add .
git commit -m "message"
git push origin main
```
Vercel auto-deploys from `main` in ~30s.

## Supabase
- Schema: `in_the_paint_schema.sql`
- RLS policies: `in_the_paint_rls_policies.sql`
- Both should be run in the Supabase SQL Editor, schema first, then policies.

## Roadmap
See project turnover doc for full phase breakdown (roster/schedule → stats/scorekeeping → travel logistics → animated plays board).

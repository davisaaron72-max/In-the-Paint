# In The Paint — Email Setup (SendGrid)

## What email handles
- Coach invites (account setup link)
- Announcement emails (optional email copy of important Team Chat posts)
- Weekly digest (upcoming schedule + stat leaders, auto-sent every Sunday)
- NOTE: magic-link / OTP login emails are handled by Supabase Auth's built-in
  email sending by default — you don't need SendGrid for that to work. You CAN
  later point Supabase Auth at SendGrid's SMTP for custom branding, but it's
  optional and not required for login to function.

## 1. Create a SendGrid account
- Go to sendgrid.com, sign up (their free tier covers low volume, fine for a single team)
- Verify your sender identity: Settings → Sender Authentication
  - Easiest path: "Single Sender Verification" using your own email first
  - Better long-term: verify your own domain (e.g. mail.inthepaintapp.com) for
    better deliverability, but single sender is fine to start

## 2. Create an API key
- Settings → API Keys → Create API Key
- Restricted Access is fine, just needs "Mail Send" permission
- Copy the key immediately, SendGrid only shows it once

## 3. Add environment variables in Vercel
Go to your Vercel project → Settings → Environment Variables, and add:

| Key | Value |
|---|---|
| SENDGRID_API_KEY | the key from step 2 |
| SENDGRID_FROM_EMAIL | the verified sender email from step 1 |
| SUPABASE_URL | your Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | from Supabase Settings → API (service_role, NOT anon) |

⚠️ SUPABASE_SERVICE_ROLE_KEY bypasses RLS entirely. It must ONLY ever live in
Vercel's server-side environment variables — never in any file under /public,
never in client-side JS, never committed to the repo.

## 4. What's already scaffolded
- `/api/send-announcement-email.js` — POST endpoint, emails everyone on a team
- `/api/weekly-digest.js` — runs automatically via Vercel Cron every Sunday
  at 8am ET, pulls the upcoming week's schedule per team and emails it out
- `vercel.json` already has the cron schedule configured

## 5. Local testing
Vercel Cron only fires on deployed (production) projects, not locally. To test
the digest function locally, run `vercel dev` and hit
`http://localhost:3000/api/weekly-digest` directly with a tool like Postman —
the auth check in the file allows this outside of NODE_ENV=production.

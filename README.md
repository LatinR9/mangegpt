# SubGroup Manager

Private internal admin web app for managing shared subscription groups, customer seats, payments, service accounts, and Telegram renewal reminders.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- Supabase database, auth, and storage-ready schema

## Current state

This repository uses mock data only. It does not include real emails, passwords, tokens, chat IDs, or customer information. Password-like fields are masked in the UI by default and represented as `*_encrypted` columns so encryption can be wired in before production storage.

## Install

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase values.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APP_URL=http://localhost:3000
CREDENTIAL_ENCRYPTION_KEY=replace-with-a-strong-key
TELEGRAM_BOT_TOKEN_ENCRYPTION_KEY=replace-with-a-strong-key
```

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/20260630000000_initial_schema.sql` in the Supabase SQL editor or through the Supabase CLI.
3. Enable Supabase Auth for admin users.
4. Create a Storage bucket for customer profile images and payment slips when replacing mock URLs.
5. Replace the temporary mock login cookie with Supabase Auth session checks.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000` and log in with any mock admin email/password. The current login is a development placeholder and should be replaced with Supabase Auth before production.

## Deploy

1. Push this repo to GitHub.
2. Import the repo into Vercel or another Next.js host.
3. Add the environment variables from `.env.example`.
4. Apply the Supabase migration in the target Supabase project.
5. Replace mock data with Supabase queries and server actions.

## Telegram bot setup later

1. Create a bot with BotFather.
2. Store the bot token encrypted in `telegram_settings.bot_token_encrypted`.
3. Store the chat id encrypted in `telegram_settings.chat_id_encrypted`.
4. Keep decryption and sending server-side only.
5. Call `sendTestTelegramReminder` manually from the settings screen while testing.
6. Later, call the same reminder function from a daily cron job or Supabase scheduled Edge Function.

## Security notes

- Do not store plain text passwords, bot tokens, or chat IDs.
- Use encryption before writing credentials to Supabase.
- Keep service-role keys server-side only.
- Review Row Level Security policies before production.
- Restrict admin access to trusted users only.

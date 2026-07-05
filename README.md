# ITSM Ticketing System

A complete single-folder Next.js App Router ticketing system using Tailwind CSS, TypeScript, and Supabase.

## Features
- User-facing ticket submission form
- Admin dashboard with summaries and status filters
- Supabase-backed ticket storage
- Email notification after ticket creation

## Supabase setup
1. Create a Supabase project.
2. In the SQL editor, run:

```sql
create extension if not exists "uuid-ossp";

create table if not exists public.tickets (
  id uuid primary key default uuid_generate_v4(),
  ticket_number text not null unique,
  requestor_name text not null,
  requestor_email text not null,
  requestor_t_number text,
  requestor_user_id text,
  contact_type text not null check (contact_type in ('Web','Email','Phone')),
  priority text not null check (priority in ('Critical','High','Moderate','Low')),
  location text,
  short_description text not null,
  description text,
  status text not null default 'Registered',
  created_at timestamp with time zone not null default now()
);
```

3. Copy `.env.example` to `.env.local` and fill in your values.
   - Use `SUPABASE_URL` and `SUPABASE_ANON_KEY` for server-side access.
   - Also include `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side pages.
   - Set `NEXT_PUBLIC_ADMIN_USERNAME` and `NEXT_PUBLIC_ADMIN_PASSWORD` for `/admin` access.
4. Run:

```bash
npm install
npm run dev
```

## Admin access
Use the values from `NEXT_PUBLIC_ADMIN_USERNAME` and `NEXT_PUBLIC_ADMIN_PASSWORD` to sign in at `/admin`.

## Notes
- The email step is implemented with Nodemailer and will log or attempt delivery based on your SMTP settings.
- If Supabase credentials are missing, the app will show a configuration error until `.env.local` is set.

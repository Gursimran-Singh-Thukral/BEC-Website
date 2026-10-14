# BEC IIT Jammu: website and admin dashboard

The public website of the Budding Entrepreneurs' Club, IIT Jammu, plus an admin dashboard for running it.

```text
client/   the website + admin UI        Next.js 16 · React 19 · Tailwind 4 · Auth.js     → deploy on Vercel
server/   the API (data, rules, files)  Express 5 · Postgres (Drizzle ORM) · zod · jose  → deploy on Render
```

**How they fit together.** Visitors only ever talk to the client. The client's server code calls the API using a short-lived
signed token (shared secret `API_JWT_SECRET`). The API validates everything, owns the database and uploaded files, and
re-checks the admin allow-list on every admin request. The browser never talks to the API directly, so the API needs no CORS.

- **Public site:** Home, Initiatives (events, RSVPs, Big Idea Cohort), Team, Handbooks, Join (applications and Idea Dropbox).
- **Admin dashboard (`/admin`):** events, applications, team, handbooks, site settings, admins.
- **Sign-in:** Google, restricted to `@iitjammu.ac.in` accounts that are on the allow-list.

---

## Run it locally

You need Node 22+. No database to install: locally the API uses an embedded Postgres (PGlite) stored in `server/data/`.

```bash
npm run install:all                     # installs root, server and client

cp server/.env.example server/.env      # then edit (see below)
cp client/.env.example client/.env.local

npm run dev                             # API on :4000, website on :3000
```

Minimum local settings:

| File | Variable | Value |
| --- | --- | --- |
| `server/.env` | `API_JWT_SECRET` | any long random string |
| `server/.env` | `ADMIN_EMAILS` | your `@iitjammu.ac.in` address(es); the first is the owner |
| `client/.env.local` | `API_URL` | `http://localhost:4000` |
| `client/.env.local` | `API_JWT_SECRET` | **the same string** as in `server/.env` |
| `client/.env.local` | `AUTH_SECRET` | any long random string |
| `client/.env.local` | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | your Google OAuth client (optional locally) |

In development only, the login page has a "Development only" box that signs you in as any address in `ADMIN_EMAILS` without Google.

The first start creates the tables and seeds the content from the orientation deck. Delete `server/data/` to start fresh.

---

## Deploy: Neon (database) → Render (API) → Vercel (website)

Do the steps in this order. Everything below can be done on free plans (see "Free-tier notes" at the end).

### 1. Database: Neon (free Postgres that doesn't expire)

1. Create an account at [neon.tech](https://neon.tech) and a new project (pick the region closest to your Render region, e.g. Singapore).
2. Copy the **connection string** (it looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`). Keep it for step 2.

(Render's own free Postgres is deleted after 30 days, which is why I recommend Neon. Supabase also works. Any Postgres connection string is fine.)

### 2. API: Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, pick the repo. It reads [render.yaml](render.yaml) and creates the `bec-api` web service (root directory `server`). *(Or create a **Web Service** by hand: Root Directory `server`, Build `npm ci --include=dev && npm run build`, Start `npm start`, Health check `/health`, env `NODE_VERSION=22`.)*
3. When asked, set the three secret values:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon connection string from step 1 |
   | `API_JWT_SECRET` | a long random string, e.g. `openssl rand -base64 32`. **Note it down: Vercel needs the same value.** |
   | `ADMIN_EMAILS` | e.g. `president@iitjammu.ac.in,you@iitjammu.ac.in`. The first one becomes the owner. |

4. Deploy. When it's live, open `https://<your-service>.onrender.com/health`: you should see `{"ok":true}`. Note the service URL.

Tables are created and the starting content is seeded automatically on first start.

### 3. Website: Vercel

1. In Vercel: **Add New → Project**, import the same repo.
2. **Root Directory: `client`** (important). Framework is detected as Next.js.
3. Add these Environment Variables:

   | Variable | Value |
   | --- | --- |
   | `API_URL` | the Render URL, e.g. `https://bec-api.onrender.com` (no trailing slash) |
   | `API_JWT_SECRET` | **exactly** the value you set on Render |
   | `AUTH_SECRET` | another long random string (`openssl rand -base64 32`) |
   | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | your Google OAuth client |
   | `SITE_URL` | your site's public URL, e.g. `https://bec-iitjammu.vercel.app` (update after step 5 if you attach a domain) |

4. Deploy, then note the production URL Vercel gives you.

### 4. Google sign-in

In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), open your OAuth client (type **Web application**) and add this under **Authorised redirect URIs**, then **Save**:

```text
https://<your-vercel-domain>/api/auth/callback/google
```

Keep `http://localhost:3000/api/auth/callback/google` there as well for local development. If you later attach a custom domain, add its callback URL too. If the consent screen is *External/Testing*, add your `@iitjammu.ac.in` addresses as **Test users**.

### 5. Custom domain (optional)

Vercel → Project → **Domains** → add e.g. `bec.iitjammu.ac.in` and create the DNS record Vercel shows (the institute's IT team controls this). Then update `SITE_URL` in Vercel and add the new Google callback URL (step 4), and redeploy.

### Checklist after deploying

- `https://<site>/` loads and shows the team and handbooks (data is coming from the API).
- `https://<site>/admin/login` → *Continue with Google* → lands on the dashboard (use an address from `ADMIN_EMAILS`).
- Submit a test Member application on `/join`, see it in **Admin → Applications**, then delete it.

---

## Environment variables at a glance

**Server (`server/.env` or Render):**

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Empty locally = embedded Postgres. **Required in production.** |
| `API_JWT_SECRET` | Shared secret with the client (≥ 24 chars) |
| `ADMIN_EMAILS` | Allow-listed `@iitjammu.ac.in` accounts; first = owner. Added on every start (it never removes anyone; use *Admin → Admins* for that). |
| `DATABASE_POOL_MAX` | Max DB connections (default 10; use 3–5 on free database tiers) |
| `PORT` | Set by Render |

**Client (`client/.env.local` or Vercel):** `API_URL`, `API_JWT_SECRET`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `SITE_URL` (see [client/.env.example](client/.env.example)).

---

## Using the dashboard

| Section | What you can do |
| --- | --- |
| **Events** | Create, edit, publish/unpublish, delete. Upcoming ones feed the Home "Next up" card and the Initiatives slider; past ones fill the "Previously" archive. View RSVPs per event and download them as CSV. Times are IST. |
| **Applications** | Everything from the public forms: core team, member, mentor, cohort, Idea Dropbox, handbook suggestions. Filter and search, set a status (New → In review → Shortlisted → Accepted/Rejected), add private notes, reply by email, export to CSV. |
| **Team** | People on the Team page (professors, staff, core team, vertical members) with photos, plus the verticals. |
| **Handbooks** | Volumes, descriptions, chapters, PDF upload or links. |
| **Site settings** | Open/close core team and cohort applications and their deadlines, Home stats, vision statement, contact details and social links. |
| **Admins** | (Owner only) add or remove dashboard users. |

Core team and cohort applications are **closed by default**; switch them on under *Site settings* when recruitment opens.
Uploaded images and PDFs are stored in the database and served from `/uploads/...` on your own domain, so they survive redeploys on any host.

---

## Free-tier notes (please read)

- **Render's free API sleeps after ~15 minutes without traffic** and takes 30–60 s to wake. The website retries for you (and shows a "warming up" page if it still can't connect), but the first visitor after a quiet spell will wait. Fixes: (a) use Render's **Starter** plan (about $7/month, always on); or (b) have a free monitor such as [UptimeRobot](https://uptimerobot.com) ping `https://<api>/health` every 5 minutes.
- **Neon's free database also pauses when idle** and resumes within a second or two on the next query.
- Vercel's Hobby plan is for non-commercial use, which suits a student club.
- Rate limiting for public forms is in-memory on the single API instance (fine for one instance; use Redis if you ever scale to several).

## Project layout

```text
client/src/app/(site)/      public pages + form actions
client/src/app/admin/       login + dashboard (all actions relay to the API)
client/src/app/api/         upload proxy, calendar (.ics) endpoint, Auth.js
client/src/lib/api*.ts      signed server-to-server calls to the API (+ typed data helpers)
client/public/              logo, campus photos, team photos
server/src/routes/          public.ts (site data + forms) and admin.ts (dashboard)
server/src/db/              Drizzle schema, connection, first-run seed content
server/src/lib/             validation (zod), settings, uploads, CSV, rate limiting
server/drizzle/             SQL migrations (applied automatically at start-up)
render.yaml                 Render blueprint for the API
```

Change the schema: edit `server/src/db/schema.ts`, run `npm --prefix server run db:generate`, commit the new SQL file in `server/drizzle/`; it is applied on the next start.

## Content to confirm

The first-run content comes from the orientation deck and `Design.html`. Please review these in the dashboard:

- **BEC Orientation Session 2026** is seeded as a past event. The deck has no exact date or venue, so the date is a placeholder: edit it in *Admin → Events*.
- Team names, roles and photos were taken from the deck (first names only where that is all the deck shows). Edit under *Admin → Team*.
- The descriptions of the Strategy, PR, Media, Design and Inventory verticals are short drafts: confirm or reword.
- Handbook descriptions come from the design; add PDFs and chapter lists under *Admin → Handbooks*.
- Home stats ("Students reached", "Partner institutions") and the vision statement are blank until you fill them in *Site settings*; blank items are hidden.

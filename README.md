# LODHI CONNECT · C2 & D1

Premium RWA complaint + community portal for Lodhi Colony C2 and D1 Blocks.

## What is included
- Resident registration/login with name, email, phone, block, house number and password eye toggle.
- Complaint categories with **Lift removed**.
- Automatic complaint number + date/time.
- Resident complaint tracking and timeline.
- Admin queue and assignment using only a free-text staff name + completion remark. No staff accounts/IDs.
- Admin status loop: Submitted → Acknowledged → Assigned → In Progress → Resolved → Closed.
- Public master dashboard with aggregate RWA health; no private resident details.
- Public announcements.
- Admin-uploaded public community gallery with caption/date.
- Supabase Auth, PostgreSQL, RLS and Storage.

## 1. Create Supabase project
Create a project at Supabase. Open **SQL Editor** and run the complete file:
`supabase/schema.sql`

## 2. Get URL + publishable key
Supabase Dashboard → Project → Connect. Copy the Project URL and Publishable key.
Create `.env.local` in this project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`config.js` is included only as a visual reference because Next.js should read these values from `.env.local`. **Never paste a Supabase secret/service-role key into browser code.**

## 3. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:3000

## 4. Create President/Admin
Supabase Dashboard → Authentication → Users → Add user.
Create the President's email + password. Then open SQL Editor and run:

```sql
update public.profiles set role='admin' where email='president@example.com';
```
Use the same email/password on `/login`. The app will route the admin to `/admin`.

## 5. Email confirmation
For easiest local testing, Supabase Authentication → Providers → Email can have email confirmation disabled. For production, keep confirmation enabled and configure your SMTP/email settings.

## 6. Storage
The SQL creates a public `gallery` bucket and RLS policies. Admin can upload gallery images from `/admin`.

## 7. Deploy
Vercel/other Next.js host: add the same two `NEXT_PUBLIC_...` environment variables. Do not deploy `.env.local`.

## Important security model
- Residents can insert and see only their own complaints.
- Admin can see/update all complaints.
- Staff do not have login accounts.
- Public users see only aggregate dashboard counts, published announcements and gallery images.
- Do not expose any Supabase secret/service-role key to the client.

## Main routes
- `/` public home + dashboard + announcements + gallery
- `/register` resident registration
- `/login` resident/admin login
- `/resident` resident dashboard
- `/resident/new` new complaint
- `/resident/complaint/[id]` complaint tracking
- `/admin` RWA admin dashboard
- `/admin/complaint/[id]` admin complaint assignment/update

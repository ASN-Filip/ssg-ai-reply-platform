This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# ssg-ai-reply-platform

Samsung Service Group’s AI reply platform built with Next.js 15 (App Router), Prisma (MongoDB), NextAuth, and React Query.

## Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas) and a `DATABASE_URL` in `.env.local`
- npm (bundled with Node.js)

> The repository includes a working `.env.local` for development. Update the credentials before pushing to any shared environment.

## Quick start

1. Install dependencies:

	```bash
	npm install
	```

2. Push the Prisma schema to your Mongo database:

	```bash
	npx prisma db push
	```

3. Seed the database (creates an admin user + sample categories):

	```bash
	npm run seed
	```

	- Admin credentials: `filip@adsomenoise.com` / `C4lvad0s!`
	- The seed loads a hierarchical set of categories so the admin UI and product flows have data immediately.

4. Start the dev server:

	```bash
	npm run dev
	```

	Visit [http://localhost:3000](http://localhost:3000) and sign in with the seeded admin user.

## Working with categories

- Admins manage categories at `/admin/categories`. The UI now reads directly from Prisma via React Query.
- Seed data creates three top-level categories (Televisions, Audio, Home Appliances) with subcategories. Feel free to run `npm run seed` again after edits—`upsert` logic keeps names unique and updates existing records.
- Public product views (`/products`) consume the same API and will show empty states until at least one category exists.

## Useful scripts

- `npm run dev` – Next.js in development mode (Turbopack)
- `npm run build` – production build
- `npm run lint` – ESLint across the repo
- `npm run test` – Vitest unit tests
- `npm run seed` – Prisma seeding (admin account + categories)

## Authentication notes

- NextAuth is configured with credentials + JWT sessions.
- See `README_AUTH.md` for details on switching strategies or testing sessions.

## Toast system

Toasts moved from a Zustand queue to a provider-based approach.

- `ToastProvider` lives in `src/components/ui/Toast.tsx` and is mounted via `ClientProviders`.
- Use the `useToast()` hook from `@/hooks/useToast` to display notifications.
- Legacy store-based helpers were removed.

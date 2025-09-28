Auth decisions and notes

Why JWT sessions?

- Credentials provider is currently configured to use JWT sessions. JWT sessions are stateless, avoid adapter/session persistence edge cases, and work well when your credentials sign-in flow issues were blocking DB session creation.

How to test locally

1. Start your dev server:

   npm run dev

2. Open your app, sign in with a seeded user using the Credentials form. After a successful sign-in, check the current session:

   curl -i http://localhost:3000/api/auth/session

You should see a JSON object with `user` including `id` and `role`.

How to switch back to DB sessions

If you prefer database-backed sessions (e.g., for OAuth providers or server-side session revocation), do the following:

1. Install and configure a supported adapter (Prisma is common). Ensure `prisma` is set up and `DATABASE_URL` is present in your environment.

2. In `src/lib/auth.ts`, set the adapter and change the session strategy:

   session: { strategy: 'database' },
   adapter: PrismaAdapter(prisma),

3. Ensure that Credentials `authorize()` returns a user object compatible with NextAuth's database session creation and that your adapter's `createSession` is being called. If problems occur (session cookie cleared on sign-in), add temporary logging or inspect adapter methods to confirm session creation.

Notes

- Keep `NEXTAUTH_SECRET` set in production.
- If you want a hybrid approach (DB sessions for OAuth, JWT for Credentials), I can propose and implement that pattern for you.

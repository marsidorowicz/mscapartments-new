# Move to Better Auth — Migration Runbook

> Status: **PAUSED**. Code for `mscapartments` and `mountainapartments` is migrated to Better Auth,
> but **nothing has been pushed to the database yet**. `simplevent` is still on next-auth and untouched.
> This file records what was discovered and the exact plan to finish without losing a single table or row.

---

## 1. Key discoveries

### 1.1 All three apps share ONE database
- `mscapartments/.env`, `mountainapartments/.env`, `simplevent/.env` all point to the same Neon DB.
- Host: `ep-billowing-hill-a20a946e-pooler.eu-central-1.aws.neon.tech`
- Database name: `simplevent`
- Therefore any schema change affects all three apps.

### 1.2 Push policy (current workflow)
- **`prisma db push` is run ONLY from `simplevent`** (the schema superset / source of truth).
- `mscapartments` and `mountainapartments` never push. They only run `prisma generate`
  after adding columns that are already compatible with the DB.
- This is ideal for a zero-loss migration: we only ever **ADD** columns/tables.

### 1.3 Schema relationship
- `simplevent` is the superset. It has 49 models; it additionally has (not present in msc/mountain):
  - `EmailSent`
  - `Review`
  - `BrandSettings.users`, `User.brandSettings`, `User.emailSent` relations
- msc/mountain are subsets (47 models). All their models exist in simplevent as well.
- The three auth models use the **NextAuth shape** in all three apps (before any change):
  - `Account`: `type/provider/providerAccountId/refresh_token/access_token/expires_at/token_type/scope/id_token/session_state`
  - `Session`: `sessionToken/expires`
  - `User`: `emailVerified DateTime?`, `modules String[]` (no default), no `createdAt/updatedAt`
  - `VerificationToken`: composite PK `(identifier, token)`, `expires`
- All three use `session.strategy: "jwt"`, so next-auth does **not** use the `Session` table at runtime.
  The `Account` table IS used by the Prisma adapter (OAuth account links).

### 1.4 Better Auth differences that matter
Better Auth's core schema differs from NextAuth:
| Better Auth | NextAuth | Problem |
|---|---|---|
| `User.emailVerified` **Boolean** | `emailVerified` **DateTime?** | type clash → cannot share column |
| `Session.token` / `expiresAt` | `sessionToken` / `expires` | name change |
| `Account.providerId` / `accountId` | `provider` / `providerAccountId` | name change (values match: `"google"`, `"github"`) |
| `Account.accessToken` / `refreshToken` / `idToken` | `access_token` / `refresh_token` / `id_token` | name change |
| `Account.accessTokenExpiresAt` **DateTime** | `expires_at` **Int (epoch s)** | type clash |
| `Account.refreshTokenExpiresAt`, `password`, `createdAt`, `updatedAt` | — | missing |
| `Session.ipAddress`, `userAgent`, `createdAt`, `updatedAt` | — | missing |
| `Verification` | `VerificationToken` | different table |

### 1.5 The chosen strategy
**Additive-only + alias Better Auth to the existing columns.** Never rename, never drop.
- Keep every existing next-auth column and the `VerificationToken` table.
- Add only the columns Better Auth needs that have no equivalent.
- Point Better Auth at the existing columns using `modelName` + `fields` mapping
  (supported in Better Auth 1.7.5 — see `node_modules/better-auth/dist/db/schema.d.mts:55`).
- Add a **brand-new `Verification` table** so `VerificationToken` (and its rows) is never touched.
- Because the only DB changes are `ADD COLUMN` / `CREATE TABLE`, `prisma db push` from `simplevent`
  is non-destructive and needs no `--accept-data-loss`.

---

## 2. Current state of the repos

### 2.1 `mscapartments` and `mountainapartments` (code already migrated in first pass)
Changed/added files (both repos identical):
- `package.json` / `package-lock.json`: removed `next-auth` + `@auth/prisma-adapter`, added `better-auth@^1.7.5`
- `auth.ts` and `auth.config.ts`: **deleted**
- `app/api/auth/[...nextauth]/route.ts`: **deleted**
- `app/components/SessionProvider.tsx`: **deleted** (and removed from `app/layout.tsx`)
- `lib/auth.ts`: **added** (Better Auth server config — currently uses NO field aliases)
- `lib/auth-client.ts`: **added**
- `app/api/auth/[...all]/route.ts`: **added**
- Client components updated to `authClient.*`:
  - `app/[lang]/login/LoginPageClient.tsx`
  - `app/[lang]/components/AuthButton.tsx`
  - `app/[lang]/dashboard/DashboardClient.tsx`
- `prisma/schema.prisma`: currently rewritten to the **NATIVE Better Auth schema** (Account/Session replaced,
  `User.emailVerified` changed to Boolean, `VerificationToken` renamed to `Verification`).

> ⚠️ IMPORTANT: the native schema currently in msc/mountain is **destructive if ever pushed**.
> Before finishing, it must be converted to the additive/aliased schema in section 4.
> Since these repos only run `prisma generate`, no damage has occurred.

### 2.2 `simplevent`
- Completely untouched. Still next-auth (`auth.ts`, `auth.config.ts`, `@auth/prisma-adapter`).
- Its `prisma/schema.prisma` is the DB source of truth.

### 2.3 Nothing pushed
No `prisma db push` has been run anywhere. The live DB is still 100% next-auth shape.

---

## 3. Step-by-step plan (to run later)

### Step 1 — Extend `simplevent/prisma/schema.prisma` (additive only)

Keep all existing fields. **Add** the following.

`User` (keep `emailVerified DateTime?`; add):
```prisma
  emailVerifiedBool Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
```
Also give `modules` a default so Better Auth's create (which does not set it) does not violate NOT NULL:
```prisma
  modules String[] @default([])
```

`Account` (keep all existing fields; add):
```prisma
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
```

`Session` (keep `sessionToken`/`expires`; add):
```prisma
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
```

Add a new table (leave `VerificationToken` exactly as-is):
```prisma
model Verification {
  id         String    @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}
```

### Step 2 — Push from `simplevent` ONLY
```bash
cd simplevent
npx prisma validate
npx prisma db push      # expect: only ADD COLUMN + CREATE TABLE "Verification"
npx prisma generate
```
Do **not** run `db push` from mscapartments or mountainapartments.

### Step 3 — Backfill the new columns (one-time SQL)
Run once against the shared DB (psql / Neon SQL editor):
```sql
-- boolean mirror of the old verification timestamp
UPDATE "User"
SET "emailVerifiedBool" = ("emailVerified" IS NOT NULL)
WHERE "emailVerifiedBool" = false;

-- convert epoch seconds -> timestamp
UPDATE "Account"
SET "accessTokenExpiresAt" = to_timestamp("expires_at")
WHERE "expires_at" IS NOT NULL
  AND "accessTokenExpiresAt" IS NULL;
```
`Session.sessionToken/expires` and `Account.provider/providerAccountId` need **no** copy — they are aliased in place.
Optional (only if you want to consolidate): copy `VerificationToken` rows into `Verification`; not required for zero loss.

### Step 4 — Better Auth config with aliases (all 3 apps)
Use this shape in every app's `lib/auth.ts` (msc/mountain already have this file; simplevent will need one):
```ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { createAuthMiddleware } from "better-auth/api"
import prisma from "@/prisma/prisma"

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
	database: prismaAdapter(prisma, { provider: "postgresql" }),

	// ---- map Better Auth onto the existing next-auth columns ----
	user: {
		modelName: "User",
		fields: { emailVerified: "emailVerifiedBool" },
	},
	session: {
		modelName: "Session",
		fields: { token: "sessionToken", expiresAt: "expires" },
		expiresIn: 60 * 60, // 1 hour (matches old maxAge)
	},
	account: {
		modelName: "Account",
		fields: {
			providerId: "provider",
			accountId: "providerAccountId",
			accessToken: "access_token",
			refreshToken: "refresh_token",
			idToken: "id_token",
			scope: "scope",
		},
		accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
	},
	verification: { modelName: "Verification" },

	socialProviders: {
		github: {
			clientId: process.env.GITHUB_ID ?? "",
			clientSecret: process.env.GITHUB_SECRET ?? "",
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		},
	},

	// activity logging (same behaviour as the old next-auth events)
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			const newSession = ctx.context.newSession
			if (!newSession) return
			const provider = ctx.path.startsWith("/callback/") ? ctx.path.split("/")[2] : undefined
			try {
				await prisma.userActivity.create({
					data: {
						userId: newSession.user.id,
						activity: "User logged in",
						metadata: { provider: provider ?? null },
					},
				})
			} catch (error) {
				console.error("Error logging user activity:", error)
			}
		}),
	},
	databaseHooks: {
		session: {
			delete: {
				after: async (session) => {
					try {
						await prisma.userActivity.create({
							data: { userId: session.userId, activity: "User logged out", metadata: {} },
						})
					} catch (error) {
						console.error("Error signing out user activity:", error)
					}
				},
			},
		},
	},
	debug: false,
})
```

Client instance (`lib/auth-client.ts`):
```ts
import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient()
```

Route handler (`app/api/auth/[...all]/route.ts`):
```ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
export const { GET, POST } = toNextJsHandler(auth)
```

### Step 5 — Reconcile `mscapartments` / `mountainapartments/prisma/schema.prisma`
Replace the current **native** Better Auth models with the additive versions (section 1.3 shape + new columns),
so they match the DB that simplevent pushed. They may stay subsets (no `EmailSent`/`Review`).
Then only:
```bash
npx prisma generate
```
No push.

### Step 6 — Verify
```bash
# each repo
npx prisma validate
npx prisma generate
npx next typegen        # clears stale .next route types
npx tsc --noEmit
```
Manual checks:
- Sign in with Google and GitHub → user row reused (same `User.id`), new `Account` row has
  `provider="google"` / `providerAccountId=<sub>` and `accessTokenExpiresAt` populated.
- Existing account links still work (no forced re-login/re-link).
- `UserActivity` gets "User logged in" / "User logged out" rows.
- Dashboard reads the session (email/name/image).
- `VerificationToken` table and its rows still exist; `Verification` table created.

---

## 4. Environment variables
Set in all 3 apps (env is managed manually by the owner):
```dotenv
BETTER_AUTH_SECRET=<32+ char random string>   # openssl rand -base64 32
BETTER_AUTH_URL=https://<app-domain>          # e.g. https://mscapartments.pl
```
`AUTH_SECRET` is kept as a fallback in the config, so sites keep working until rotated.
`GOOGLE_CLIENT_ID/SECRET` and `GITHUB_ID/SECRET` are unchanged.
OAuth callback path is the same as next-auth (`/api/auth/callback/google|github`), so redirect URIs stay valid.

---

## 5. Rollback
Because the DB changes are purely additive, rollback is safe at any point:
- Revert the app code/deps to next-auth (old `Account`/`Session`/`VerificationToken` columns are untouched).
- Optionally ignore the new columns/tables; they are unused by next-auth.
No data migration back is needed.

---

## 6. Caveats / notes
- `verification` is unused by OAuth-only flows, but Better Auth expects the model, hence the new `Verification` table.
- `mscapartments` schema (first pass) also renamed `VerificationToken` → `Verification` and changed
  `emailVerified` to Boolean — this MUST be reverted to the additive shape before any generate/push.
- Never run `prisma db push` from msc/mountain.
- Keep old columns indefinitely; dropping them later is optional and should only happen after all 3 apps are stable.
- Current `lib/auth.ts` in msc/mountain has **no aliases** and must be updated to the section 1.4 version.
- `lib/types/auth.tsx` (custom `Session`/`User` types) is unused legacy; can be removed later.
- ESLint (`npm run lint`) is broken in msc/mountain for an unrelated flat-config circularity error; use `tsc` for checks.

---

## 7. TODO checklist
- [ ] Extend `simplevent/prisma/schema.prisma` (additive: User/Account/Session columns + `Verification` table + `modules` default)
- [ ] `cd simplevent && npx prisma db push` (only place)
- [ ] Run backfill SQL (Step 3)
- [ ] Update `lib/auth.ts` aliases in msc + mountain (msc/mountain already have a `lib/auth.ts` to edit)
- [ ] Add better-auth setup to `simplevent` (deps, `lib/auth.ts`, `lib/auth-client.ts`, route handler, client components)
- [ ] Reconcile msc + mountain `prisma/schema.prisma` to additive shape, then only `prisma generate`
- [ ] Add `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` to all 3 envs
- [ ] Verify logins, account-link preservation, activity logs, dashboard

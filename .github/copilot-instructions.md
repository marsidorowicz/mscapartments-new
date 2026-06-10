<!-- @format -->

# Copilot Instructions for `mountainapartments`

## Essential Knowledge

**Property Rental Platform**: Multi-tenant booking system for mountain accommodations (Zakopane, Poland) with Properties, Events (bookings), Users, complex pricing, and external API integrations.

**Tech Stack**: Next.js 16 (App Router), TypeScript, React 19, PostgreSQL + Prisma (40+ models), NextAuth.js, Redux (legacy switch reducers), Tailwind CSS + MUI, i18n (4 languages).

## Critical Workflows

- **Build**: Always run `prisma generate` before `next build` (build script handles this); dev uses `next dev --turbopack`
- **Database**: Use `npx prisma db push` for schema changes, `npx prisma studio` for inspection
- **Auth**: NextAuth with database sessions (30-day max), 5 user roles (OWNER > ADMIN > MANAGER > CLEANER > CALENDAR)
- **Payments**: Fiserv HPP integration with orderId tracking, status flow: PENDING → COMPLETED/FAILED

## Key Patterns & Conventions

**i18n**: Custom dictionary system in `app/dictionaries/`, fetch via `getDictionary(lang)`, Polish pluralization needs special handling (1/2-4/5+ forms).

**State Management**: Redux with switch-statement reducers, heavy localStorage usage with cross-tab sync events, complex filter persistence.

**API Design**: Zod validation, Prisma queries with explicit relations, JSON responses with `{success: boolean}`, proper error handling.

**Pricing System**: Person-based adjustments (`basePrice * (1 ± percent/100)`), fewer guests = discount, more guests = surcharge.

**Data Flow**: Properties → Availabilities → Events → Payments (core booking chain), dual availability sources (Prisma + Nobeds API).

## Integration Points

- **Nobeds API**: External availability data with room_id mapping
- **Fiserv**: Payment processing with extensive field mapping
- **TTLock**: Smart lock integration with password generation
- **Telegram**: Property-level chat IDs for booking notifications
- **Email**: Nodemailer for confirmations
- **Offer Links**: Public offer validation via `/api/public/offer/[offerId]`, homepage auto-opens booking modal with pre-filled data

## Offer Link Handling

**URL Structure**: `mountainapartments.pl/en/homepage?fromOffer=true&offer=OFFER_123&startDate=01/12/2025&endDate=03/12/2025&guests=2`

**Flow**:

1. Homepage detects `fromOffer=true` and `offer` param
2. Fetches offer data from `/api/public/offer/[offerId]` (public endpoint, no auth)
3. Opens ReservationEngine modal with pre-filled dates/guests
4. Prioritizes offer properties first in search results
5. Auto-triggers availability search after 1-second delay

**Validation**: Offer must exist, not expired, not already used; returns 404/410/409 for invalid offers

## Essential Files

- `prisma/schema.prisma`: 40+ models with complex relationships
- `app/dictionaries/`: i18n translations (pl/en/de/es)
- `utilities/functions/pricing/personBasedPricing.ts`: Core pricing logic
- `app/[lang]/components/re/ReservationEngine.tsx`: Main booking component
- `app/[lang]/homepage/HomepagePageClient.tsx`: Homepage with offer link handling
- `state/reducers/rootReducer.tsx`: Redux state management
- `app/api/public/offer/[offerId]/route.ts`: Public offer data endpoint (no auth required)

## Agent Rules

- Always check files after edits for type/syntax errors, fix immediately
- Do not use shell commands unless explicitly requested by the user
- Use `sudo npx eslint` for linting checks
- Omit `[lang]` prefix when searching files (e.g., `ReservationEngine.tsx`)
- Note: using `[lang]` folder segments in paths may cause grep/search to return 0 results, so search without the literal `[lang]` marker.
- Each component should use its own internal dictionary object for all languages instead of relying on a shared global dictionary lookup.
- All displayed text must be translated in all supported languages (pl, en, de, es) whenever a component adds or changes user-facing copy.
- When adding new keys to dictionary files, update all language files (pl.ts, en.ts, de.ts, es.ts) and the corresponding type definition in `app/types/dictionary.ts`
- Never modify Prisma query structures without user approval
- Check existing payments before creation to prevent duplicates
- Offer links require public API access without authentication - use `/api/public/offer/[offerId]` for offer data

<!-- @format -->

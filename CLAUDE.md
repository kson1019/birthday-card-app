# CLAUDE.md

This file provides guidance for Claude Code when working with the Birthday Card App.

## Project Summary

Digital birthday invitation platform for kids' parties. Parents create cards, send invitations via email, and track RSVPs. No authentication — recipients identified by UUID tokens.

## Project Context
See PRD.md in the project root for the full product spec, schema, API routes, and implementation gotchas.

## Quick Start

```bash
npm install
npx drizzle-kit migrate
npm run dev
```

App runs at http://localhost:3000

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Fonts | Baloo 2 (headings) + Nunito (body) |
| Database | Turso (prod) / SQLite (dev) + Drizzle ORM |
| Image Storage | Vercel Blob |
| Email | Resend + React Email |
| Animations | CSS 3D + canvas-confetti |

## Project Structure

```
src/
├── app/                    # Pages and API routes
│   ├── api/               # API endpoints
│   ├── card/[id]/         # Card display page
│   └── dashboard/         # Dashboard page
├── components/            # React components
│   ├── card/             # Card display (FlipCard, CardFront, CardBack, Confetti)
│   ├── forms/            # Form components (CardCreatorForm, RsvpForm, etc.)
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── db/               # Database (index.ts = connection, schema.ts = tables)
│   ├── email/            # Resend client + email templates
│   ├── utils.ts          # Client-safe utilities
│   └── server-utils.ts   # Server-only utilities (crypto, etc.)
└── types/index.ts        # TypeScript type definitions
```

## Key Architecture Decisions

1. **No Authentication**: Single-user app. Recipients use UUID tokens in URLs.
2. **Server Components First**: Only use `"use client"` when interactivity is needed.
3. **Dual Database**: Turso (cloud libSQL) in production, SQLite (local) in development. All queries async.
4. **Cloud Image Storage**: Vercel Blob for production. Images get public HTTPS URLs for email compatibility.

## Database Commands

```bash
# Generate migration after schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

### Drizzle ORM — Async Queries (IMPORTANT)

Turso uses an async driver. All queries must use `await`:

```typescript
// WRONG - missing await
const rows = db.insert(cards).values(data).returning().all();

// CORRECT - async/await
const rows = await db.insert(cards).values(data).returning();
const row = rows[0];
```

Local SQLite (`better-sqlite3`) is sync, but the code uses async everywhere for compatibility.

## Code Conventions

### Server vs Client Components

Default to server components. Add `"use client"` only for:
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs (canvas, localStorage)

### File Naming

- Components: PascalCase (`CardFront.tsx`)
- Utilities: camelCase (`utils.ts`)
- API routes: `route.ts` in feature folders

### Client/Server Separation

- `lib/utils.ts` — Client-safe, no Node.js imports
- `lib/server-utils.ts` — Server-only, has Node.js imports

Never import `server-utils.ts` into client components.

### API Response Format

```typescript
// Success
return Response.json({ data: result });

// Error
return Response.json({ error: "Message" }, { status: 400 });
```

## Email Templates

Located in `src/lib/email/templates/`. Requirements:
- Use `@react-email/components` only
- All styles inline (no external CSS)
- Images need absolute URLs: `${process.env.NEXT_PUBLIC_BASE_URL}${imagePath}`

## Environment Variables

Required in `.env.local`:
```
RESEND_API_KEY=re_...
BLOB_READ_WRITE_TOKEN=vercel_blob_...
TURSO_DATABASE_URL=libsql://...  # Optional: uses local SQLite if not set
TURSO_AUTH_TOKEN=...             # Optional: uses local SQLite if not set
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Common Tasks

### Add API Endpoint

1. Create `src/app/api/[name]/route.ts`
2. Export: `GET`, `POST`, `PUT`, or `DELETE` async functions
3. Return `Response.json({ data })` or `Response.json({ error }, { status })`

### Add Database Table

1. Add table to `src/lib/db/schema.ts`
2. Run `npx drizzle-kit generate && npx drizzle-kit migrate`
3. Add type to `src/types/index.ts`

### Add Component

1. Create in `src/components/[feature]/ComponentName.tsx`
2. Add `"use client"` only if interactive
3. Export as named export

## Testing the App

1. Create a card at `/`
2. View card at `/card/[id]?token=[token]` (token from API response or email)
3. Submit RSVP on the card page
4. View dashboard at `/dashboard`

## Constraints

- No authentication (by design)
- Images stored in Vercel Blob (cloud, public URLs)
- Email sending uses sequential delays to respect Resend's 2 emails/second rate limit
- Email requires verified Resend domain for non-test recipients
- Cards are immutable after creation

## Recent Major Changes (March 2026)

- **Fonts**: Baloo 2 (headings) + Nunito (body) for playful kid-friendly design
- **Buttons**: All now `rounded-full` (pill-shaped)
- **Recipient names**: Added name field (primary) with email as secondary
- **Image hosting**: Migrated to Vercel Blob from local filesystem
- **Email rate limiting**: Sequential sending with 600ms delays (fixes "Too many requests")
- **Database**: Dual support for Turso (production) and SQLite (local dev)
- **Calendar duration**: Added hours+minutes input for accurate event end times
- **Mobile UX**: Smaller floating emojis (50% size), better spacing, 5-second fade-out

## Reference Files

- `masterplan.md` — Full project documentation
- `tasks.md` — Granular implementation tasks
- `progress.md` — Build log and technical notes

# CLAUDE.md

This file provides guidance for Claude Code when working with the Birthday Card App.

## Project Summary

Digital birthday invitation platform for kids' parties. Parents create cards, send invitations via email, and track RSVPs. No authentication — recipients identified by UUID tokens.

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
| Database | SQLite + better-sqlite3 + Drizzle ORM |
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
3. **SQLite Database**: File-based, uses WAL mode. Schema in Drizzle ORM.
4. **Local Image Storage**: Images in `public/uploads/`. Store relative paths in DB.

## Database Commands

```bash
# Generate migration after schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

### Drizzle ORM Quirk (IMPORTANT)

The SQLite sync driver requires `.all()` to execute queries with `.returning()`:

```typescript
// WRONG - returns query builder, not data
const [row] = db.insert(cards).values(data).returning();

// CORRECT
const rows = db.insert(cards).values(data).returning().all();
const row = rows[0];
```

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
- Images stored locally in `public/uploads/`
- Email sending requires verified Resend domain for non-test recipients
- Cards are immutable after creation

## Reference Files

- `masterplan.md` — Full project documentation
- `tasks.md` — Granular implementation tasks
- `progress.md` — Build log and technical notes

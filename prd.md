# Birthday Card App — PRD

> **Purpose**: Context document for AI-assisted development in Cursor. Include this file in every prompt for implementation continuity.

---

## Project Summary

An all-in-one digital birthday invitation platform for kids' parties. Parents create animated invitations, send via email, and track RSVPs — no account required.

**Status**: MVP complete. Phases 1 and 2 shipped. Phase 3 (Reminder System) deferred to post-MVP. Phases 4 and 5 are post-MVP.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | TypeScript, React 19 |
| Styling | Tailwind CSS v4 | Some inline styles required for 3D transforms |
| Database | SQLite + better-sqlite3 + Drizzle ORM | WAL mode, FK enabled |
| Email | Resend + React Email | Inline styles required for email clients |
| Animations | CSS 3D transforms + canvas-confetti + CSS float-up keyframes | Pure CSS flip, floating emojis |
| Sound | Web Audio API | Synthesized sounds (pop, chime, decline) — no audio files |
| AI (planned) | OpenAI | Phase 5 feature |

---

## Architecture Principles

1. **No authentication** — Single-user app. Recipients identified by UUID tokens in URLs.
2. **Server Components by default** — Client components (`"use client"`) only for interactivity: `FlipCard`, `Confetti`, `CardCreatorForm`, `RsvpForm`, `FloatingElements`, `CalendarButton`.
3. **SQLite for simplicity** — File-based, zero config. Drizzle ORM enables future Postgres migration by swapping the driver.
4. **File-based image storage** — `public/uploads/`. Migration path: S3, R2, or Vercel Blob for serverless.

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout, metadata
│   ├── page.tsx                    # Home / card creator
│   ├── globals.css                 # Tailwind + animation keyframes (float-up, fade-in)
│   ├── dashboard/page.tsx          # Dashboard page
│   ├── card/[id]/page.tsx          # Card display + RSVP page
│   └── api/
│       ├── cards/route.ts          # POST (create) + GET (list all)
│       ├── cards/[id]/route.ts     # GET single card with recipients
│       ├── rsvp/route.ts           # POST RSVP response
│       ├── send/route.ts           # POST send emails via Resend
│       └── upload/route.ts         # POST image upload
├── components/
│   ├── card/
│   │   ├── FlipCard.tsx            # 3D CSS flip container (client)
│   │   ├── CardFront.tsx           # Front face: image + headline
│   │   ├── CardBack.tsx            # Back face: details + message
│   │   ├── Confetti.tsx            # canvas-confetti burst (client)
│   │   ├── FloatingElements.tsx    # Animated floating emojis (client)
│   │   └── CalendarButton.tsx      # Calendar dropdown (Google, Apple, Outlook)
│   ├── forms/
│   │   ├── CardCreatorForm.tsx     # Full creation form with preview toggle
│   │   ├── ImageUploader.tsx       # Drag-and-drop upload
│   │   ├── RecipientInput.tsx      # Name + email input form with Add button
│   │   └── RsvpForm.tsx            # Yes/No RSVP form (client)
│   └── dashboard/
│       ├── CardList.tsx            # Grid of cards
│       ├── CardSummaryCard.tsx     # Thumbnail + stats
│       └── RecipientList.tsx       # Expandable recipient list
├── lib/
│   ├── db/
│   │   ├── index.ts                # SQLite connection setup
│   │   └── schema.ts              # Drizzle schema definitions
│   ├── email/
│   │   ├── resend.ts              # Resend client singleton
│   │   └── templates/
│   │       └── InvitationEmail.tsx # React Email template
│   ├── constants.ts               # RSVP messages, helper functions
│   ├── sounds.ts                  # Web Audio API sound effects
│   ├── themes.ts                  # Floating element theme definitions
│   ├── utils.ts                   # Client-safe utilities (calendar helpers)
│   └── server-utils.ts           # Server-only utilities (crypto)
└── types/
    ├── index.ts                   # Shared TS types
    └── canvas-confetti.d.ts       # Type declarations
```

---

## Database Schema

### `cards`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| image_path | TEXT | Relative path: `/uploads/abc.jpg` |
| headline | TEXT | Front of card text |
| title | TEXT | Party title (back of card) |
| hosted_by | TEXT | Host name (optional) |
| location | TEXT | Party location |
| datetime | TEXT | ISO 8601 string |
| message | TEXT | Personal message |
| theme | TEXT | Card theme (default: "default") |
| enable_emojis | INTEGER | 1 = show floating emojis, 0 = hide |
| enable_sound | INTEGER | 1 = play sounds, 0 = mute |
| created_at | TEXT | Auto-set `datetime('now')` |

### `recipients`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| card_id | INTEGER FK | → `cards.id` (cascade delete) |
| email | TEXT | Recipient email |
| name | TEXT | Display name (optional) |
| token | TEXT UNIQUE | UUID v4 for RSVP link |
| status | TEXT | `pending` / `accepted` / `declined` |
| response_message | TEXT | Optional RSVP message |
| responded_at | TEXT | ISO 8601 timestamp |

**Indexes**: `idx_recipients_card_id`, `idx_recipients_token`

### Planned Tables *(Post-MVP)*

**`themes`** (Phase 5): `id`, `name`, `prompt_template`, `color_scheme` (JSON), `default_elements` (JSON)

**`photos`** (Phase 4): `id`, `card_id` (FK), `uploaded_by`, `file_path`, `caption`, `uploaded_at`

---

## API Routes

### Implemented
| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/upload` | Image upload (JPEG/PNG/WebP/GIF, max 5MB) → `public/uploads/` |
| POST | `/api/cards` | Create card + recipients transactionally (includes emoji/sound toggles) |
| GET | `/api/cards` | List all cards with RSVP counts |
| GET | `/api/cards/[id]` | Single card + recipients, identify current recipient by token |
| POST | `/api/rsvp` | Submit/update RSVP by token |
| POST | `/api/send` | Send invitation emails via Resend |

### Post-MVP (Planned)
| Method | Route | Phase | Purpose |
|--------|-------|-------|---------|
| POST | `/api/ai/generate` | 5 | Generate card content from theme/prompt |
| GET | `/api/ai/themes` | 5 | List AI themes |
| POST | `/api/photos` | 4 | Upload photos to card album |
| GET | `/api/photos/[cardId]` | 4 | Get all photos for a card |
| DELETE | `/api/photos/[id]` | 4 | Remove a photo |

---

## Implementation Gotchas

These are critical patterns to follow — deviating from them will cause bugs:

1. **Drizzle `.returning()` on SQLite** returns a query builder, NOT an array. You must call `.all()`:
   ```ts
   // ✅ Correct
   const rows = db.insert(table).values(data).returning().all();
   // ❌ Wrong — TypeError
   const [row] = db.insert(table).values(data).returning();
   ```

2. **3D flip animation** uses inline styles because Tailwind v4 doesn't support `transform-style: preserve-3d`. Don't try to convert these to Tailwind classes.

3. **Client/server boundary** — `utils.ts` is client-safe (no Node imports). `server-utils.ts` imports `crypto` and must only be used in API routes/server components.

4. **Email images** require absolute URLs. Always prepend `NEXT_PUBLIC_BASE_URL` to `image_path`.

5. **Resend test mode** — Default `from` address (`onboarding@resend.dev`) only delivers to your verified email. Must verify a domain for real recipients.

6. **Browser autoplay policy** — Web Audio API sounds require user interaction before playing. Button clicks (flip, RSVP) work fine. Auto-playing sound on page load is blocked by browsers and was intentionally removed.

7. **Floating emojis positioning** — Elements start at `top: 100%` and animate to `translateY(calc(-100vh - 80px))`. Container must be `position: fixed` with no `overflow-hidden` for full-page traversal.

---

## Environment Variables

```env
# .env.local
RESEND_API_KEY=re_...          # Required — from resend.com dashboard
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Required — used for email links + images
OPENAI_API_KEY=sk-...          # Phase 5 only
```

---

## Feature Roadmap

### Phase 1: RSVP Enhancements ✅
- [x] Random fun confirmation messages on RSVP submit
- [x] Add-to-Calendar dropdown (Google, Apple, Outlook, Outlook.com) with pre-populated title, date/time, location, and message from the invitation
- [ ] "Remind me later" button with date picker (moved to Phase 3)
- [ ] Email reminder system (moved to Phase 3)

### Phase 2: Floating Animations & Sound ✅
- [x] Floating emoji elements (mix of all themes: balloons, confetti, stars, hearts, unicorns)
- [x] CSS-only animations, performance-optimized
- [x] `prefers-reduced-motion` support
- [x] Sound effects on interactions (pop, chime, decline tones via Web Audio API)
- [x] Per-card toggles for emojis and sounds

### Phase 3: Reminder System *(Post-MVP)*
- [ ] "Remind me later" picker (1h / 1d / 1w / Custom presets)
- [ ] Email reminder system (cron job + `/api/reminders`)

---

## Post-MVP Roadmap

The following phases are intentionally deferred to ship the MVP sooner.

### Phase 4: Photo Albums *(Post-MVP)*
- [ ] Guest photo uploads post-party
- [ ] Photo gallery page per card (`/card/[id]/album`)
- [ ] Host moderation (delete photos)
- [ ] Optional captions

### Phase 5: AI Smart Templates *(Post-MVP)*
- [ ] Theme selection (Dinosaur, Princess, Superhero, etc.)
- [ ] AI-generated headline + message suggestions
- [ ] Auto color scheme from theme
- [ ] AI image generation (optional)

---

## Known Limitations

| Issue | Impact | Future Fix |
|-------|--------|------------|
| No auth | Anyone with URL can view card | Optional PIN/password |
| Local image storage | Breaks on Vercel/serverless | Cloud storage (S3/R2/Vercel Blob) |
| No send tracking | Can accidentally re-send emails | Track send status per recipient |
| Cards immutable | No editing after creation | Edit endpoint with versioning |
| English only | — | i18n support |
| No auto-play sound on page load | Browser policy blocks it | Sounds play on user interactions only |

---

## Running Locally

```bash
npm install
npx drizzle-kit migrate    # First time only
npm run dev                # → http://localhost:3000
```

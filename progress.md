# Birthday Card App — Progress Log

## Status: Phase 2 Complete ✅

App is fully built and running on `http://localhost:3000`. Phases 1 and 2 are complete.

---

## What Was Built

### Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: SQLite via `better-sqlite3` + Drizzle ORM
- **Email**: Resend (`@react-email/components` for templates)
- **Animations**: CSS 3D transforms (flip card) + `canvas-confetti` + CSS `float-up` keyframes (floating emojis)
- **Sound**: Web Audio API (synthesized pop, chime, decline sounds)
- **Auth**: None (single-user, token-based recipient identification)

---

## Pages

| Route | Description |
|---|---|
| `/` | Card creator form — upload image, fill details, toggle emojis/sounds, preview, send |
| `/card/[id]?token=[token]` | Recipient-facing card with flip animation, confetti, floating emojis, and RSVP form |
| `/dashboard` | Creator dashboard — lists all cards with RSVP stats and expandable recipient details |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload image (JPEG/PNG/WebP/GIF, max 5MB) → saved to `public/uploads/` |
| `POST` | `/api/cards` | Create card + recipients (transactional), includes emoji/sound toggles |
| `GET` | `/api/cards` | List all cards with aggregated RSVP counts |
| `GET` | `/api/cards/[id]` | Get single card with all recipients + current recipient by token |
| `POST` | `/api/rsvp` | Submit or update RSVP response by token |
| `POST` | `/api/send` | Send invitation emails via Resend to all recipients |

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                      # Root layout, metadata
│   ├── page.tsx                        # Home / card creator
│   ├── globals.css                     # Tailwind + float-up/fade-in animation keyframes
│   ├── dashboard/page.tsx              # Dashboard page
│   ├── card/[id]/page.tsx              # Card display + RSVP page
│   └── api/
│       ├── cards/route.ts              # POST + GET /api/cards
│       ├── cards/[id]/route.ts         # GET /api/cards/[id]
│       ├── rsvp/route.ts               # POST /api/rsvp
│       ├── send/route.ts               # POST /api/send
│       └── upload/route.ts             # POST /api/upload
├── components/
│   ├── card/
│   │   ├── FlipCard.tsx                # 3D CSS flip container (click to flip)
│   │   ├── CardFront.tsx               # Front face: image + headline + sparkles
│   │   ├── CardBack.tsx                # Back face: title, location, datetime, message
│   │   ├── Confetti.tsx                # canvas-confetti burst on card load
│   │   ├── FloatingElements.tsx        # Animated floating emojis (all themes mixed)
│   │   └── CalendarButton.tsx          # Calendar dropdown (Google, Apple, Outlook)
│   ├── forms/
│   │   ├── CardCreatorForm.tsx         # Full card creation form with emoji/sound toggles
│   │   ├── ImageUploader.tsx           # Drag-and-drop image upload with preview
│   │   ├── RecipientInput.tsx          # Tag-style multi-email input
│   │   └── RsvpForm.tsx                # Yes/No RSVP form with random messages + calendar
│   └── dashboard/
│       ├── CardList.tsx                # Fetches + renders grid of cards
│       ├── CardSummaryCard.tsx         # Card thumbnail + stats + expand button
│       └── RecipientList.tsx           # Expandable list of recipients with status
├── lib/
│   ├── db/
│   │   ├── index.ts                    # SQLite connection (WAL mode, FK enabled)
│   │   └── schema.ts                   # Drizzle schema: cards + recipients tables
│   ├── email/
│   │   ├── resend.ts                   # Resend client singleton
│   │   └── templates/
│   │       └── InvitationEmail.tsx     # React Email template with inline styles
│   ├── constants.ts                    # RSVP messages (accepted/declined arrays)
│   ├── sounds.ts                       # Web Audio API sound effects (pop, chime, etc.)
│   ├── themes.ts                       # Floating element theme definitions
│   ├── utils.ts                        # Client-safe utils: formatDateTime, calendar helpers
│   └── server-utils.ts                 # Server-only utils: generateToken, getBaseUrl
└── types/
    ├── index.ts                        # Shared TS types: Card, Recipient, etc.
    └── canvas-confetti.d.ts            # Type declaration for canvas-confetti
```

---

## Database Schema

### `cards`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `image_path` | TEXT | Relative path, e.g. `/uploads/abc.jpg` |
| `headline` | TEXT | Front of card text |
| `title` | TEXT | Party title (back of card) |
| `hosted_by` | TEXT | Host name (optional) |
| `location` | TEXT | Party location |
| `datetime` | TEXT | ISO 8601 string |
| `message` | TEXT | Brief message |
| `theme` | TEXT | Card theme (default: "default") |
| `enable_emojis` | INTEGER | 1 = show floating emojis, 0 = hide |
| `enable_sound` | INTEGER | 1 = enable sound effects, 0 = mute |
| `created_at` | TEXT | Auto-set to `datetime('now')` |

### `recipients`
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `card_id` | INTEGER FK | References `cards.id` (cascade delete) |
| `email` | TEXT | Recipient email address |
| `name` | TEXT | Optional display name |
| `token` | TEXT UNIQUE | UUID v4 — used in RSVP link |
| `status` | TEXT | `pending` / `accepted` / `declined` |
| `response_message` | TEXT | Optional message left by recipient |
| `responded_at` | TEXT | ISO 8601 timestamp of response |

Migration files in `drizzle/` directory. Run `npx drizzle-kit migrate` to apply.

---

## Completed Features

### Phase 1: RSVP Enhancements ✅
- **Random RSVP messages**: 10+ fun messages randomly displayed on Yes/No response (bounce + fade-in animations)
- **Add to Calendar**: Dropdown with Google Calendar, Apple Calendar, Outlook (.ics), and Outlook.com options. Shows only after accepting RSVP. All calendar options are pre-populated with the party title, date/time, location, and personal message from the invitation — recipients don't need to fill anything in manually.
- **Calendar helpers**: `generateIcsFile()`, `generateGoogleCalendarUrl()`, `generateOutlookWebUrl()` in `utils.ts`

### Phase 2: Floating Animations & Sound ✅
- **Floating emojis**: 20 randomly positioned elements from all themes (balloons, stars, hearts, confetti, unicorns) — sized 2.4–4.0rem, full-page float-up animation
- **CSS animations**: `float-up` keyframes with randomized delay, duration, drift, and spin. `prefers-reduced-motion` support.
- **Sound effects**: Web Audio API synthesized sounds — pop on button click, ascending chime on accept, descending tone on decline, flip sound on card flip
- **Per-card toggles**: "Floating Emojis" and "Sound Effects" toggles in card creation form, stored in DB
- **Conditional rendering**: FloatingElements and Confetti render based on per-card settings

---

## Key Technical Notes

### Flip Card Animation
Pure CSS 3D using inline styles (required for `transform-style: preserve-3d` which Tailwind v4 doesn't support natively):
- Outer container: `perspective: 1000px`
- Inner wrapper: `transform-style: preserve-3d`, `transition: transform 700ms`
- Both faces: `backface-visibility: hidden`
- Back face: pre-rotated with `transform: rotateY(180deg)`
- Triggered by click/tap (works on mobile)

### Floating Elements
- Fixed position container with `pointer-events: none` and `z-[1]`
- Elements start at `top: 100%` and animate via `translateY(calc(-100vh - 80px))`
- CSS custom properties for per-element drift and spin randomization
- `prefers-reduced-motion` hides elements entirely

### Sound Effects (Web Audio API)
- All sounds synthesized programmatically — no audio files
- `ensureAudioContext()` resumes AudioContext on user interaction (browser autoplay policy)
- Button clicks serve as user gestures, enabling subsequent sounds
- Auto-play sound on page load was removed because browsers block it

### Drizzle ORM (SQLite sync driver) — Important Quirk
`.returning()` returns a query builder object, NOT an array. Must call `.all()` to execute:
```ts
// Wrong — TypeScript error
const [row] = db.insert(table).values(data).returning();

// Correct
const rows = db.insert(table).values(data).returning().all();
const row = rows[0];
```

### Client/Server Code Separation
- `src/lib/utils.ts` — client-safe (no Node.js imports, used in `CardBack.tsx`)
- `src/lib/server-utils.ts` — server-only (imports `crypto`, used only in API routes)

### Email Sending
- Uses Resend API with React Email components
- Template: `InvitationEmail.tsx` with fully inline styles (required for email clients)
- Images in emails require **absolute URLs** — `NEXT_PUBLIC_BASE_URL` is prepended to `image_path`
- Each recipient gets a unique link: `BASE_URL/card/[id]?token=[uuid]`

---

## Environment Variables

File: `.env.local` (gitignored)

```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Getting a Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Dashboard → **API Keys** → **Create API Key**
3. Paste the key (starts with `re_`) into `.env.local`

### Sending to Real Recipients
By default, the `from` address is `onboarding@resend.dev` — Resend's test sender. This restricts delivery to your own verified email only.

To send to anyone:
1. Add and verify a domain in Resend dashboard → **Domains**
2. Update `src/app/api/send/route.ts`:
```ts
from: "Birthday Cards <invitations@yourdomain.com>",
```

---

## Running the App

```bash
# Install dependencies
npm install

# Run database migrations (first time only)
npx drizzle-kit migrate

# Start dev server
npm run dev
```

App runs at `http://localhost:3000`.

---

## Known Limitations / Future Improvements

- **Image storage**: Images are stored in `public/uploads/` — works locally and on self-hosted servers. For Vercel deployment, switch to an object storage service (S3, Cloudflare R2, Vercel Blob).
- **No auth**: Anyone with a card URL can view it. Acceptable for birthday invites but not sensitive events.
- **Email re-sends**: Currently no tracking of whether emails were already sent — clicking "Create & Send" always sends fresh emails to all recipients.
- **No card editing**: Cards are immutable after creation.
- **No auto-play sound**: Browser autoplay policies prevent sound on page load. Sounds only play on user interactions (button clicks, card flips).

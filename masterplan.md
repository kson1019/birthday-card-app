# Birthday Card App — Masterplan

## 1. Project Overview

### Description
An all-in-one digital birthday invitation platform designed for kids' birthday parties. Parents can create beautiful, animated digital invitations, send them via email, and track RSVPs—all without needing to create an account.

### Target Audience
- Parents organizing kids' birthday parties
- Anyone wanting a simple, delightful way to send event invitations

### Core Value Proposition
- **All-in-one experience**: Create, send, and track invitations in a single flow
- **No account required**: Token-based system eliminates signup friction
- **Delightful interactions**: 3D flip animations, confetti, floating emojis, sound effects, and playful design
- **Real-time RSVP tracking**: Dashboard shows who's coming by name at a glance
- **Customizable effects**: Per-card toggles for floating emojis and sound effects

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| Runtime | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Database | Turso (libSQL) + @libsql/client | 0.17.x |
| ORM | Drizzle ORM | 0.45.1 |
| Email | Resend + React Email | 6.9.2 / 1.0.8 |
| Animations | CSS 3D transforms + canvas-confetti + CSS keyframes | 1.9.4 |
| Sound | Web Audio API | Built-in (no library) |
| AI (planned) | OpenAI | — |

---

## 3. Architecture Decisions

### No Authentication
- Single-user app with no login required
- Recipients identified by unique UUID tokens in URLs
- Tradeoff: Simpler UX vs. anyone with URL can view card (acceptable for party invites)

### Server Components with Client Islands
- Default to React Server Components for better performance
- Client components (`"use client"`) only where interactivity is needed:
  - `FlipCard.tsx` — click handling + flip sound
  - `Confetti.tsx` — canvas animation
  - `FloatingElements.tsx` — animated floating emojis
  - `CalendarButton.tsx` — calendar dropdown
  - `CardCreatorForm.tsx` — form state + toggles
  - `RsvpForm.tsx` — form submission + sounds

### Turso (libSQL) for the Database
- Cloud-hosted libSQL database via Turso
- Connection via `@libsql/client` + `drizzle-orm/libsql`
- Async driver — all queries use standard `await` (no `.all()` quirk)
- **Migration path**: Schema is Drizzle-based, can switch to Postgres by changing the driver

### File-Based Image Storage
- Images saved to `public/uploads/`
- Works locally and on self-hosted servers
- **Migration path**: Switch to S3, Cloudflare R2, or Vercel Blob for serverless deployments

### Web Audio API for Sounds
- Synthesized sounds programmatically — no audio files needed
- Respects browser autoplay policy (requires user interaction first)
- Per-card toggle allows creators to enable/disable sounds

---

## 4. Folder Structure

```
src/
├── app/
│   ├── layout.tsx                      # Root layout, metadata
│   ├── page.tsx                        # Home / card creator
│   ├── globals.css                     # Tailwind + animation keyframes
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
│   │   ├── FlipCard.tsx                # 3D CSS flip container
│   │   ├── CardFront.tsx               # Front face: image + headline
│   │   ├── CardBack.tsx                # Back face: details + message
│   │   ├── Confetti.tsx                # canvas-confetti burst
│   │   ├── FloatingElements.tsx        # Animated floating emojis
│   │   └── CalendarButton.tsx          # Calendar dropdown
│   ├── forms/
│   │   ├── CardCreatorForm.tsx         # Full card creation form + toggles
│   │   ├── ImageUploader.tsx           # Drag-and-drop upload
│   │   ├── RecipientInput.tsx          # Name + email input form with Add button
│   │   └── RsvpForm.tsx                # Yes/No RSVP form
│   └── dashboard/
│       ├── CardList.tsx                # Grid of cards
│       ├── CardSummaryCard.tsx         # Card thumbnail + stats
│       └── RecipientList.tsx           # Expandable recipient list
├── lib/
│   ├── db/
│   │   ├── index.ts                    # SQLite connection setup
│   │   └── schema.ts                   # Drizzle schema definitions
│   ├── email/
│   │   ├── resend.ts                   # Resend client singleton
│   │   └── templates/
│   │       └── InvitationEmail.tsx     # React Email template
│   ├── constants.ts                    # RSVP confirmation messages
│   ├── sounds.ts                       # Web Audio API sound effects
│   ├── themes.ts                       # Floating element definitions
│   ├── utils.ts                        # Client-safe utilities
│   └── server-utils.ts                 # Server-only utilities
└── types/
    ├── index.ts                        # Shared TypeScript types
    └── canvas-confetti.d.ts            # Type declarations
```

### Post-MVP Planned Additions
```
src/
├── app/
│   ├── card/[id]/album/page.tsx        # Photo album viewer (Phase 4)
│   └── api/
│       ├── ai/generate/route.ts        # AI template generation (Phase 5)
│       ├── photos/route.ts             # Photo album uploads (Phase 4)
├── components/
│   └── album/
│       ├── PhotoGrid.tsx               # Photo gallery grid (Phase 4)
│       └── PhotoUploader.tsx           # Guest photo uploads (Phase 4)
└── lib/
    └── ai/
        └── openai.ts                   # OpenAI client + prompts (Phase 5)
```

---

## 5. Database Schema

### Current Tables

#### `cards`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `image_path` | TEXT | Relative path, e.g. `/uploads/abc.jpg` |
| `headline` | TEXT | Front of card text |
| `title` | TEXT | Party title (back of card) |
| `hosted_by` | TEXT | Host name (optional) |
| `location` | TEXT | Party location |
| `datetime` | TEXT | ISO 8601 datetime string |
| `message` | TEXT | Personal message |
| `theme` | TEXT | Card theme (default: "default") |
| `enable_emojis` | INTEGER | 1 = show floating emojis, 0 = hide |
| `enable_sound` | INTEGER | 1 = enable sound effects, 0 = mute |
| `created_at` | TEXT | Auto-set to `datetime('now')` |

#### `recipients`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `card_id` | INTEGER FK | References `cards.id` (cascade delete) |
| `email` | TEXT | Recipient email address |
| `name` | TEXT | Display name (optional) |
| `token` | TEXT UNIQUE | UUID v4 for RSVP link |
| `status` | TEXT | `pending` / `accepted` / `declined` |
| `response_message` | TEXT | Optional RSVP message |
| `responded_at` | TEXT | ISO 8601 response timestamp |

**Indexes:**
- `idx_recipients_card_id` on `card_id`
- `idx_recipients_token` on `token`

#### `reminders`
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment primary key |
| `recipient_id` | INTEGER FK | References `recipients.id` (cascade delete) |
| `remind_at` | TEXT | ISO 8601 datetime to send the reminder |
| `created_at` | TEXT | Auto-set to `datetime('now')` |
| `sent_at` | TEXT | Null until reminder email is dispatched |

**Indexes:** `idx_reminders_remind_at` on `remind_at`

### Post-MVP Planned Tables

#### `themes` (for AI templates)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `name` | TEXT | Theme name (e.g., "Dinosaur", "Princess") |
| `prompt_template` | TEXT | AI prompt for generating card content |
| `color_scheme` | TEXT | JSON color palette |
| `default_elements` | TEXT | JSON list of floating elements |

#### `photos` (for photo albums)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PK | Auto-increment |
| `card_id` | INTEGER FK | References `cards.id` |
| `uploaded_by` | TEXT | Email of uploader |
| `file_path` | TEXT | Path to photo file |
| `caption` | TEXT | Optional caption |
| `uploaded_at` | TEXT | Upload timestamp |

---

## 6. API Routes

### Current Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/upload` | Upload image (JPEG/PNG/WebP/GIF, max 5MB) |
| `POST` | `/api/cards` | Create card with recipients + effect toggles (transactional) |
| `GET` | `/api/cards` | List all cards with RSVP counts |
| `GET` | `/api/cards/[id]` | Get card with recipients, identify by token |
| `POST` | `/api/rsvp` | Submit or update RSVP response |
| `POST` | `/api/send` | Send invitation emails via Resend |

### Post-MVP Planned Endpoints

| Method | Route | Phase | Description |
|--------|-------|-------|-------------|
| `POST` | `/api/ai/generate` | 5 | Generate card content from theme/prompt |
| `GET` | `/api/ai/themes` | 5 | List available AI themes |
| `POST` | `/api/photos` | 4 | Upload photos to card album |
| `GET` | `/api/photos/[cardId]` | 4 | Get all photos for a card |
| `DELETE` | `/api/photos/[id]` | 4 | Remove a photo |

---

## 7. Major System Components

### Card Creation Flow
1. User uploads image via drag-and-drop (`ImageUploader`)
2. Fills in party details (headline, title, location, datetime, message)
3. Toggles card effects (floating emojis, sound effects) — both on by default
4. Adds recipient names and emails with form-based input (`RecipientInput`)
5. Previews card with live flip animation
6. Submits form → API creates card + recipients with unique tokens
7. Emails sent to all recipients via Resend

### RSVP System
1. Recipient receives email with unique tokenized link
2. Opens `/card/[id]?token=[uuid]` — sees flip card with confetti and floating emojis
3. Clicks card to flip and reveal party details
4. Submits RSVP (Yes/No + optional message) with pop sound on button click
5. Sees random fun confirmation message with bounce animation
6. If accepted: Calendar dropdown appears (Google, Apple, Outlook, Outlook.com) — event is pre-populated with party title, date/time, location, and message from the invitation
7. Status stored in `recipients` table
8. Dashboard updates in real-time

### Sound Effects System
- **Engine**: Web Audio API with `OscillatorNode` and `GainNode`
- **Sounds**: Pop (button click), ascending chime (accept), descending tone (decline), flip (card flip)
- **Browser compliance**: `ensureAudioContext()` resumes audio on first user interaction
- **Per-card control**: `enable_sound` column in cards table, toggle in creation form

### Email Delivery
- **Provider**: Resend API
- **Templates**: React Email components with inline styles
- **Personalization**: Each email contains unique recipient link
- **Images**: Absolute URLs required (prepend `NEXT_PUBLIC_BASE_URL`)

### Dashboard
- Lists all created cards with thumbnail previews
- Shows aggregated RSVP stats (accepted/declined/pending)
- Expandable recipient lists with individual statuses
- Click card to view full details

---

## 8. Feature Roadmap

### Phase 1: RSVP Enhancements ✅
- [x] Random fun message on RSVP confirmation
- [x] Add to Calendar dropdown (Google, Apple, Outlook, Outlook.com) with pre-populated title, date/time, location, and message from the invitation

### Phase 2: Floating Animations & Sound ✅
- [x] Floating emoji elements (mix of all themes)
- [x] Performance-optimized CSS animations
- [x] `prefers-reduced-motion` support
- [x] Sound effects on interactions (Web Audio API)
- [x] Per-card toggles for emojis and sounds

---

## Post-MVP Roadmap

Phases 3, 4, and 5 are intentionally deferred to release the MVP sooner. They will be prioritized after launch.

### Phase 3: Reminder System *(Post-MVP)*
- [ ] "Remind me later" picker (1h / 1d / 1w / Custom presets)
- [ ] Email reminder system with cron job (`/api/reminders/send`)
- [ ] `reminders` DB table + Drizzle migration
- [ ] Vercel cron config (`vercel.json`)

### Phase 4: Photo Albums *(Post-MVP)*
- [ ] Post-party photo upload by guests
- [ ] Photo gallery page per card
- [ ] Basic moderation (host can delete)
- [ ] Optional captions

### Phase 5: AI Smart Templates *(Post-MVP)*
- [ ] Theme selection (Dinosaur, Princess, Superhero, etc.)
- [ ] AI-generated headline and message suggestions
- [ ] Automatic color scheme based on theme
- [ ] AI image generation integration (optional)

---

## 9. Environment Variables

File: `.env.local` (gitignored)

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key (starts with `re_`) |
| `NEXT_PUBLIC_BASE_URL` | Yes | App URL (e.g., `http://localhost:3000`) |
| `TURSO_DATABASE_URL` | Yes | Turso DB URL (e.g., `libsql://...turso.io`) |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token from the Turso dashboard |
| `OPENAI_API_KEY` | Phase 5 (Post-MVP) | OpenAI API key for AI features |

### Setup Instructions

```env
# .env.local
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
TURSO_DATABASE_URL=libsql://birthday-card-app-kson1019.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here
```

### Getting a Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Dashboard → **API Keys** → **Create API Key**
3. Paste the key into `.env.local`

---

## 10. Deployment Considerations

### Image Storage Migration
For serverless platforms (Vercel, Netlify), migrate from `public/uploads/` to:
- **Vercel Blob** — simplest for Vercel deployments
- **Cloudflare R2** — cost-effective S3-compatible
- **AWS S3** — industry standard

Implementation:
1. Create storage client in `src/lib/storage/`
2. Update `/api/upload` to use cloud storage
3. Update image URLs in email templates

### Cron Jobs for Reminders
Reminder emails require scheduled execution:
- **Vercel**: Use Vercel Cron (`vercel.json` configuration)
- **Self-hosted**: System cron calling `/api/reminders/send`
- **Alternative**: Resend scheduled emails (if supported)

### Email Domain Verification
To send to any recipient (not just your own email):
1. Add domain in Resend Dashboard → **Domains**
2. Add DNS records (DKIM, SPF)
3. Update `from` address in `/api/send/route.ts`:
   ```ts
   from: "Birthday Cards <invitations@yourdomain.com>"
   ```

### Database Scaling
If SQLite becomes a bottleneck:
1. Switch Drizzle driver from `better-sqlite3` to `postgres`
2. Update `drizzle.config.ts` with Postgres connection
3. Run migrations on new database
4. Update connection in `src/lib/db/index.ts`

---

## Quick Start

```bash
# Install dependencies
npm install

# Run database migrations
npx drizzle-kit migrate

# Start development server
npm run dev
```

App runs at `http://localhost:3000`

---

## Known Limitations

| Limitation | Impact | Future Solution |
|------------|--------|-----------------|
| No auth | Anyone with URL can view | Add optional PIN or password |
| Local image storage | Won't work on Vercel | Cloud storage migration |
| No email tracking | Can't prevent re-sends | Track send status per recipient |
| Immutable cards | No editing after creation | Add edit endpoint with versioning |
| Single language | English only | i18n support |
| No auto-play sound | Browser policy blocks page-load audio | Sounds play on user interactions only |

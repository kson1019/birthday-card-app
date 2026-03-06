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
- **Delightful interactions**: 3D flip animations, confetti, and playful design
- **Real-time RSVP tracking**: Dashboard shows who's coming at a glance

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript | 5.x |
| Runtime | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Database | SQLite + better-sqlite3 | 12.6.2 |
| ORM | Drizzle ORM | 0.45.1 |
| Email | Resend + React Email | 6.9.2 / 1.0.8 |
| Animations | CSS 3D transforms + canvas-confetti | 1.9.4 |
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
  - `FlipCard.tsx` — click handling
  - `Confetti.tsx` — canvas animation
  - `CardCreatorForm.tsx` — form state
  - `RsvpForm.tsx` — form submission

### SQLite for Simplicity
- Zero configuration, file-based database
- WAL mode enabled for concurrent reads
- Foreign keys enforced
- **Migration path**: Schema is Drizzle-based, can switch to Postgres by changing the driver

### File-Based Image Storage
- Images saved to `public/uploads/`
- Works locally and on self-hosted servers
- **Migration path**: Switch to S3, Cloudflare R2, or Vercel Blob for serverless deployments

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
│   │   └── Confetti.tsx                # canvas-confetti burst
│   ├── forms/
│   │   ├── CardCreatorForm.tsx         # Full card creation form
│   │   ├── ImageUploader.tsx           # Drag-and-drop upload
│   │   ├── RecipientInput.tsx          # Tag-style multi-email input
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
│   ├── utils.ts                        # Client-safe utilities
│   └── server-utils.ts                 # Server-only utilities
└── types/
    ├── index.ts                        # Shared TypeScript types
    └── canvas-confetti.d.ts            # Type declarations
```

### Planned Additions
```
src/
├── app/
│   ├── card/[id]/album/page.tsx        # Photo album viewer
│   └── api/
│       ├── ai/generate/route.ts        # AI template generation
│       ├── photos/route.ts             # Photo album uploads
│       └── reminders/route.ts          # Email reminder scheduling
├── components/
│   ├── card/
│   │   └── FloatingElements.tsx        # Animated floating decorations
│   └── album/
│       ├── PhotoGrid.tsx               # Photo gallery grid
│       └── PhotoUploader.tsx           # Guest photo uploads
└── lib/
    └── ai/
        └── openai.ts                   # OpenAI client + prompts
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

### Planned Tables

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
| `POST` | `/api/cards` | Create card with recipients (transactional) |
| `GET` | `/api/cards` | List all cards with RSVP counts |
| `GET` | `/api/cards/[id]` | Get card with recipients, identify by token |
| `POST` | `/api/rsvp` | Submit or update RSVP response |
| `POST` | `/api/send` | Send invitation emails via Resend |

### Planned Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/ai/generate` | Generate card content from theme/prompt |
| `GET` | `/api/ai/themes` | List available AI themes |
| `POST` | `/api/photos` | Upload photos to card album |
| `GET` | `/api/photos/[cardId]` | Get all photos for a card |
| `DELETE` | `/api/photos/[id]` | Remove a photo |
| `POST` | `/api/reminders` | Schedule reminder email |
| `POST` | `/api/reminders/send` | Cron endpoint to send due reminders |

---

## 7. Major System Components

### Card Creation Flow
1. User uploads image via drag-and-drop (`ImageUploader`)
2. Fills in party details (headline, title, location, datetime, message)
3. Adds recipient emails with tag-style input (`RecipientInput`)
4. Previews card with live flip animation
5. Submits form → API creates card + recipients with unique tokens
6. Emails sent to all recipients via Resend

### RSVP System
1. Recipient receives email with unique tokenized link
2. Opens `/card/[id]?token=[uuid]` — sees flip card with confetti
3. Clicks card to flip and reveal party details
4. Submits RSVP (Yes/No + optional message)
5. Status stored in `recipients` table
6. Dashboard updates in real-time

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

### Phase 1: RSVP Enhancements
- [ ] Random fun message on RSVP confirmation ("Can't wait to see you! 🎈")
- [ ] "Remind me later" button with date picker
- [ ] Add to Calendar button (generates .ics file)
- [ ] Email reminder system with cron job

### Phase 2: Floating Animations
- [ ] Theme-based floating elements (balloons, confetti, stars)
- [ ] Customizable animation speed and density
- [ ] Performance-optimized CSS animations
- [ ] Mobile-friendly with reduced motion support

### Phase 3: Photo Albums
- [ ] Post-party photo upload by guests
- [ ] Photo gallery page per card
- [ ] Basic moderation (host can delete)
- [ ] Optional captions

### Phase 4: AI Smart Templates
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
| `OPENAI_API_KEY` | Phase 4 | OpenAI API key for AI features |

### Setup Instructions

```env
# .env.local
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
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

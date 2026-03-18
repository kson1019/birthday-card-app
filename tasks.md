# Birthday Card App — Task List

Granular, actionable tasks for each implementation phase. Each task is scoped to complete in one coding session.

---

## Phase 1: Quick Wins (RSVP Polish)

### 1.1 Random RSVP Confirmation Messages

- [x] **1.1.1** Create array of 10-15 fun confirmation messages in `src/lib/constants.ts`
  - Examples: "Yay! Can't wait to see you! 🎈", "Party time! 🎉", "You're going to have a blast!"
  - Include both "accepted" and "declined" message variants

- [x] **1.1.2** Update `RsvpForm.tsx` to show random message on successful submission
  - Import messages from constants
  - Add success state with randomly selected message
  - Style the success message with playful animation (fade-in or bounce)

### 1.2 Add to Calendar Button

- [x] **1.2.1** Create `generateIcsFile()` helper function in `src/lib/utils.ts`
  - Accept: title, location, datetime, description
  - Return: valid .ics file content string
  - Handle timezone (use UTC with local time display)
  - Also added `generateGoogleCalendarUrl()` and `generateOutlookWebUrl()`

- [x] **1.2.2** Create `CalendarButton.tsx` component in `src/components/card/`
  - Dropdown picker with Google Calendar, Apple Calendar, Outlook, Outlook.com
  - Google/Outlook.com open pre-filled URLs in new tabs
  - Apple/Outlook download .ics files

- [x] **1.2.3** Add `CalendarButton` to RSVP success screen
  - Shows only after accepting (clicking "Yes")
  - Displayed below the success message with "Add it to your calendar" prompt

---

## Phase 2: Floating Animations & Sound Effects

### 2.1 Database Changes

- [x] **2.1.1** Add `theme`, `enable_emojis`, `enable_sound` columns to cards schema
  - `theme: text("theme").default("default")`
  - `enable_emojis: integer("enable_emojis").default(1)`
  - `enable_sound: integer("enable_sound").default(1)`
  - Migrations: `drizzle/0002_lush_blue_marvel.sql`, `drizzle/0003_public_anita_blake.sql`

- [x] **2.1.2** Update TypeScript types
  - Added `theme`, `enableEmojis`, `enableSound` to `Card` type
  - Added `enableEmojis`, `enableSound` to `CreateCardRequest` type

### 2.2 Animation Infrastructure

- [x] **2.2.1** Define theme configurations in `src/lib/themes.ts`
  - Created theme type with id, name, emoji, elements, count, bgGradient
  - Defined 5 themes: Confetti, Balloons, Stars, Hearts, Unicorn
  - **Note:** Theme selector was later removed; all emojis now display together

- [x] **2.2.2** Add CSS keyframes to `globals.css`
  - `@keyframes float-up` — elements rise from bottom to top
  - `@keyframes float-drift` — gentle horizontal sway
  - `@keyframes fade-in-out` — opacity cycle
  - Added `prefers-reduced-motion` media query to disable all animations

### 2.3 Floating Elements Component

- [x] **2.3.1** Create `FloatingElements.tsx` component
  - Shows all 21 emojis from all themes mixed together
  - 20 randomly positioned elements with varied sizes (2.4–4.0rem)
  - CSS animations with randomized delays, durations, drift, and spin
  - `position: fixed` with `pointer-events: none` and `z-[1]`

- [x] **2.3.2** Add reduced motion support
  - `prefers-reduced-motion` media query hides floating elements entirely

### 2.4 Card Effects Toggles

- [x] **2.4.1** Add emoji and sound toggle switches to `CardCreatorForm.tsx`
  - Two toggle switches in "Card Effects" section
  - "Floating Emojis" toggle (🎈) — on by default
  - "Sound Effects" toggle (🔊) — on by default
  - Both saved to database per card

- [x] **2.4.2** Update card creation API to save toggles
  - `POST /api/cards` accepts `enableEmojis` and `enableSound`

### 2.5 Display & Sound

- [x] **2.5.1** Update card display page to conditionally render effects
  - FloatingElements only renders when `enableEmojis` is on
  - Confetti only renders when `enableSound` is on

- [x] **2.5.2** Create sound effects system (`src/lib/sounds.ts`)
  - Web Audio API synthesized sounds (no audio files needed)
  - Pop sound on Yes/No button click
  - Ascending chime on RSVP accepted
  - Descending tone on RSVP declined
  - Flip sound on card flip (preview)
  - All sounds respect `enableSound` toggle
  - **Note:** Confetti auto-play sound removed (browser autoplay policy blocks it)

---

---

## Post-MVP Phases

Phases 3, 4, and 5 are deferred after the initial release to ship the MVP sooner. All tasks below remain valid and can be picked up post-launch.

---

## Phase 3: Reminder System *(Post-MVP)*

> Deferred — the reminder flow added complexity without enough reciprocal UX value for MVP. Will be revisited post-launch.

### 3.1 Database Setup

- [ ] **3.1.1** Create reminders table schema
  - Add to `src/lib/db/schema.ts`:
    ```
    reminders: id, recipient_id (FK), remind_at, created_at, sent_at
    ```
  - Add index on `remind_at` for efficient cron queries

- [ ] **3.1.2** Generate and run migration
  - `npx drizzle-kit generate`
  - `npx drizzle-kit migrate`
  - Verify table created in SQLite

### 3.2 Reminder Scheduling API

- [ ] **3.2.1** Create `POST /api/reminders` endpoint
  - Accept: `recipientToken`, `remindAt` (ISO datetime)
  - Validate: token exists, date is in future, date is before party
  - Insert reminder record
  - Return success/error response

- [ ] **3.2.2** Create `GET /api/reminders` endpoint
  - Accept: `?token=xxx`
  - Return: list of scheduled reminders for this recipient

### 3.3 Reminder Email

- [ ] **3.3.1** Create `ReminderEmail.tsx` template
  - Similar to `InvitationEmail.tsx` but with reminder copy
  - Include: party name, date, location, link to card
  - Subject: "Reminder: [Party Name] is coming up!"

- [ ] **3.3.2** Create cron endpoint `POST /api/reminders/send`
  - Query reminders where `remind_at <= now` and `sent_at IS NULL`
  - For each: send email via Resend, update `sent_at`
  - Return count of sent reminders

### 3.4 Reminder UI

- [ ] **3.4.1** Create `ReminderPicker.tsx` component
  - Preset options: 1 hour before, 1 day before, 1 week before, Custom
  - Custom option reveals a `datetime-local` picker
  - Validate: must be future date, before party date
  - Show loading/success/error states

- [ ] **3.4.2** Add reminder picker to card page
  - Show below RSVP form for pending recipients
  - Pass party datetime for validation

### 3.5 Cron Setup

- [ ] **3.5.1** Create Vercel cron configuration
  - Add `vercel.json` with hourly cron schedule
  - Point to `/api/reminders/send`

- [ ] **3.5.2** Document manual cron setup for self-hosted
  - Example: `curl -X POST http://localhost:3000/api/reminders/send`

---

## Phase 4: Photo Albums *(Post-MVP)*

### 4.1 Database Setup

- [ ] **4.1.1** Create photos table schema
  - Add to `src/lib/db/schema.ts`:
    ```
    photos: id, card_id (FK), uploaded_by (email), file_path, caption, uploaded_at
    ```
  - Add index on `card_id`

- [ ] **4.1.2** Generate and run migration

- [ ] **4.1.3** Add Photo type to `src/types/index.ts`

### 4.2 Photo Upload API

- [ ] **4.2.1** Create `POST /api/photos` endpoint
  - Accept: multipart form with image file, cardId, uploaderEmail, caption
  - Validate: card exists, file is image, file size limit (5MB)
  - Save file to `public/uploads/album/[cardId]/`
  - Insert record in photos table
  - Return photo object

- [ ] **4.2.2** Create `GET /api/photos?cardId=[id]` endpoint
  - Return all photos for a card
  - Order by `uploaded_at` descending
  - Include uploader info (email/name if available)

- [ ] **4.2.3** Create `DELETE /api/photos/[id]` endpoint
  - Validate: photo exists
  - Delete file from filesystem
  - Delete record from database
  - (Future: add authorization check for host-only deletion)

### 4.3 Album Page 

- [ ] **4.3.1** Create album page at `src/app/card/[id]/album/page.tsx`
  - Server component that fetches card and photos
  - Display card title as header
  - Link back to main card page

- [ ] **4.3.2** Create `PhotoGrid.tsx` component
  - Display photos in responsive grid (CSS Grid or Masonry)
  - Show thumbnail with hover effect
  - Display caption and uploader on hover/tap
  - Click to open lightbox

- [ ] **4.3.3** Create `PhotoLightbox.tsx` component
  - Full-screen overlay with larger image
  - Previous/Next navigation
  - Close button (X or click outside)
  - Keyboard navigation (arrows, Escape)

### 4.4 Photo Upload UI

- [ ] **4.4.1** Create `PhotoUploader.tsx` component
  - Drag-and-drop zone (reuse patterns from `ImageUploader.tsx`)
  - Optional caption input field
  - Upload progress indicator
  - Success/error feedback

- [ ] **4.4.2** Add uploader to album page
  - Show upload form at top of album page
  - Require email input (or use token to identify uploader)
  - Refresh photo grid after successful upload

### 4.5 Navigation

- [ ] **4.5.1** Add "View Album" link to `CardBack.tsx`
  - Show link after party date has passed (or always, configurable)
  - Route to `/card/[id]/album`

- [ ] **4.5.2** Add album link to dashboard card summary
  - Show photo count badge if photos exist
  - Link to album page

---

## Phase 5: AI Smart Templates *(Post-MVP)*

### 5.1 OpenAI Integration

- [ ] **5.1.1** Install OpenAI SDK
  - `npm install openai`
  - Add `OPENAI_API_KEY` to `.env.local` template in README

- [ ] **5.1.2** Create OpenAI client in `src/lib/ai/openai.ts`
  - Initialize client with API key from env
  - Export reusable client instance

- [ ] **5.1.3** Create prompt templates for card generation
  - Define prompts for: headline, message, color suggestions
  - Accept theme name and child's age/interests as variables
  - Return structured JSON response

### 5.2 Themes Database

- [ ] **5.2.1** Create themes table schema
  - Add to `src/lib/db/schema.ts`:
    ```
    themes: id, name, description, prompt_template, color_scheme (JSON), icon
    ```

- [ ] **5.2.2** Seed initial themes
  - Create seed script or migration with INSERT statements
  - Themes: Dinosaur, Princess, Superhero, Space, Under the Sea, Sports, Unicorn

### 5.3 AI Generation API

- [ ] **5.3.1** Create `GET /api/ai/themes` endpoint
  - Return list of all available themes
  - Include: id, name, description, icon

- [ ] **5.3.2** Create `POST /api/ai/generate` endpoint
  - Accept: themeId, childName, childAge (optional context)
  - Call OpenAI with theme's prompt template
  - Parse and return: suggested headline, message, colors
  - Handle rate limits and errors gracefully

### 5.4 AI Suggestions UI

- [ ] **5.4.1** Create `ThemePicker.tsx` component
  - Fetch themes from API on mount
  - Display as visual grid with icons/colors
  - Emit selected theme on click

- [ ] **5.4.2** Create `AiSuggestions.tsx` component
  - Accept selected theme as prop
  - "Generate Suggestions" button
  - Display loading state while calling API
  - Show generated headline and message with "Use This" buttons
  - Allow regenerating for different options

- [ ] **5.4.3** Integrate into `CardCreatorForm.tsx`
  - Add theme picker at start of form
  - Show AI suggestions panel when theme selected
  - "Use This" populates form fields
  - User can still edit after accepting suggestions

### 5.5 Polish

- [ ] **5.5.1** Add color scheme application
  - When theme selected, apply suggested colors to card preview
  - Store color scheme with card (optional: add column to cards table)

- [ ] **5.5.2** Add loading and error states
  - Skeleton loaders while AI generates
  - Friendly error messages if API fails
  - Fallback to manual entry if AI unavailable

- [ ] **5.5.3** Add usage tracking (optional)
  - Log AI generation requests for monitoring
  - Consider rate limiting per session

---

## Quick Reference: Task Counts

| Phase | Tasks | Status |
|-------|-------|--------|
| 1     | 5     | ✅ Complete |
| 2     | 9     | ✅ Complete |
| 3     | 10    | Post-MVP (Deferred) |
| 4     | 12    | Post-MVP |
| 5     | 12    | Post-MVP |
| **MVP Total** | **24** | **Complete — ready to ship** |
| **Post-MVP** | **24** | Deferred |

---

## Recent Improvements (March 2026)

Beyond the original MVP phases, the following enhancements were implemented:

### Typography & Visual Design
- [x] **Custom Fonts**: Migrated from Geist to Baloo 2 (headings) + Nunito (body) via Google Fonts
- [x] **Rounded Buttons**: Updated all buttons to use `rounded-full` for pill-shaped, playful design
- [x] **Location Link Styling**: Changed location text from purple to gray while maintaining underline and link functionality

### Recipient Management
- [x] **Name Field Added**: Recipients now have both name and email fields
  - Updated `RecipientInput.tsx` to use form-based input (name + email + Add button)
  - Dashboard displays recipient names as primary identifier with email as secondary
  - Email greetings use recipient name when available ("Hi [Name],")
  - Updated database schema and types to support name field

### Floating Emoji Optimizations
- [x] **Mobile Size Reduction**: Floating emojis are 50% smaller on mobile devices (≤640px)
- [x] **Auto Fade-Out**: Emojis fade out completely after 5 seconds (80% visible, then 1.25s fade)
- [x] **Z-Index Fix**: Raised floating elements to `z-[15]` so they appear above cards on mobile
- [x] **Mobile Spacing**: Increased horizontal padding from `px-4` (16px) to `px-6` (24px) on card pages

### Image & Email Infrastructure
- [x] **Vercel Blob Migration**: Switched from local filesystem to Vercel Blob for image storage
  - Images get permanent public HTTPS URLs (works in emails)
  - Updated `/api/upload` route to use `@vercel/blob` SDK
  - Added smart URL resolution in `/api/send` (supports both Blob and legacy local paths)
  - Fixes broken image links in Gmail and other email clients
- [x] **Email Rate Limit Handling**: Fixed Resend's 2 emails/second rate limit
  - Changed from `Promise.allSettled()` to sequential loop
  - Added 600ms delays between each email send
  - Prevents "Too many requests" errors when sending to 10+ recipients
  - 19 emails now send successfully in ~12 seconds instead of failing instantly

### Database & Backend
- [x] **Dual-Database Support**: Smart connection switching between Turso (production) and SQLite (local)
  - Updated `src/lib/db/index.ts` to detect Turso env vars and switch drivers
  - All DB queries migrated to async/await pattern for libSQL compatibility
  - Local development still uses `better-sqlite3` when Turso vars not present
- [x] **Party Duration Field**: Added hours + minutes input for calendar event duration
  - Added `durationMinutes` column to cards schema (default 180 = 3 hours)
  - Updated card creator form with separate hour/min inputs
  - Calendar helpers now use `durationMinutes` for accurate event end times
  - Google Calendar, Apple Calendar, and Outlook pre-populate with correct duration

### Bug Fixes
- [x] Fixed TypeScript build errors blocking Vercel deployments (implicit `any` types in API routes)
- [x] Fixed floating emojis not visible on mobile (z-index layering issue)
- [x] Fixed email greeting alignment (now center-aligned to match invitation text)
- [x] Fixed email images using localhost URLs (migrated to public Vercel Blob URLs)

### Documentation Updates
- [x] Updated `masterplan.md`, `prd.md`, `progress.md` with comprehensive "Recent Updates" sections
- [x] Updated `CLAUDE.md` with current tech stack, async query patterns, and architecture changes
- [x] Updated `tasks.md` (this file) with all post-MVP improvements

---

## How to Use This List

1. Work through tasks in order within each phase
2. Check off tasks as you complete them
3. Each task should result in a working (if incomplete) state
4. Commit after completing each numbered task (e.g., "1.1.1", "2.3.1")
5. Ship the phase when all its tasks are complete

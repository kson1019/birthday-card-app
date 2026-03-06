# Birthday Card App — Task List

Granular, actionable tasks for each implementation phase. Each task is scoped to complete in one coding session.

---

## Phase 1: Quick Wins (RSVP Polish)

### 1.1 Random RSVP Confirmation Messages

- [Y] **1.1.1** Create array of 10-15 fun confirmation messages in `src/lib/constants.ts`
  - Examples: "Yay! Can't wait to see you! 🎈", "Party time! 🎉", "You're going to have a blast!"
  - Include both "accepted" and "declined" message variants

- [ ] **1.1.2** Update `RsvpForm.tsx` to show random message on successful submission
  - Import messages from constants
  - Add success state with randomly selected message
  - Style the success message with playful animation (fade-in or bounce)

### 1.2 Add to Calendar Button

- [ ] **1.2.1** Create `generateIcsFile()` helper function in `src/lib/utils.ts`
  - Accept: title, location, datetime, description
  - Return: valid .ics file content string
  - Handle timezone (use UTC with local time display)

- [ ] **1.2.2** Create `CalendarButton.tsx` component in `src/components/card/`
  - Accept card data as props
  - On click: generate .ics content, trigger download
  - Style: calendar icon + "Add to Calendar" text

- [ ] **1.2.3** Add `CalendarButton` to `CardBack.tsx`
  - Position below party details, above RSVP form
  - Only show for recipients (when token is present)

---

## Phase 2: Floating Animations

### 2.1 Database Changes

- [ ] **2.1.1** Add `theme` column to cards schema
  - Update `src/lib/db/schema.ts`: add `theme: text("theme").default("default")`
  - Create Drizzle migration file
  - Run migration: `npx drizzle-kit generate` then `npx drizzle-kit migrate`

- [ ] **2.1.2** Update TypeScript types
  - Add `theme` to Card type in `src/types/index.ts`
  - Update any API response types

### 2.2 Animation Infrastructure

- [ ] **2.2.1** Define theme configurations in `src/lib/themes.ts`
  - Create theme type: `{ id, name, elements, colors }`
  - Define 4-5 themes: default, balloons, stars, hearts, confetti
  - Each theme lists emoji/SVG elements and animation styles

- [ ] **2.2.2** Add CSS keyframes to `globals.css`
  - `@keyframes float-up` — elements rise from bottom
  - `@keyframes float-drift` — gentle horizontal sway
  - `@keyframes fade-in-out` — opacity cycle
  - Add `prefers-reduced-motion` media query to disable animations

### 2.3 Floating Elements Component

- [ ] **2.3.1** Create `FloatingElements.tsx` component
  - Accept `theme` prop
  - Generate 15-20 randomly positioned elements
  - Use CSS animations with randomized delays and durations
  - Use `position: fixed` with `pointer-events: none`

- [ ] **2.3.2** Add reduced motion support
  - Check `prefers-reduced-motion` media query
  - If reduced motion preferred, show static decorations or nothing

### 2.4 Theme Picker UI

- [ ] **2.4.1** Create `ThemeSelector.tsx` component in `src/components/forms/`
  - Display theme options as visual cards/buttons
  - Show preview of floating elements for each theme
  - Emit selected theme ID on change

- [ ] **2.4.2** Integrate theme selector into `CardCreatorForm.tsx`
  - Add theme selector after image upload
  - Include theme in form state
  - Submit theme with card creation API call

- [ ] **2.4.3** Update card creation API to save theme
  - Modify `POST /api/cards` to accept and store theme field

### 2.5 Display Floating Elements

- [ ] **2.5.1** Update card display page to render floating elements
  - Modify `src/app/card/[id]/page.tsx`
  - Pass card's theme to `FloatingElements` component
  - Position behind card content (z-index)

---

## Phase 3: Reminder System

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

- [ ] **3.2.2** Create `GET /api/reminders` endpoint (optional)
  - Accept: `recipientToken`
  - Return: list of scheduled reminders for this recipient
  - Used to show existing reminders in UI

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
  - Date picker input (native or simple custom)
  - Validate: must be future date, before party date
  - Submit button: "Remind Me"
  - Show loading/success/error states

- [ ] **3.4.2** Add reminder picker to card page
  - Modify `src/app/card/[id]/page.tsx`
  - Show after RSVP form (for pending recipients)
  - Pass party datetime for validation

### 3.5 Cron Setup

- [ ] **3.5.1** Create Vercel cron configuration (if deploying to Vercel)
  - Add `vercel.json` with cron schedule (e.g., every hour)
  - Point to `/api/reminders/send`

- [ ] **3.5.2** Document manual cron setup for self-hosted
  - Add instructions to README
  - Example: `0 * * * * curl -X POST http://localhost:3000/api/reminders/send`

---

## Phase 4: Photo Albums

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

## Phase 5: AI Smart Templates

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

| Phase | Tasks | Estimated Sessions |
|-------|-------|-------------------|
| 1     | 5     | 1-2               |
| 2     | 11    | 2-3               |
| 3     | 10    | 2-3               |
| 4     | 12    | 3-4               |
| 5     | 12    | 3-4               |
| **Total** | **50** | **11-16** |

---

## How to Use This List

1. Work through tasks in order within each phase
2. Check off tasks as you complete them
3. Each task should result in a working (if incomplete) state
4. Commit after completing each numbered task (e.g., "1.1.1", "2.3.1")
5. Ship the phase when all its tasks are complete

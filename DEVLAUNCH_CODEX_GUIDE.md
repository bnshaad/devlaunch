# DevLaunch Codex Guide

## Project Name

DevLaunch

## Project Type

Student developer portfolio builder + internship application tracker.

## Project Goal

DevLaunch helps students and early-career developers:

1. Build a public developer portfolio.
2. Manage projects and skills.
3. Track internship applications.
4. View job-search progress analytics.
5. Share a clean public profile with recruiters.

The app should feel like a polished, practical career dashboard, not a random college mini project with buttons scattered around like furniture after an earthquake.

---

# Core MVP

## MVP Features

1. Google authentication.
2. Username onboarding.
3. Public portfolio page at `/dev/[username]`.
4. Portfolio profile editor.
5. Project CRUD.
6. Internship application CRUD.
7. Application filters, search, sorting, and quick status update.
8. Dashboard analytics.
9. Responsive UI.
10. Firebase security rules.
11. Vercel deployment.

## Core Pages

```txt
/                          Landing page
/login                     Login page
/onboarding                Username setup
/dashboard                 Dashboard overview
/dashboard/profile         Portfolio profile editor
/dashboard/projects        Project management
/dashboard/projects/new    Add project
/dashboard/projects/[id]/edit Edit project
/dashboard/applications    Internship tracker
/dashboard/applications/new Add application
/dashboard/applications/[id]/edit Edit application
/dev/[username]            Public portfolio page
/demo                      Static demo preview
```

---

# Tech Stack

Use free tools only.

```txt
Frontend: Next.js App Router + TypeScript
Styling: Tailwind CSS + shadcn/ui
Auth: Firebase Authentication
Database: Firebase Firestore
Storage: Firebase Storage, optional later
Hosting: Vercel Hobby
Forms: React Hook Form + Zod
Charts: Recharts
Icons: Lucide React
State: Zustand only if needed
```

## Do Not Use

```txt
Supabase
Paid-only services
Complex backend frameworks for MVP
Unnecessary AI features before core CRUD works
Random component libraries that fight shadcn/ui
```

---

# UI Design System

## Selected Style

**Sahara — Warm Minimalism**

## North Star

**Sun-Baked Simplicity**

Luxurious warmth meets disciplined minimalism. The UI should feel editorial, calm, warm, focused, and premium. Use golden-earth tones, large serif headings, generous whitespace, and clean sans-serif body text.

This replaces the earlier glassmorphism direction. Do not use glassmorphism unless explicitly requested later.

---

# Visual Identity

## Brand Feel

DevLaunch should feel:

```txt
Warm
Minimal
Professional
Editorial
Premium but not flashy
Student-friendly
Recruiter-friendly
Calm and focused
```

Avoid:

```txt
Cold white SaaS templates
Neon gradients
Heavy glass blur
Overdecorated dashboards
Childish colors
Crowded layouts
Generic startup purple everywhere
```

---

# Color System

## Core Colors

```txt
Primary: #c2652a       Burnt sienna
Background: #faf5ee    Warm linen
Tertiary: #8c3c3c      Dusty rose
Warm border: #d8d0c8   Use around 60% opacity
Text dark: #2f261f     Warm near-black
Muted text: #776b61    Warm gray-brown
Surface: #fffaf4       Warm white
Surface low: #f4eadf   Warm tinted section/card background
```

## Usage

### Primary `#c2652a`

Use for:

```txt
Primary CTA buttons
Focus states
Important icons
Small highlights
Active navigation states
```

Do not overuse it. It should guide attention, not scream like a badly designed food delivery app.

### Background `#faf5ee`

Use as the main app background instead of pure white.

### Tertiary `#8c3c3c`

Use sparingly for:

```txt
Subtle accents
Special labels
Portfolio highlights
Selected states where sienna would be too strong
```

### Borders

Use warm thin borders:

```txt
border-[#d8d0c8]/60
```

### Shadows

Use ultra-soft warm shadows:

```css
box-shadow: 0 2px 16px rgba(58, 48, 42, 0.04);
```

Avoid heavy shadows.

---

# Typography

## Fonts

Use this pairing:

```txt
Headlines: EB Garamond
Body/Labels/UI: Manrope
```

## Implementation

Use `next/font/google`.

Recommended setup in `src/app/layout.tsx`:

```tsx
import { EB_Garamond, Manrope } from "next/font/google";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});
```

Apply both variables to the `body`.

## Tailwind Font Setup

Configure fonts if needed:

```ts
fontFamily: {
  serif: ["var(--font-serif)"],
  sans: ["var(--font-sans)"],
}
```

## Typography Rules

### Headlines

Use EB Garamond for:

```txt
Landing page hero headline
Section headings
Public portfolio name/headline
Dashboard page titles when appropriate
Feature section titles
```

Style:

```txt
Large sizes
Tight leading
Elegant but readable
```

Example:

```tsx
className="font-serif text-5xl leading-[0.95] tracking-tight text-[#2f261f] md:text-7xl"
```

### Body and UI

Use Manrope for:

```txt
Body text
Buttons
Labels
Forms
Tables
Navigation
Badges
Dashboard content
```

Example:

```tsx
className="font-sans text-sm text-[#776b61]"
```

---

# Layout Rules

Whitespace is the main design tool.

## Spacing

Use generous spacing:

```txt
Page sections: py-20 to py-28
Cards: p-7 to p-8
Dashboard cards: p-6 to p-8
Form sections: gap-6 or gap-8
Landing sections: max-w-6xl or max-w-7xl
```

When a section feels cluttered, reduce the number of visible items or add spacing. Do not solve clutter by making everything smaller. That is how dashboards become spreadsheets with emotional damage.

## Layout Preference

Use:

```txt
Centered max-width sections
Large editorial hero blocks
Grid-based card layouts
Minimal dividers
Clear section hierarchy
```

Avoid:

```txt
Too many cards in one row
Dense tables without breathing room
Tiny labels everywhere
Crowded sidebars
Multiple competing CTAs
```

---

# Component Design Rules

## Buttons

### Primary Button

Use solid burnt sienna.

```tsx
className="rounded-lg bg-[#c2652a] px-5 py-2.5 font-medium text-white transition hover:bg-[#a95422] focus-visible:ring-2 focus-visible:ring-[#c2652a]/40"
```

### Secondary Button

Use warm outlined button.

```tsx
className="rounded-lg border border-[#d8d0c8]/80 bg-transparent px-5 py-2.5 font-medium text-[#2f261f] transition hover:bg-[#f4eadf]"
```

### Text Link

Use underline on hover.

```tsx
className="text-[#c2652a] underline-offset-4 hover:underline"
```

## Cards

Cards should be warm, quiet, and spacious.

```tsx
className="rounded-2xl border border-[#d8d0c8]/60 bg-[#fffaf4] p-8 shadow-[0_2px_16px_rgba(58,48,42,0.04)]"
```

Alternative lower surface:

```tsx
className="rounded-2xl border border-[#d8d0c8]/60 bg-[#f4eadf]/70 p-8"
```

## Inputs

Inputs should be readable and calm.

```tsx
className="rounded-lg border border-[#d8d0c8] bg-white px-3 py-2 text-[#2f261f] outline-none transition focus:border-[#c2652a] focus:ring-2 focus:ring-[#c2652a]/15"
```

## Labels

```tsx
className="text-sm font-medium text-[#2f261f]"
```

## Badges

Use warm, subtle badges.

```tsx
className="rounded-full border border-[#d8d0c8]/70 bg-[#faf5ee] px-3 py-1 text-xs font-medium text-[#776b61]"
```

## Status Badges

Application statuses must be readable and distinct.

```txt
Saved: warm gray
Applied: sienna/primary
Interview: amber/brown
Offer: green
Rejected: dusty rose/red
```

Avoid neon colors.

---

# Interactive UI and Animation Rules

Animations should be implemented in Codex, not Stitch.

Use Stitch for:

```txt
Visual direction
Screen composition
Layout inspiration
Design system reference
Static screen designs
```

Use Codex for:

```txt
Clean implementation
Reusable components
Actual animations
Hover states
Page transitions
Micro-interactions
Responsive behavior
Accessibility fixes
```

## Recommended Animation Library

Use **Framer Motion** only if the project needs polished interactions.

Install:

```bash
npm install framer-motion
```

For MVP, animations should be subtle. Do not turn DevLaunch into a festival website for a desert perfume brand.

## Animation Style

Use:

```txt
Fade in
Small upward slide
Subtle scale on hover
Gentle card lift
Smooth accordion/dialog transitions
Soft staggered reveal on landing page
```

Avoid:

```txt
Bouncy animations
Large rotations
Excessive parallax
Continuous motion
Distracting hover effects
Slow transitions
Animations that delay usability
```

## Recommended Motion Values

```txt
Duration: 0.18s to 0.45s
Ease: easeOut or custom cubic-bezier
Y movement: 8px to 24px
Scale: 1.01 to 1.03 max
Hover lift: -2px to -4px max
```

## Motion Examples

### Fade Up Wrapper

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: "easeOut" }}
>
  {children}
</motion.div>
```

### Hover Card

```tsx
<motion.div
  whileHover={{ y: -3 }}
  transition={{ duration: 0.18, ease: "easeOut" }}
>
  {children}
</motion.div>
```

### Staggered List

```tsx
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};
```

## Where to Add Animations

Add animations to:

```txt
Landing hero content
Feature cards
Dashboard stat cards
Project cards
Application cards
Form section transitions
Empty states
CTA buttons hover states
```

Do not animate:

```txt
Every table row aggressively
Form typing
Important error messages in a distracting way
Login flow in a way that slows the user down
```

## Accessibility

Respect reduced motion.

If using Framer Motion, create a helper or use `useReducedMotion()` where appropriate.

Animations must never be required to understand content.

---

# Stitch to Codex Workflow

The UI has already been designed in Google Stitch using the Sahara style.

## Correct Workflow

```txt
1. Use Stitch output as visual reference.
2. Export or copy code/screens from Stitch.
3. Give Stitch output to Codex.
4. Tell Codex to adapt the design into the existing Next.js architecture.
5. Do not blindly paste generated Stitch code.
6. Preserve the app structure, routes, and logic.
7. Convert the design into reusable components.
```

## Important Rule

Stitch output is not the source of truth for architecture.

This guide is the source of truth for:

```txt
Tech stack
Routes
Data model
Architecture
Firebase rules
Implementation order
Validation
```

Stitch is the source of truth only for:

```txt
Visual style
Layout inspiration
Design direction
Screen composition
```

---

# Codex Prompt for Importing Stitch UI

Use this prompt when giving Stitch output to Codex:

```txt
I used Google Stitch to create the UI design for DevLaunch using the Sahara — Warm Minimalism style.

Read DEVLAUNCH_CODEX_GUIDE.md fully before making changes.

Use the Stitch output as a visual reference only.
Do not blindly paste messy generated code.
Preserve the existing Next.js App Router architecture.
Preserve current routes and functionality.
Do not add Firebase unless today's task requires it.

Design style to implement:
- Sahara — Warm Minimalism
- Warm linen background #faf5ee
- Burnt sienna primary #c2652a
- Dusty rose accent #8c3c3c
- EB Garamond headlines
- Manrope body/UI text
- Generous whitespace
- Editorial minimal layout
- Warm borders and ultra-soft shadows
- No glassmorphism

Create or improve reusable components:
1. AppBackground or WarmBackground
2. SectionContainer
3. WarmCard
4. PageHeader
5. StatCard
6. StatusBadge
7. EmptyState
8. DashboardShell if needed

Apply the Sahara design to the current implemented pages.

Requirements:
- Use Tailwind CSS and shadcn/ui.
- Use next/font/google for EB Garamond and Manrope.
- Keep text readable.
- Keep mobile responsive.
- Use clean reusable components.
- Add subtle interactive states.
- Add Framer Motion only if needed for polished but subtle animation.
- Respect accessibility and reduced motion where practical.
- npm run build must pass.
- No TypeScript errors.

After implementation, summarize:
- Files changed
- Components added
- Visual improvements made
- Animation/interactions added
- How to test the updated UI
```

---

# Codex Prompt for Adding Animations

Use this after the Sahara UI is implemented and stable:

```txt
Add subtle professional interactions and animations to DevLaunch.

Read DEVLAUNCH_CODEX_GUIDE.md fully before making changes.

Important:
- Preserve the Sahara — Warm Minimalism design system.
- Do not change the visual style.
- Do not add flashy or distracting animations.
- Do not break existing routes or functionality.

If Framer Motion is not installed, install and use it only where it adds value.

Add subtle animations to:
1. Landing page hero section
2. Landing feature cards
3. Dashboard stat cards
4. Project cards
5. Application cards
6. Empty states
7. Buttons and interactive cards

Animation rules:
- Fade up on page sections
- Gentle hover lift on cards
- Subtle scale on CTA hover
- Staggered reveal for landing feature cards
- Duration between 0.18s and 0.45s
- No bouncy, childish, or excessive motion
- Respect reduced motion if practical

Requirements:
- Keep the app accessible.
- Keep interactions fast.
- No layout shift.
- No TypeScript errors.
- npm run build must pass.

After finishing, summarize:
- Animations added
- Files changed
- How to test
```

---

# Data Model

## users/{uid}

```ts
{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  username?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## usernames/{username}

```ts
{
  uid: string;
  createdAt: Timestamp;
}
```

## portfolios/{uid}

```ts
{
  userId: string;
  headline: string;
  bio: string;
  location: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  email?: string;
  skills: string[];
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## projects/{projectId}

```ts
{
  id: string;
  userId: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## applications/{applicationId}

```ts
{
  id: string;
  userId: string;
  company: string;
  role: string;
  location?: string;
  jobUrl?: string;
  source?: string;
  status: "saved" | "applied" | "interview" | "offer" | "rejected";
  appliedDate?: string;
  deadline?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

# Folder Structure

Use this general structure:

```txt
src/
  app/
    page.tsx
    login/
      page.tsx
    onboarding/
      page.tsx
    dashboard/
      page.tsx
      profile/
        page.tsx
      projects/
        page.tsx
        new/
          page.tsx
        [id]/
          edit/
            page.tsx
      applications/
        page.tsx
        new/
          page.tsx
        [id]/
          edit/
            page.tsx
    dev/
      [username]/
        page.tsx
    demo/
      page.tsx

  components/
    auth/
    dashboard/
    portfolio/
    applications/
    shared/
    ui/

  hooks/
  lib/
  services/
  types/
```

---

# Implementation Order

```txt
Day 1: Project setup and basic pages
Day 1.5: Stitch/Sahara UI foundation import and cleanup
Day 2: Firebase Auth
Day 3: User onboarding and username setup
Day 4: Portfolio profile builder
Day 5: Public portfolio page
Day 6: Project CRUD
Day 7: Internship application CRUD
Day 8: Application filters/search/sorting
Day 9: Dashboard analytics
Day 10: Dashboard layout polish
Day 11: Firebase security rules
Day 12: UX states and error handling
Day 13: Landing/demo/README
Day 14: Final audit and deployment
```

Do not move to the next day if the current day is broken.

---

# Firebase Rules Direction

Firestore must not allow unrestricted writes.

Core security principles:

```txt
Users can only modify their own user document.
Usernames can be claimed only once.
Private portfolios are hidden publicly.
Applications are always private.
Projects are owned by one user.
userId must never be changeable during update.
Application status must be one of the allowed values.
```

---

# Daily Codex Starter Prompt

Use this before each daily task:

```txt
Before implementing today's task, inspect the existing DevLaunch codebase.

Read DEVLAUNCH_CODEX_GUIDE.md fully and follow it as the project source of truth.

Understand:
1. Current folder structure
2. Existing routes
3. Existing Firebase setup
4. Existing types
5. Existing services
6. Existing components
7. Current bugs or TypeScript errors
8. Current Sahara UI design system implementation

Do not rewrite working code unnecessarily.
Do not introduce a new architecture unless needed.
Preserve existing functionality.
Maintain the Sahara — Warm Minimalism design system.
Then implement today's task cleanly.
```

---

# Daily Codex Verification Prompt

Use this after each daily task:

```txt
After implementing today's DevLaunch task, run a full check.

Verify:
1. npm run build succeeds
2. No TypeScript errors
3. No broken imports
4. No route crashes
5. Existing completed features still work
6. New feature works as expected
7. UI remains responsive
8. Sahara — Warm Minimalism design system is preserved
9. Firebase reads/writes are safe where applicable
10. Errors and loading states are handled

If anything is broken, fix it directly.
Then provide a concise summary:
- Implemented features
- Files changed
- Bugs fixed
- How to manually test
```

---

# Final Quality Bar

DevLaunch should look and feel like a serious student career product.

The final MVP should be:

```txt
Functional
Responsive
Secure
Warm and minimal
Professional enough for LinkedIn
Clean enough for a recruiter to understand quickly
Strong enough to list on a resume
```

Functionality comes first. UI comes second. Animation comes third. Random decorative nonsense comes never.

# DevLaunch

DevLaunch is a web app for students and early-career developers to manage their developer journey: authenticate with Google, claim a public username, build a portfolio, manage projects, track internship applications, and review basic dashboard progress.

The app is built as an MVP-ready career workspace. The landing and demo pages are static product previews, while the authenticated dashboard uses real user-specific Firestore data.

## Features

- Google login with Firebase Authentication
- First-time username onboarding
- Protected dashboard routes
- Portfolio profile editor backed by Firestore
- Public portfolio pages at `/dev/{username}`
- Public/private portfolio visibility
- Project create, edit, delete, and featured/public display
- Internship/application create, edit, delete, and status tracking
- Dashboard overview with real portfolio, project, and application counts
- Firestore security rules for owner-scoped private data and public portfolio reads
- Responsive UI styled with the app's warm minimal design system

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- React Hook Form
- Zod
- Framer Motion
- Lucide React
- Vercel for deployment

## Routes Overview

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/demo` | Static product preview |
| `/login` | Google sign-in |
| `/onboarding` | First-time username setup |
| `/dashboard` | Authenticated overview with real user data |
| `/dashboard/profile` | Portfolio profile editor |
| `/dashboard/projects` | Project management |
| `/dashboard/projects/new` | Create project |
| `/dashboard/projects/[id]/edit` | Edit project |
| `/dashboard/applications` | Internship/application tracker |
| `/dashboard/applications/new` | Create application |
| `/dashboard/applications/[id]/edit` | Edit application |
| `/dev/[username]` | Public portfolio page |

## Firebase Services Used

- Firebase Authentication for Google sign-in and identity
- Cloud Firestore for:
  - `users/{uid}`
  - `usernames/{username}`
  - `portfolios/{uid}`
  - `projects/{projectId}`
  - `applications/{applicationId}`

Editable profile fields are stored in Firestore portfolio documents. Firebase Auth profile data is used only for identity fields and fallback metadata, not as the source of truth for public/editable profile names.

## Environment Variables

Create `.env.local` for local development using the keys from `.env.example`.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

These are Firebase web app public config values. Do not commit `.env.local`.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` and fill in the Firebase web app config.

3. In Firebase Console, enable Google as a sign-in provider:

```txt
Authentication -> Sign-in method -> Google
```

4. Add local and deployed domains in Firebase Authorized domains:

```txt
Authentication -> Settings -> Authorized domains
```

Include at least:

- `localhost`
- your Vercel production domain
- any custom domain used for the app

5. Start the dev server:

```bash
npm run dev
```

6. Open the local URL printed by Next.js, usually:

```txt
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

Use `npm run lint` and `npm run build` before pushing or deploying.

## Firestore Rules

This repo includes a versioned Firestore rules file:

```txt
firestore.rules
```

`firebase.json` points Firebase CLI at that file:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

Rules are not deployed automatically by the app. Deploy them manually when ready:

```bash
firebase deploy --only firestore:rules
```

Before deploying rules, verify they match the current Firestore collections and that public portfolio reads still work for published portfolios.

## Deployment Notes

For Vercel:

1. Add all required `NEXT_PUBLIC_FIREBASE_*` variables to the Vercel project.
2. Make sure they are configured for the Production environment.
3. Redeploy after changing environment variables.
4. Add the Vercel production domain to Firebase Authorized domains.
5. Confirm Google sign-in provider is enabled in Firebase Authentication.
6. Deploy Firestore rules separately from Firebase CLI when you are ready.

## Manual QA Checklist

- Google login works for an existing user.
- New Google user is sent to onboarding.
- Username rejects spaces, invalid symbols, and taken names.
- Valid onboarding lands on `/dashboard`.
- Existing user skips onboarding.
- Dashboard shows real portfolio/project/application data.
- Profile editor saves Firestore portfolio data.
- Public portfolio uses `portfolio.fullName` or username, not Gmail display name.
- Private portfolio is not publicly readable.
- Project add/edit/delete works.
- Featured projects appear on public portfolio.
- Unfeatured projects stay private.
- Application add/edit/delete works.
- Application status changes persist.
- Logout clears protected UI.
- Refreshing protected routes does not send signed-in users to login.
- Logged-out users cannot access dashboard routes.
- Logged-out users can open a public `/dev/{username}` page.
- Mobile layout is usable for landing, login, onboarding, dashboard, forms, and public portfolio.

## Known Limitations

- Dashboard stats are basic counts and status summaries, not full analytics charts.
- Landing and demo page numbers are illustrative preview content.
- Public portfolio project visibility is currently controlled by the `featured` flag plus public portfolio visibility.
- Firestore rules must be deployed manually.
- No file upload/storage UI is currently implemented.

## Future Improvements

- Richer dashboard analytics and trends
- Application filtering/search/sorting
- Profile image or project image upload workflow
- Better public portfolio customization
- Reminder and follow-up workflows for applications
- Automated end-to-end tests for the main user flows

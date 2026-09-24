# DevLaunch

DevLaunch is a modern web application for students and early-career software engineers to manage their developer journey: authenticate with Google, claim a custom public username, build an interactive portfolio with 3D elements, import profiles from resumes using AI, showcase projects, and track internship applications in a centralized workspace.

Built with Next.js App Router, Tailwind CSS, Firebase, Google Gemini, and Framer Motion, DevLaunch blends a warm editorial aesthetic with interactive micro-experiences and touch-optimized mobile responsiveness.

---

## ✨ Features

### 🎨 Interactive Public Portfolio (`/dev/{username}`)
- **Interactive 3D Geometric Crystal**: A lightweight, GPU-accelerated HTML5 Canvas 3D vector-projected icosahedron with glowing vertices and ambient motes in Sahara terracotta tones (`#c2652a`, `#e8955c`). Smoothly tilts on mouse movement and automatically pauses during scroll for a locked 60 FPS.
- **3D Parallax Avatar**: Spring-damped perspective tilt, specular lighting reflection overlay, an inverse-shifting drop shadow, and a floating 3D "Available" status badge hovering at `translateZ(32px)`.
- **3D Multi-Plane Tilt Project Cards**: Multi-plane Z-layering where project images (`translateZ(16px)`), titles (`translateZ(30px)`), featured stars (`translateZ(38px)`), descriptions, tech tags, and action buttons float at distinct depths with dynamic specular light sheen.
- **Progressive Typewriter Headline**: Character-by-character text reveal with a blinking terracotta cursor, rendered progressively to preserve full DOM content for SEO crawlers.
- **Interactive Skill Cloud & Counter**: Accent-tinted skill badges with spring pop, active tap feedback, rank hover hints, and a scroll-triggered animated numeric counter.
- **Magnetic Contact Links**: Direct links (Email, GitHub, LinkedIn, Website) with cursor-pull magnetic physics and playful icon micro-animations.
- **Page Navigation & CTAs**: Top gradient scroll progress bar, desktop floating section navigation dots (`SectionNavDots`) tracking active viewport sections via `IntersectionObserver`, floating "Build Yours" bottom CTA, and branded footer.

### 📱 Mobile UI & Touch Optimizations
- **Touch & Hover Safety**: Uses a custom `useCanHover` hook powered by React 19's `useSyncExternalStore` (`(hover: hover)`) to cleanly disable mouse tilt on touchscreens, preventing drag-scroll locking while gracefully applying an ambient floating breath animation (`animate-sahara-float`).
- **Native Web Share API**: Mobile users get native system share sheets (AirDrop, Messages, WhatsApp, Copy Link) with haptic vibration feedback, falling back to clipboard copy on desktop.
- **Responsive Geometry & GPU Efficiency**: On screens `< 768px`, the 3D hero crystal automatically scales down, centers behind the avatar, halves particle density, clamps DPR to 1.5, and pauses rendering while the user scrolls to conserve battery.
- **Touch Target & Safe Area Compliance**: All buttons and interactive pills enforce minimum 44px tap targets conforming to iOS/Android human interface guidelines, and bottom floating elements respect `env(safe-area-inset-bottom)`.

### 🤖 AI Resume & CV Import
- **Instant Profile Generation**: Powered by the Google Gemini API (`@google/genai`) to parse pasted resume text or CV markdown into structured developer profile data.
- **Structured Schema Validation**: Validated server-side with Zod (`aiResumeSchema.ts`) ensuring consistent extraction of full name, headline, bio, location, contact links, and categorized technical skills.
- **Interactive Review Modal**: Review and edit extracted fields before applying them to the portfolio editor with a single click.

### 💼 Career Workspace & Dashboard
- **Google Authentication**: Seamless authentication with Firebase Auth.
- **Username Onboarding**: Unique `@username` validation and reservation system.
- **Project Management**: Add, edit, delete, and feature showcase projects with live demo links, repositories, and tech stacks.
- **Internship Tracker**: Kanban/table tracker for internship applications with status stages (Applied, Interviewing, Offer, Rejected).
- **Dashboard Overview**: Metrics tracking portfolio visibility, project counts, and application pipeline progress.
- **Secure Architecture**: Server-side profile photo uploading via Cloudinary and Firestore security rules enforcing owner-only mutations and public portfolio reads.

---

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router, Turbopack) |
| **Core** | [React](https://react.dev/) 19, [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Sahara warm design tokens), CSS 3D Transforms |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) 12, HTML5 Canvas 2D/3D Math |
| **Database & Auth** | [Firebase](https://firebase.google.com/) (Auth, Cloud Firestore, Firebase Admin SDK) |
| **AI / LLM** | [Google Gemini](https://ai.google.dev/) (`@google/genai`) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) (Profile photo upload API) |
| **Form Management** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🗺️ Routes Overview

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page showcasing DevLaunch features and value |
| `/demo` | Public | Static product preview for visitors |
| `/login` | Public | Google sign-in authentication page |
| `/onboarding` | Authenticated | First-time custom username reservation |
| `/dashboard` | Protected | Dashboard overview with portfolio, project, and application metrics |
| `/dashboard/profile` | Protected | Portfolio profile editor with AI Resume Import and live preview |
| `/dashboard/projects` | Protected | Project management list |
| `/dashboard/projects/new` | Protected | Add new showcase project |
| `/dashboard/projects/[id]/edit` | Protected | Edit existing project |
| `/dashboard/applications` | Protected | Internship application pipeline tracker |
| `/dashboard/applications/new` | Protected | Add internship application |
| `/dashboard/applications/[id]/edit`| Protected | Edit internship application details and status |
| `/dev/[username]` | Public | Interactive 3D public developer portfolio |
| `/api/ai/parse-resume` | Protected | API endpoint for Gemini resume extraction |
| `/api/profile-photo/upload` | Protected | Signed upload to Cloudinary |
| `/api/profile-photo/remove` | Protected | Delete profile photo asset |

---

## 🔑 Environment Variables

Create `.env.local` in the project root based on `.env.example`:

```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cloudinary (Server-only photo storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI (Server-only for Resume Parser)
GEMINI_API_KEY=your_gemini_api_key
```

> [!NOTE]
> `FIREBASE_ADMIN_PRIVATE_KEY` must have its newlines escaped as `\n` when stored as a single-line string in environment variables.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/bnshaad/devlaunch.git
cd devlaunch
npm install
```

### 2. Configure Firebase
1. Enable **Google Sign-In** under **Firebase Console -> Authentication -> Sign-in method**.
2. Add authorized domains under **Authentication -> Settings -> Authorized domains** (`localhost`, `127.0.0.1`, and your production domain).
3. Create a Firestore database in test/production mode.

### 3. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 Available Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Starts the Next.js Turbopack development server |
| `npm run build` | Builds the optimized production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint checks across the codebase |

---

## 🛡️ Security & Architecture

- **Scoped Data Isolation**: Users can only read, update, and delete their own projects, applications, and private profile documents.
- **Public Portfolios**: Unauthenticated users can only access `/dev/{username}` if the portfolio has `isPublic: true`.
- **Server-Side AI & Cloud Credentials**: Gemini and Firebase Admin SDK credentials reside strictly in Node.js server routes and are never exposed to the client bundle.
- **Accessibility & Motion Preference**: All animations and 3D effects strictly respect `prefers-reduced-motion: reduce` via `useReducedMotion()`.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

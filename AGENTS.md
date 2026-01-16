# Portfolio Tracker - Agentic Guidelines

This document provides context, conventions, and rules for AI agents working on the Portfolio Tracker repository.

## 1. Project Context & Architecture

- **Goal:** Personal portfolio tracker for stocks/ETFs using Bogleheads strategy (Target Allocation vs Actual).
- **Stack:** React 19, Vite, TypeScript, TailwindCSS v4, shadcn/ui.
- **Backend:** Supabase (Auth, Postgres, RLS). No custom backend server; frontend talks directly to DB via `@supabase/supabase-js`.
- **State Management:** `@tanstack/react-query` for server state. Local state via `useState`.
- **Architecture:** Screaming Architecture (Domain-driven).
  - `src/features/`: Contains domain logic (e.g., `portfolio-viewer`, `asset-manager`, `auth`).
  - `src/shared/`: Reusable UI components (`ui`), utilities (`utils`), and infra (`infra`).
  - `src/app/`: App entry point, routing, and global providers.

## 2. Operational Commands

### Build & Dev

- **Start Dev Server:** `pnpm dev`
- **Build Production:** `pnpm build` (Runs `tsc -b` and `vite build`)
- **Type Check:** `pnpm tsc --noEmit`

### Linting & Formatting

- **Lint:** `pnpm lint` (ESLint)
- **Formatting:** Prettier (assumed). Ensure consistent spacing/indentation.

### Database

- **Schema:** Located in `supabase-schema.sql`.
- **Migrations:** Manual via Supabase SQL Editor for this MVP.
- **Seeding:** Use the SQL function `generate_seed_data()` in Supabase console.

## 3. Code Style & Conventions

### File Organization

- **Naming:** strictly `kebab-case` for all files and folders (e.g., `portfolio-manager.tsx`, `use-assets.ts`).
- **Structure:**
  - Feature-specific components go in `src/features/<feature>/components/`.
  - Feature logic (hooks/utils) goes in `src/features/<feature>/logic/`.
  - Public API of a feature is exposed via `src/features/<feature>/index.ts`.

### React Components

- **Exports:** **DEFAULT EXPORTS ONLY** for components. NEVER use named exports for components.
  - Good: `export default function MyComponent() {}`
  - Bad: `export function MyComponent() {}`
  - *Exception:* UI Primitives (e.g., `buttonVariants`) can be named exports alongside the default component.
- **Imports:** Use absolute imports with `@/` alias (e.g., `import { Button } from "@/shared/ui/button"`).
- **Props:** Define interfaces for props. Avoid `React.FC`.
- **Hooks:** Use custom hooks for logic separation (e.g., `useAssets` for data fetching).
- **Index Files:** `index.ts` files should ONLY be used for exports (barrels). Never put logic inside them.
- **Providers:** Global providers go in `src/app/providers/`. Split complex provider logic (like `QueryProvider`) into separate files.

### TypeScript

- **Strict Mode:** Enabled.
- **No Any:** usage of `any` is strictly prohibited. Use `unknown` or define proper interfaces (e.g., `interface Asset { ... }`).
- **Supabase Types:** Use `Session`, `User` types from `@supabase/supabase-js`.
- **DTOs:** Define shared types in `src/types/index.ts`.
- **State from Props:** Avoid `useEffect` to sync state from props. Use the [State from Props pattern](https://react.dev/reference/react/useState#storing-information-from-previous-renders) (update state during render) to avoid cascading renders.

### State Management

- **Server State:** Use `useQuery` and `useMutation` from React Query.
  - Invalidate queries on mutation success: `queryClient.invalidateQueries({ queryKey: ['key'] })`.
  - **Suspense:** Prefer `useSuspenseQuery` paired with `<Suspense>` boundaries for cleaner loading states.
  - **Query Keys:** ALWAYS use constants from `src/shared/constants/query-keys.ts`. NEVER use hardcoded strings like `['portfolio']`.
- **Local State Sync:** See "State from Props" above.

### UI & Styling

- **Tailwind v4:** Use utility classes.
- **Components:** shadcn/ui components live in `src/shared/ui/`.
  - **Structure:** For complex components (like `Card`), create a dedicated folder (e.g., `src/shared/ui/card/`) and split subcomponents into separate files (`card-header.tsx`, `card-title.tsx`). Avoid `Object.assign` patterns.
- **Icons:** `lucide-react`.
- **Dark Mode:** Supported via `globals.css` variables.
- **Loading:** Use `Skeleton` components for loading states to prevent layout shifts.

## 4. Error Handling

- **Try/Catch:** Always check `if (err instanceof Error)` in catch blocks.
- **Supabase Errors:** Check `error` property from Supabase responses.
- **User Feedback:** Use `alert()` (MVP) or toast notifications for errors.
- **Error Boundaries:** Use `react-error-boundary` to wrap feature areas. Create specific `FallbackComponent`s.

## 5. Security

- **Env Vars:** Prefix with `VITE_`.
- **Secrets:** NEVER commit `SERVICE_ROLE_KEY`. Only use `ANON_KEY`.
- **RLS:** Rely on Row Level Security in Postgres. Frontend assumes data is filtered by `auth.uid()`.

## 6. External Integrations (Plan)

- **Yahoo Finance:** Do NOT call directly from frontend (CORS).
- **Edge Functions:** Use Supabase Edge Functions as proxy (planned `fetch-prices`).

## 7. Testing

- Currently no automated test runner (Jest/Vitest) configured in `package.json`.
- Manual verification via `pnpm dev` and checking console for errors.

---

_Generated by opencode on 2026-01-15_

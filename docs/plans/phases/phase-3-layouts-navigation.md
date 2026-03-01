# Phase 3: Layouts & Navigation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the student app shell (header, footer, locale switcher, wallet button, user menu) and the admin layout (sidebar, header, auth gate) so all pages in Phases 4 and 5 have a consistent chrome to slot into.

**Architecture:** Two distinct layouts — `[locale]/layout.tsx` (student) and `[locale]/admin/layout.tsx` (admin). Header and footer are server components; locale switcher, wallet button, and user menu are client components.

**Tech Stack:** next-intl (`useTranslations`, `Link` from `@/i18n/navigation`), @solana/wallet-adapter-react-ui, Better Auth session, Radix UI Dropdown.

**Prerequisites:** Phase 1 and Phase 2 complete. Providers (Solana, NextIntl, Theme) wired into `[locale]/layout.tsx`. Auth session API functional.

---

## Task 10: Create App Shell (Student Layout)

**Files:**
- Create: `app/src/components/layout/header.tsx`
- Create: `app/src/components/layout/footer.tsx`
- Create: `app/src/components/layout/sidebar.tsx`
- Create: `app/src/components/layout/locale-switcher.tsx`
- Create: `app/src/components/layout/user-menu.tsx`
- Create: `app/src/components/layout/wallet-button.tsx`
- Modify: `app/src/app/[locale]/layout.tsx`

**Step 1: Create header**

`header.tsx`: Logo, navigation links (Courses, Dashboard, Leaderboard), locale switcher, wallet button, user menu (avatar + dropdown with Profile, Settings, Sign Out). All strings from `useTranslations('Navigation')`. Use the `Link` from `@/i18n/navigation` (locale-aware).

**Step 2: Create locale switcher**

`locale-switcher.tsx`: Dropdown using our existing Select component. Shows language names (English, Português, Español). Uses `useRouter` from `@/i18n/navigation` to switch locale via `router.replace(pathname, { locale })`.

**Step 3: Create wallet button**

`wallet-button.tsx`: Wraps `WalletMultiButton` from `@solana/wallet-adapter-react-ui` with our design system styling. Wrap in a fixed-size container (`min-w-[160px] h-10`) to prevent CLS when the client hydrates. Shows truncated address when connected.

**Step 4: Create user menu**

`user-menu.tsx`: Avatar dropdown. If authenticated: name, email, Profile link, Settings link, Sign Out. If wallet connected: show wallet address. If neither: Sign In button.

**Step 5: Create footer**

`footer.tsx`: Superteam branding, links, social icons.

**Step 6: Update locale layout**

Wire header + footer into the `[locale]/layout.tsx`. Apply dark mode as primary theme.

**Step 7: Verify**

Run: `npm run dev` — navigate to `localhost:3000`, see header/footer.

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add app shell with header, footer, locale switcher, wallet button"
```

---

## Task 11: Create Admin Layout

**Files:**
- Create: `app/src/app/[locale]/admin/layout.tsx`
- Create: `app/src/components/admin/admin-sidebar.tsx`
- Create: `app/src/components/admin/admin-header.tsx`

**Step 1: Create admin sidebar**

`admin-sidebar.tsx`: Navigation links for admin pages — Dashboard, Courses, Content, Questions, Preview. Uses our existing admin component styling.

**Step 2: Create admin header**

`admin-header.tsx`: Breadcrumb, back-to-site link, user menu.

**Step 3: Create admin layout**

`app/src/app/[locale]/admin/layout.tsx`:
- Auth gate: check session, redirect to sign-in if not admin
- Sidebar + main content area
- Different from student layout

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add admin layout with sidebar navigation"
```

---

## Phase Gate — Must Pass Before Starting Phase 4

All of the following must be true before proceeding:

- [ ] `cd app && npx next build` exits with code 0
- [ ] `npm run dev` → `http://localhost:3000` — header and footer render correctly
- [ ] Locale switcher: clicking "Português" changes URL to `/pt-BR/` and page re-renders
- [ ] Locale switcher: clicking "Español" changes URL to `/es/` and page re-renders
- [ ] Wallet button is visible in header, has stable dimensions (no layout shift on hydration)
- [ ] Clicking the wallet button opens the Solana wallet selection modal
- [ ] User menu: when not signed in, shows "Sign In" option
- [ ] Navigate to `http://localhost:3000/admin` — redirects to sign-in (auth gate active, not a 404 or 500)
- [ ] Admin sidebar renders correctly when authenticated as admin (test by temporarily bypassing auth gate or signing in)
- [ ] Dark mode is applied as the default theme — page background is dark

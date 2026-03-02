# Auth System Design — Full Context Overhaul

**Date:** 2026-03-02
**Branch:** `feat/frontend-app-26-02-2026`
**Approach:** AuthProvider context + middleware guard + server utility

## Problems Solved

1. `WalletSignIn` connecting loop — `connecting` step never advances to `signing` when wallet connects
2. `autoConnect={true}` race — wallet reconnects on refresh, user clicks "Connect" and gets stuck
3. `WalletSignIn` ignores existing Better Auth session — always shows connect button
4. Sign-in page flashes form before redirect when already authenticated (no loading state)
5. Redirect target `/dashboard` doesn't exist
6. No middleware route protection — all routes publicly accessible
7. No unified auth state — components independently call `useSession()` + `useWallet()`

## Architecture

Three layers, each with one job:

| Layer | File | Responsibility |
|-------|------|---------------|
| Middleware | `middleware.ts` | Redirect unauthed users from protected routes server-side |
| AuthProvider | `providers/auth-provider.tsx` | Single session fetch, merge wallet state, side effects |
| Server utility | `lib/auth-server.ts` | `getServerSession()` for RSC and API routes |

## New Files

### `app/src/providers/auth-provider.tsx`

Client component. Wraps the app in `[locale]/layout.tsx` (inside SolanaProvider, so it can call `useWallet()`).

```
AuthContext value = {
  user: User | null             — Better Auth user object
  session: Session | null       — Full session with token/expiry
  walletAddress: string | null  — publicKey.toBase58() when connected
  isAuthenticated: boolean      — !!user (wallet alone ≠ auth)
  isLoading: boolean            — true while session fetching
  signOut: () => Promise<void>  — signs out Better Auth + disconnects wallet
}
```

Side effects handled inside the provider:
- Wallet disconnects → if session came from SIWS, call `authClient.signOut()`
- Session loading state managed centrally, not per-consumer

### `app/src/hooks/use-auth.ts`

One-liner: reads from AuthContext. Every consumer gets the same snapshot.

### `app/src/lib/auth-server.ts`

Server-only. Uses `auth.api.getSession()` with request headers.
Used by: middleware, RSC pages, API routes.
Replaces the manual cookie-reading logic in `lib/solana/session.ts`.

## Modified Files

### `app/src/middleware.ts`

Combined next-intl + auth middleware. Protected route patterns:
- `/dashboard/**` — requires auth
- `/admin/**` — requires auth
- `/profile/**` — requires auth (own profile)
- `/settings/**` — requires auth

Public routes: `/`, `/courses/**`, `/leaderboard`, `/sign-in`, `/api/**`, `/studio/**`.

Unauthenticated users hitting protected routes → redirect to `/{locale}/sign-in`.

### `app/src/app/[locale]/layout.tsx`

Add `AuthProvider` inside `SolanaProvider` (needs wallet context).

### `app/src/app/[locale]/sign-in/page.tsx`

- Use `useAuth()` instead of `useSession()`
- Show loading spinner while `isLoading` (no form flash)
- Redirect when `isAuthenticated` — use locale-aware navigation
- Redirect to `/` (home) since `/dashboard` doesn't exist yet

### `app/src/components/auth/wallet-sign-in.tsx`

- Add `useEffect` watching `connected` to advance from `connecting` → `signing`
- Add `useAuth()` check — if already authenticated, show "already signed in" state
- Handle `autoConnect` race: if `connected && !isAuthenticated`, show "Sign In with Wallet" (not "Connect Wallet")

### `app/src/components/auth/sign-in-form.tsx`

- Accept `isAuthenticated` / `isLoading` from parent or use `useAuth()` directly
- If authenticated, don't render the form at all

### `app/src/components/layout/user-menu.tsx`

- Use `useAuth()` for user name, avatar, auth state
- Wire Sign Out to `auth.signOut()`
- Conditionally render based on `isAuthenticated`

### `app/src/components/layout/wallet-button.tsx`

- Use `useAuth()` for wallet address display
- Disconnect action should also consider signing out if SIWS session

### `app/src/components/layout/header.tsx`

- Conditionally show Sign In button vs UserMenu based on `useAuth().isAuthenticated`

### `app/src/hooks/use-session.ts`

Delete. Replaced by `use-auth.ts`.

### `app/src/lib/solana/session.ts`

Refactor to use `getServerSession()` from `auth-server.ts` instead of manual cookie reads.

## Provider Tree (after change)

```
NextIntlClientProvider
  └── SolanaProvider (ConnectionProvider → WalletProvider → WalletModalProvider)
        └── AuthProvider (reads useWallet + authClient.useSession)
              └── ThemeProvider
                    └── {children}
```

AuthProvider MUST be inside SolanaProvider (it calls `useWallet()`).

## Route Protection Matrix

| Route Pattern | Auth Required | Middleware Action |
|--------------|---------------|-------------------|
| `/` | No | Pass through |
| `/sign-in` | No (redirect if authed) | Redirect to `/` if session exists |
| `/courses/**` | No | Pass through |
| `/leaderboard` | No | Pass through |
| `/dashboard/**` | Yes | Redirect to `/sign-in` |
| `/admin/**` | Yes | Redirect to `/sign-in` |
| `/profile/**` | Yes | Redirect to `/sign-in` |
| `/settings/**` | Yes | Redirect to `/sign-in` |
| `/api/**` | Varies | Pass through (API routes handle own auth) |
| `/studio/**` | No | Pass through (Sanity Studio) |

## Testing Scenarios

1. Visit `/sign-in` when authenticated → redirect to `/`
2. Visit `/dashboard` when not authenticated → redirect to `/sign-in`
3. Connect wallet on sign-in page → step advances to signing → sign message → authenticated → redirect
4. Refresh page with active session + wallet `autoConnect` → sign-in page redirects, no connecting loop
5. Disconnect wallet when signed in via SIWS → session cleared, redirected to sign-in
6. `useAuth()` returns consistent state across all consumers simultaneously
7. Sign out from user menu → session + wallet disconnected, redirected to sign-in

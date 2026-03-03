import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_PATTERNS = ["/dashboard", "/admin", "/profile", "/settings"];
const AUTH_ONLY_PATTERNS = ["/sign-in"];

function extractPathWithoutLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
}

function getLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return `/${locale}`;
    }
  }
  return "";
}

function hasSessionCookie(request: NextRequest): boolean {
  return (
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token")
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = extractPathWithoutLocale(pathname);
  const localePrefix = getLocalePrefix(pathname);
  const hasSession = hasSessionCookie(request);

  const isProtected = PROTECTED_PATTERNS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (isProtected && !hasSession) {
    const signInUrl = new URL(`${localePrefix}/sign-in`, request.url);
    return NextResponse.redirect(signInUrl);
  }

  const isAuthOnly = AUTH_ONLY_PATTERNS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (isAuthOnly && hasSession) {
    const homeUrl = new URL(`${localePrefix}/`, request.url);
    return NextResponse.redirect(homeUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*).*)"],
};

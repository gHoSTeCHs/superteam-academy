"use client";

import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { SolanaProvider } from "@/providers/solana-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export function AppProviders({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SolanaProvider>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                style: { fontFamily: "var(--font-body)" },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </SolanaProvider>
    </NextIntlClientProvider>
  );
}

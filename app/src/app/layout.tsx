import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Superteam Academy",
  description:
    "Learn Solana development with interactive courses, coding challenges, and on-chain credentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

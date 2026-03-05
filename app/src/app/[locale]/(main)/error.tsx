"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-muted-foreground max-w-md text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-muted-foreground font-mono text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border-input bg-background hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

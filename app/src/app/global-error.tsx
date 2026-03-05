"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "1rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
              Something went wrong
            </h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.875rem",
                margin: 0,
                maxWidth: "28rem",
              }}
            >
              {error.message ||
                "A critical error occurred. Please reload the page."}
            </p>
            {error.digest && (
              <p
                style={{
                  color: "#9ca3af",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  margin: 0,
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={reset}
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

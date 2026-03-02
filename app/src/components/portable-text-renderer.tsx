"use client";

import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1
        className="mb-4 mt-8 text-[28px] font-bold leading-tight text-foreground"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className="mb-3 mt-6 text-[22px] font-bold leading-tight text-foreground"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="mb-2 mt-5 text-[18px] font-semibold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="mb-2 mt-4 text-[16px] font-semibold text-foreground"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p
        className="mb-4 text-[14px] leading-relaxed text-foreground/90"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-3 border-primary/40 pl-4 italic text-foreground/70">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc space-y-1 pl-6 text-[14px] text-foreground/90">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1 pl-6 text-[14px] text-foreground/90">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li style={{ fontFamily: "var(--font-body)" }}>{children}</li>
    ),
    number: ({ children }) => (
      <li style={{ fontFamily: "var(--font-body)" }}>{children}</li>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono text-primary">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
      >
        {children}
      </a>
    ),
  },
};

interface PortableTextRendererProps {
  content: PortableTextBlock[] | null;
  className?: string;
}

export function PortableTextRenderer({
  content,
  className,
}: PortableTextRendererProps) {
  if (!content) return null;
  return (
    <div className={className}>
      <PortableText value={content} components={components} />
    </div>
  );
}

"use client";

import { useState } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

const LANGUAGE_OPTIONS: { label: string; value: string }[] = [
  { label: "TypeScript", value: "typescript" },
  { label: "Rust", value: "rust" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "TOML", value: "toml" },
];

/**
 * Registers the custom Superteam dark and light themes with the Monaco editor
 * instance before the editor mounts.
 */
function defineCustomThemes(monaco: Parameters<BeforeMount>[0]) {
  monaco.editor.defineTheme("superteam-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#1b231d",
      "editor.foreground": "#f7eacb",
      "editorLineNumber.foreground": "#5a6b5e",
      "editor.lineHighlightBackground": "#243028",
      "editor.selectionBackground": "rgba(0, 140, 76, 0.25)",
      "editorCursor.foreground": "#ffd23f",
      "editorWidget.background": "#243028",
      "editorWidget.border": "#3a4a3e",
      "editorSuggestWidget.background": "#243028",
      "editorSuggestWidget.border": "#3a4a3e",
      "scrollbarSlider.background": "rgba(0, 140, 76, 0.3)",
      "scrollbarSlider.hoverBackground": "rgba(0, 140, 76, 0.5)",
      "scrollbarSlider.activeBackground": "rgba(0, 140, 76, 0.6)",
    },
  });

  monaco.editor.defineTheme("superteam-light", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#1b231d",
      "editorLineNumber.foreground": "#5a6b5e",
      "editor.lineHighlightBackground": "#f0e0b8",
      "editor.selectionBackground": "rgba(47, 107, 63, 0.15)",
      "editorCursor.foreground": "#2f6b3f",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#d4c9a8",
      "editorSuggestWidget.background": "#ffffff",
      "editorSuggestWidget.border": "#d4c9a8",
    },
  });
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  readOnly = false,
  height = "400px",
  className,
}: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineCustomThemes(monaco);
  };

  const handleMount: OnMount = (_editor, _monaco) => {
    /* no-op: editor is ready */
  };

  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return (
    <div
      className={cn(
        "rounded-lg border border-border overflow-hidden bg-card",
        className,
      )}
    >
      {!readOnly && (
        <div className="flex items-center border-b border-border bg-card px-3 py-1.5">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground outline-none transition-colors hover:bg-muted focus:ring-1 focus:ring-primary"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <Editor
        height={height}
        language={selectedLanguage}
        value={value}
        theme={isDark ? "superteam-dark" : "superteam-light"}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={(val) => onChange(val ?? "")}
        loading={
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Loading editor...
          </div>
        }
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          lineNumbers: "on",
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          padding: { top: 16, bottom: 16 },
          roundedSelection: true,
          cursorBlinking: "smooth",
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          tabSize: 2,
        }}
      />
    </div>
  );
}

'use client';

import { CodeEditor } from '@/components/code-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CodeExampleData } from '@/types/content';

interface CodeExampleEditorProps {
  data: CodeExampleData;
  onChange: (data: CodeExampleData) => void;
}

const LANGUAGE_OPTIONS = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Rust', value: 'rust' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'JSON', value: 'json' },
  { label: 'TOML', value: 'toml' },
  { label: 'Python', value: 'python' },
  { label: 'Bash', value: 'bash' },
  { label: 'SQL', value: 'sql' },
  { label: 'CSS', value: 'css' },
  { label: 'HTML', value: 'xml' },
] as const;

export function CodeExampleEditor({ data, onChange }: CodeExampleEditorProps) {
  function handleLanguageChange(language: string) {
    onChange({ ...data, language });
  }

  function handleCodeChange(code: string) {
    onChange({ ...data, code });
  }

  function handleFilenameChange(filename: string) {
    onChange({ ...data, filename: filename || undefined });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Language</Label>
          <Select value={data.language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Filename (optional)</Label>
          <Input
            value={data.filename ?? ''}
            onChange={(e) => handleFilenameChange(e.target.value)}
            placeholder="e.g. index.ts"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Code</Label>
        <CodeEditor
          value={data.code}
          onChange={handleCodeChange}
          language={data.language}
          height="300px"
        />
      </div>
    </div>
  );
}

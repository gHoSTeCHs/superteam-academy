"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CodeChallengeData, TestCase } from "@/types/content";

interface CodeChallengeEditorProps {
  data: CodeChallengeData;
  onChange: (data: CodeChallengeData) => void;
}

export function CodeChallengeEditor({
  data,
  onChange,
}: CodeChallengeEditorProps) {
  const [showSolution, setShowSolution] = useState(false);

  function handleLanguageChange(language: string) {
    if (language === "typescript" || language === "rust") {
      onChange({ ...data, language });
    }
  }

  function handleStarterCodeChange(starterCode: string) {
    onChange({ ...data, starterCode });
  }

  function handleSolutionCodeChange(solutionCode: string) {
    onChange({ ...data, solutionCode });
  }

  function handleMaxAttemptsChange(value: string) {
    const parsed = parseInt(value, 10);
    onChange({
      ...data,
      maxAttempts: Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed,
    });
  }

  function addTestCase() {
    const newTestCase: TestCase = { name: "", assertionCode: "" };
    onChange({ ...data, testCases: [...data.testCases, newTestCase] });
  }

  function removeTestCase(index: number) {
    onChange({
      ...data,
      testCases: data.testCases.filter((_, i) => i !== index),
    });
  }

  function updateTestCase(index: number, updates: Partial<TestCase>) {
    onChange({
      ...data,
      testCases: data.testCases.map((tc, i) =>
        i === index ? { ...tc, ...updates } : tc,
      ),
    });
  }

  function addHint() {
    onChange({ ...data, hints: [...data.hints, ""] });
  }

  function removeHint(index: number) {
    onChange({
      ...data,
      hints: data.hints.filter((_, i) => i !== index),
    });
  }

  function updateHint(index: number, value: string) {
    onChange({
      ...data,
      hints: data.hints.map((h, i) => (i === index ? value : h)),
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Language</Label>
          <Select value={data.language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">
            Max Attempts (optional)
          </Label>
          <Input
            type="number"
            min={1}
            value={data.maxAttempts ?? ""}
            onChange={(e) => handleMaxAttemptsChange(e.target.value)}
            placeholder="Unlimited"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Starter Code</Label>
        <CodeEditor
          value={data.starterCode}
          onChange={handleStarterCodeChange}
          language={data.language}
          height="250px"
        />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowSolution(!showSolution)}
          className={cn(
            "flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
          )}
        >
          {showSolution ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
          Solution Code
        </button>
        {showSolution && (
          <CodeEditor
            value={data.solutionCode}
            onChange={handleSolutionCodeChange}
            language={data.language}
            height="250px"
          />
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground">Test Cases</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTestCase}
          >
            <Plus className="size-4" />
            Add Test Case
          </Button>
        </div>

        {data.testCases.map((testCase, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <Input
                  value={testCase.name}
                  onChange={(e) =>
                    updateTestCase(index, { name: e.target.value })
                  }
                  placeholder="Test case name"
                />
                <Textarea
                  value={testCase.assertionCode ?? ""}
                  onChange={(e) =>
                    updateTestCase(index, { assertionCode: e.target.value })
                  }
                  placeholder="Assertion code"
                  rows={3}
                  className="font-mono text-[13px]"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeTestCase(index)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ))}

        {data.testCases.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No test cases added yet.
          </p>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground">Hints</Label>
          <Button type="button" variant="outline" size="sm" onClick={addHint}>
            <Plus className="size-4" />
            Add Hint
          </Button>
        </div>

        {data.hints.map((hint, index) => (
          <div key={index} className="flex items-center gap-3">
            <Input
              value={hint}
              onChange={(e) => updateHint(index, e.target.value)}
              placeholder={`Hint ${index + 1}`}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeHint(index)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}

        {data.hints.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No hints added yet.
          </p>
        )}
      </div>
    </div>
  );
}

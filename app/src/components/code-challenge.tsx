'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createCodeRunner } from '@/lib/code-runner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeEditor } from '@/components/code-editor';
import {
  Play,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
} from 'lucide-react';
import type { CodeChallengeData } from '@/types/content';
import type { RunResult } from '@/types/code-runner';
import type { CodeRunner } from '@/types/code-runner';

interface CodeChallengeProps {
  challenge: CodeChallengeData;
  onComplete?: (passed: boolean) => void;
}

const DEFAULT_MAX_ATTEMPTS = 10;
const HINT_UNLOCK_THRESHOLD = 3;

export function CodeChallenge({ challenge, onComplete }: CodeChallengeProps) {
  const [code, setCode] = useState(challenge.starterCode);
  const [results, setResults] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const runnerRef = useRef<CodeRunner | null>(null);

  const maxAttempts = challenge.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  useEffect(() => {
    return () => {
      runnerRef.current?.dispose?.();
    };
  }, []);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setResults(null);

    try {
      runnerRef.current?.dispose?.();
      const runner = createCodeRunner(challenge.language);
      runnerRef.current = runner;

      const result = await runner.run(code, challenge.language, challenge.testCases);
      setResults(result);

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (result.passed) {
        onComplete?.(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setResults({
        passed: false,
        results: [],
        error: errorMessage,
      });
      setAttempts((prev) => prev + 1);
    } finally {
      setRunning(false);
    }
  }, [code, challenge, attempts, onComplete]);

  const handleReset = useCallback(() => {
    setCode(challenge.starterCode);
    setResults(null);
  }, [challenge.starterCode]);

  const handleShowSolution = useCallback(() => {
    setShowSolution(true);
    setCode(challenge.solutionCode);
  }, [challenge.solutionCode]);

  const handleRevealHint = useCallback(() => {
    setHintsShown((prev) => Math.min(prev + 1, challenge.hints.length));
  }, [challenge.hints.length]);

  const passCount = results ? results.results.filter((r) => r.passed).length : 0;
  const failCount = results ? results.results.filter((r) => !r.passed).length : 0;
  const canShowSolution = attempts >= maxAttempts && !showSolution;
  const canShowHintButton =
    attempts >= HINT_UNLOCK_THRESHOLD && hintsShown < challenge.hints.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="neutral">{challenge.language}</Badge>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={running}
            onClick={handleRun}
          >
            {running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running ? 'Running...' : 'Run'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={running}
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>

          {canShowSolution && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShowSolution}
            >
              <Eye className="h-4 w-4" />
              Show Solution
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={challenge.language}
            readOnly={running}
            height="400px"
            className="rounded-lg border border-border"
          />
        </div>

        <div className="min-w-0 space-y-4">
          <TestResultsPanel results={results} passCount={passCount} failCount={failCount} />

          {(canShowHintButton || hintsShown > 0) && (
            <HintsSection
              hints={challenge.hints}
              hintsShown={hintsShown}
              canShowMore={canShowHintButton}
              onRevealHint={handleRevealHint}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TestResultsPanelProps {
  results: RunResult | null;
  passCount: number;
  failCount: number;
}

function TestResultsPanel({ results, passCount, failCount }: TestResultsPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Test Results</h3>
        {results && (
          <span className="text-xs text-muted-foreground">
            {passCount} passed / {failCount} failed
            {results.executionTimeMs !== undefined && (
              <span className="ml-2">({results.executionTimeMs}ms)</span>
            )}
          </span>
        )}
      </div>

      {!results && (
        <p className="text-sm text-muted-foreground">
          Run your code to see test results
        </p>
      )}

      {results?.error && (
        <div className="mb-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {results.error}
        </div>
      )}

      {results && results.results.length > 0 && (
        <ul className="space-y-2">
          {results.results.map((test, index) => (
            <li
              key={`${test.name}-${index}`}
              className="flex items-start gap-2 text-sm"
            >
              {test.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              )}
              <div>
                <span
                  className={cn(
                    'font-medium',
                    test.passed ? 'text-green-500' : 'text-red-500',
                  )}
                >
                  {test.name}
                </span>
                {test.message && (
                  <p className="text-xs text-muted-foreground">{test.message}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface HintsSectionProps {
  hints: string[];
  hintsShown: number;
  canShowMore: boolean;
  onRevealHint: () => void;
}

function HintsSection({ hints, hintsShown, canShowMore, onRevealHint }: HintsSectionProps) {
  return (
    <div className="rounded-lg border border-border bg-bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-yellow-500" />
        <h3 className="text-sm font-semibold text-foreground">Hints</h3>
      </div>

      {hintsShown > 0 && (
        <ul className="mb-3 space-y-2">
          {hints.slice(0, hintsShown).map((hint, index) => (
            <li
              key={`hint-${index}`}
              className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground"
            >
              {hint}
            </li>
          ))}
        </ul>
      )}

      {canShowMore && (
        <Button variant="ghost" size="sm" onClick={onRevealHint}>
          <Lightbulb className="h-4 w-4" />
          Need a hint?
        </Button>
      )}
    </div>
  );
}

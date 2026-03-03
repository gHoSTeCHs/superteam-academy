import { MockBackend } from "./mock-backend";
import { Judge0Backend } from "./judge0-backend";
import type { CodeRunnerBackend } from "./types";

export function getCodeRunnerBackend(): CodeRunnerBackend {
  const backend = process.env.CODE_RUNNER_BACKEND ?? "mock";

  switch (backend) {
    case "judge0":
      return new Judge0Backend();
    case "mock":
    default:
      return new MockBackend();
  }
}

export type { CodeRunnerBackend } from "./types";

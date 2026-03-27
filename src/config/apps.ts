export type CheckType = "http" | "process";

export interface HealthCheck {
  type: CheckType;
  /** URL for http checks, or process name / port for process checks */
  target: string;
  label: string;
}

export interface TestConfig {
  command: string;
  cwd: string;
}

export interface AppConfig {
  slug: string;
  name: string;
  description: string;
  checks: HealthCheck[];
  tests: TestConfig | null;
}

const HOME = process.env.HOME || "/Users/sarupbanskota";

export const apps: AppConfig[] = [
  {
    slug: "done-today-bot",
    name: "Done Today Bot",
    description: "Slack bot that generates daily done-today summaries",
    checks: [
      {
        type: "http",
        target: "https://upbeat-magic-production-3a7a.up.railway.app/health",
        label: "Railway",
      },
      {
        type: "process",
        target: "done-today-bot",
        label: "Local",
      },
    ],
    tests: {
      command: "npm run verify:quick",
      cwd: `${HOME}/gig/cc/work/done-today-bot`,
    },
  },
  {
    slug: "potatocouch",
    name: "Potato Couch",
    description: "YouTube mention finder for CodeCrafters",
    checks: [
      {
        type: "process",
        target: "potatocouch",
        label: "Local",
      },
    ],
    tests: null,
  },
];

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { apps, type AppConfig, type HealthCheck } from "@/config/apps";

const execAsync = promisify(exec);

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

export type CheckResult = {
  label: string;
  status: "up" | "down" | "error";
  latencyMs?: number;
  error?: string;
};

export type TestResult = {
  status: "pass" | "fail" | "skipped";
  output?: string;
  error?: string;
};

export type AppStatus = {
  slug: string;
  name: string;
  description: string;
  checks: CheckResult[];
  tests: TestResult;
  checkedAt: string;
};

async function runHealthCheck(check: HealthCheck): Promise<CheckResult> {
  const start = Date.now();

  if (check.type === "http") {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(check.target, { signal: controller.signal });
      clearTimeout(timeout);
      return {
        label: check.label,
        status: res.ok ? "up" : "down",
        latencyMs: Date.now() - start,
      };
    } catch (e) {
      return {
        label: check.label,
        status: "down",
        latencyMs: Date.now() - start,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  // Process check: look for the process name in running node processes
  try {
    const { stdout } = await execAsync(
      `ps aux | grep -i "${check.target}" | grep -v grep`
    );
    return {
      label: check.label,
      status: stdout.trim() ? "up" : "down",
      latencyMs: Date.now() - start,
    };
  } catch {
    return {
      label: check.label,
      status: "down",
      latencyMs: Date.now() - start,
    };
  }
}

async function runTests(app: AppConfig): Promise<TestResult> {
  if (!app.tests) {
    return { status: "skipped" };
  }

  try {
    const { stdout, stderr } = await execAsync(app.tests.command, {
      cwd: app.tests.cwd,
      timeout: 30000,
    });
    return {
      status: "pass",
      output: stripAnsi((stdout + stderr).slice(-500)),
    };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return {
      status: "fail",
      output: stripAnsi(((err.stdout || "") + (err.stderr || "")).slice(-500)),
      error: err.message,
    };
  }
}

export async function GET() {
  const results: AppStatus[] = await Promise.all(
    apps.map(async (app) => {
      const [checks, tests] = await Promise.all([
        Promise.all(app.checks.map(runHealthCheck)),
        runTests(app),
      ]);

      return {
        slug: app.slug,
        name: app.name,
        description: app.description,
        checks,
        tests,
        checkedAt: new Date().toISOString(),
      };
    })
  );

  return NextResponse.json(results);
}

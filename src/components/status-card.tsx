import Link from "next/link";
import type { AppStatus, CheckResult, TestResult } from "@/app/api/status/route";

function StatusBadge({
  status,
  label,
  latencyMs,
}: {
  status: "up" | "down" | "error";
  label: string;
  latencyMs?: number;
}) {
  const colors = {
    up: "bg-green-bg text-green border-green-border",
    down: "bg-red-bg text-red border-red-border",
    error: "bg-amber-bg text-amber border-amber-border",
  };

  const dots = {
    up: "bg-green",
    down: "bg-red",
    error: "bg-amber",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5  text-xs font-medium border ${colors[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {label}
      {latencyMs !== undefined && status === "up" && (
        <span className="opacity-60">{latencyMs}ms</span>
      )}
    </span>
  );
}

function TestBadge({ result }: { result: TestResult }) {
  if (result.status === "skipped") {
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5  text-xs font-medium border border-border text-text-muted">
        No tests
      </span>
    );
  }

  const isPass = result.status === "pass";
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5  text-xs font-medium border ${
        isPass
          ? "bg-green-bg text-green border-green-border"
          : "bg-red-bg text-red border-red-border"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isPass ? "bg-green" : "bg-red"}`} />
      Tests {result.status}
    </span>
  );
}

function overallStatus(checks: CheckResult[]): "up" | "down" | "error" {
  if (checks.every((c) => c.status === "up")) return "up";
  if (checks.some((c) => c.status === "up")) return "error";
  return "down";
}

export function StatusCard({ app }: { app: AppStatus }) {
  const overall = overallStatus(app.checks);

  const borderColor = {
    up: "border-green-border",
    down: "border-red-border",
    error: "border-amber-border",
  };

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`block  border ${borderColor[overall]} bg-surface p-5 transition-colors hover:bg-surface-raised/50`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-base font-medium">{app.name}</h2>
          <p className="text-text-secondary text-sm mt-0.5">{app.description}</p>
        </div>
        <span className="text-text-muted text-sm">→</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {app.checks.map((check) => (
          <StatusBadge
            key={check.label}
            status={check.status}
            label={check.label}
            latencyMs={check.latencyMs}
          />
        ))}
        <TestBadge result={app.tests} />
      </div>

      {app.tests.status === "fail" && app.tests.output && (
        <pre className="mt-3 p-3 bg-bg  text-xs text-red overflow-x-auto max-h-32">
          {app.tests.output}
        </pre>
      )}
    </Link>
  );
}

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
    up: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    down: "bg-red-500/15 text-red-400 border-red-500/20",
    error: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  };

  const dots = {
    up: "bg-emerald-400",
    down: "bg-red-400",
    error: "bg-amber-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${colors[status]}`}
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
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-zinc-800/50 text-zinc-500 border-zinc-700">
        No tests
      </span>
    );
  }

  const isPass = result.status === "pass";
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
        isPass
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
          : "bg-red-500/15 text-red-400 border-red-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isPass ? "bg-emerald-400" : "bg-red-400"}`}
      />
      Tests {result.status}
    </span>
  );
}

function overallStatus(checks: CheckResult[]): "up" | "down" | "error" {
  if (checks.every((c) => c.status === "up")) return "up";
  if (checks.some((c) => c.status === "up")) return "error"; // partial
  return "down";
}

export function StatusCard({ app }: { app: AppStatus }) {
  const overall = overallStatus(app.checks);

  const borderColor = {
    up: "border-emerald-500/20",
    down: "border-red-500/20",
    error: "border-amber-500/20",
  };

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`block rounded-xl border ${borderColor[overall]} bg-zinc-900/50 p-6 transition-colors hover:bg-zinc-900/80`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{app.name}</h2>
          <p className="text-zinc-500 text-sm mt-0.5">{app.description}</p>
        </div>
        <span className="text-zinc-600 text-sm">→</span>
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
        <pre className="mt-4 p-3 bg-zinc-950 rounded-lg text-xs text-red-400 overflow-x-auto max-h-32">
          {app.tests.output}
        </pre>
      )}
    </Link>
  );
}

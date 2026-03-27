"use client";

import { useState } from "react";
import type { QualityCheck, SubCheck } from "@/lib/mock-data";

const statusIcon: Record<QualityCheck["status"], { icon: string; color: string }> = {
  pass: { icon: "✓", color: "text-green" },
  fail: { icon: "✕", color: "text-red" },
  warn: { icon: "!", color: "text-amber" },
};

const statusRowBg: Record<QualityCheck["status"], string> = {
  pass: "hover:bg-surface-raised/50",
  fail: "bg-red-bg",
  warn: "bg-amber-bg",
};

function SubCheckRow({ sub }: { sub: SubCheck }) {
  const { icon, color } = statusIcon[sub.status];
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`text-xs ${color}`}>{icon}</span>
      <span className="text-xs text-text-secondary">{sub.name}</span>
    </div>
  );
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function CheckRow({ check }: { check: QualityCheck }) {
  const [expanded, setExpanded] = useState(false);
  const { icon, color } = statusIcon[check.status];
  const hasExpandable = check.detail || check.subChecks;

  return (
    <div className={`transition-colors ${statusRowBg[check.status]}`}>
      <button
        onClick={() => hasExpandable && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left ${hasExpandable ? "cursor-pointer" : "cursor-default"}`}
      >
        <span className={`w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
          {icon}
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm">{check.name}</span>
          <p className="text-xs text-text-muted mt-0.5 truncate">
            {check.description}
          </p>
        </div>

        <span
          className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 flex-shrink-0 ${
            check.status === "pass"
              ? "bg-surface-raised text-text-muted"
              : check.severity === "critical"
                ? "bg-red-bg text-red"
                : "bg-amber-bg text-amber"
          }`}
        >
          {check.severity}
        </span>

        {check.durationMs !== undefined && (
          <span className="text-xs text-text-muted w-14 text-right tabular-nums flex-shrink-0 font-mono">
            {check.durationMs < 1000
              ? `${check.durationMs}ms`
              : `${(check.durationMs / 1000).toFixed(1)}s`}
          </span>
        )}

        {hasExpandable && (
          <span
            className={`text-text-muted text-xs transition-transform flex-shrink-0 ${expanded ? "rotate-90" : ""}`}
          >
            ›
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 pl-11">
          {check.detail && (
            <p className="text-xs text-text-secondary">{check.detail}</p>
          )}

          {check.subChecks && (
            <div className="mt-2 grid grid-cols-2 gap-x-4">
              {check.subChecks.map((sub) => (
                <SubCheckRow key={sub.name} sub={sub} />
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
            <span className="text-[10px] text-text-muted font-mono">
              {formatTime(check.checkedAt)}
            </span>
            {check.logUrl && (
              <a
                href={check.logUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue hover:text-blue/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View logs ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const categoryLabels: Record<string, string> = {
  integration: "Integration",
  eval: "Evals (LLM)",
  functional: "Functional",
};

function categorySummary(checks: QualityCheck[]): {
  status: "pass" | "warn" | "fail";
  label: string;
} {
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;

  // Only surface actual problems in the header
  const parts: string[] = [];
  if (fails > 0) parts.push(`${fails} failed`);
  if (warns > 0) parts.push(`${warns} warning${warns > 1 ? "s" : ""}`);

  if (parts.length === 0) return { status: "pass", label: "All passed" };

  const status = fails > 0 ? "fail" : "warn";
  return { status, label: parts.join(" · ") };
}

function CategorySection({
  cat,
  checks,
}: {
  cat: string;
  checks: QualityCheck[];
}) {
  const summary = categorySummary(checks);
  const { icon, color } = statusIcon[summary.status];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className=" border border-border bg-bg overflow-hidden">
      {/* Category header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-raised/30 transition-colors"
      >
        <span className={`text-xs font-bold ${color}`}>{icon}</span>
        <span className="text-sm font-medium flex-1 text-left">
          {categoryLabels[cat]}
        </span>
        <span className={`text-xs ${color}`}>{summary.label}</span>
        <span className="text-xs text-text-muted">{checks.length}</span>
        <span
          className={`text-text-muted text-xs transition-transform ${expanded ? "rotate-90" : ""}`}
        >
          ›
        </span>
      </button>

      {/* Expanded check list */}
      {expanded && (
        <div className="border-t border-border px-1 py-1">
          <div className="space-y-0.5">
            {checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const statusOrder: Record<string, number> = { fail: 0, warn: 1, pass: 2 };

export function QualityChecks({ checks }: { checks: QualityCheck[] }) {
  const categories = ["integration", "eval", "functional"] as const;

  // Sort categories: failures first, then warnings, then all-pass
  const sortedCategories = [...categories]
    .map((cat) => ({ cat, checks: checks.filter((c) => c.category === cat) }))
    .filter((g) => g.checks.length > 0)
    .sort((a, b) => {
      const aStatus = categorySummary(a.checks).status;
      const bStatus = categorySummary(b.checks).status;
      return (statusOrder[aStatus] ?? 2) - (statusOrder[bStatus] ?? 2);
    });

  const passCount = checks.filter((c) => c.status === "pass").length;
  const total = checks.length;

  const lastRun = checks.reduce(
    (latest, c) => (c.checkedAt > latest ? c.checkedAt : latest),
    checks[0]?.checkedAt || ""
  );

  return (
    <div className=" border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Quality Checks
        </h3>
        <span className="text-xs text-text-muted">
          {passCount}/{total} passed
        </span>
      </div>
      <p className="text-xs text-text-muted mb-4 font-mono">
        Last run {formatTime(lastRun)}
      </p>

      <div className="space-y-2">
        {sortedCategories.map(({ cat, checks: catChecks }) => (
            <CategorySection key={cat} cat={cat} checks={catChecks} />
        ))}
      </div>
    </div>
  );
}

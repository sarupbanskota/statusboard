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
  fail: "bg-red-bg hover:bg-red-bg",
  warn: "bg-amber-bg hover:bg-amber-bg",
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
    <div className={`rounded-lg transition-colors ${statusRowBg[check.status]}`}>
      <button
        onClick={() => hasExpandable && setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${hasExpandable ? "cursor-pointer" : "cursor-default"}`}
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
          className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded flex-shrink-0 ${
            check.severity === "critical"
              ? "bg-red-bg text-red"
              : "bg-surface-raised text-text-muted"
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
        <div className="px-4 pb-3 pl-12">
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

export function QualityChecks({ checks }: { checks: QualityCheck[] }) {
  const categories = ["integration", "eval", "functional"] as const;

  const passCount = checks.filter((c) => c.status === "pass").length;
  const total = checks.length;

  const lastRun = checks.reduce((latest, c) =>
    c.checkedAt > latest ? c.checkedAt : latest, checks[0]?.checkedAt || "");

  return (
    <div className="rounded-[10px] border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
          Quality Checks
        </h3>
        <span className="text-xs text-text-muted">
          {passCount}/{total} passed
        </span>
      </div>
      <p className="text-xs text-text-muted mb-5 font-mono">
        Last run {formatTime(lastRun)}
      </p>

      {categories.map((cat) => {
        const catChecks = checks.filter((c) => c.category === cat);
        if (catChecks.length === 0) return null;

        return (
          <div key={cat} className="mb-4 last:mb-0">
            <p className="text-[11px] text-text-muted uppercase tracking-wider mb-2 px-4 font-medium">
              {categoryLabels[cat]}
            </p>
            <div className="space-y-0.5">
              {catChecks.map((check) => (
                <CheckRow key={check.id} check={check} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

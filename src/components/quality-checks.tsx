"use client";

import { useState } from "react";
import type { QualityCheck, SubCheck } from "@/lib/mock-data";

const statusIcon: Record<QualityCheck["status"], { icon: string; color: string }> = {
  pass: { icon: "✓", color: "text-emerald-400" },
  fail: { icon: "✕", color: "text-red-400" },
  warn: { icon: "!", color: "text-amber-400" },
};

const statusRowBg: Record<QualityCheck["status"], string> = {
  pass: "hover:bg-zinc-800/30",
  fail: "bg-red-500/5 hover:bg-red-500/10",
  warn: "bg-amber-500/5 hover:bg-amber-500/10",
};

function SubCheckRow({ sub }: { sub: SubCheck }) {
  const { icon, color } = statusIcon[sub.status];
  return (
    <div className="flex items-center gap-2 py-1">
      <span className={`text-xs ${color}`}>{icon}</span>
      <span className="text-xs text-zinc-400">{sub.name}</span>
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
        {/* Status icon */}
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color}`}>
          {icon}
        </span>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-zinc-200">{check.name}</span>
          <p className="text-xs text-zinc-600 mt-0.5 truncate">
            {check.description}
          </p>
        </div>

        {/* Severity badge */}
        <span
          className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded flex-shrink-0 ${
            check.severity === "critical"
              ? "bg-red-500/10 text-red-400/70"
              : "bg-zinc-800 text-zinc-500"
          }`}
        >
          {check.severity}
        </span>

        {/* Duration */}
        {check.durationMs !== undefined && (
          <span className="text-xs text-zinc-600 w-14 text-right tabular-nums flex-shrink-0">
            {check.durationMs < 1000
              ? `${check.durationMs}ms`
              : `${(check.durationMs / 1000).toFixed(1)}s`}
          </span>
        )}

        {/* Expand arrow */}
        {hasExpandable && (
          <span
            className={`text-zinc-600 text-xs transition-transform flex-shrink-0 ${expanded ? "rotate-90" : ""}`}
          >
            ›
          </span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-3 pl-12">
          {check.detail && (
            <p className="text-xs text-zinc-500">{check.detail}</p>
          )}

          {/* Sub-checks (e.g. 10 rules for rule compliance) */}
          {check.subChecks && (
            <div className="mt-2 grid grid-cols-2 gap-x-4">
              {check.subChecks.map((sub) => (
                <SubCheckRow key={sub.name} sub={sub} />
              ))}
            </div>
          )}

          {/* Metadata row: time + log link */}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-zinc-800/50">
            <span className="text-[10px] text-zinc-600">
              {formatTime(check.checkedAt)}
            </span>
            {check.logUrl && (
              <a
                href={check.logUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-400/60 hover:text-blue-400 transition-colors"
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

  // Last run time = most recent checkedAt
  const lastRun = checks.reduce((latest, c) =>
    c.checkedAt > latest ? c.checkedAt : latest, checks[0]?.checkedAt || "");

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Quality Checks
        </h3>
        <span className="text-xs text-zinc-500">
          {passCount}/{total} passed
        </span>
      </div>
      <p className="text-xs text-zinc-600 mb-5">
        Last run {formatTime(lastRun)}
      </p>

      {categories.map((cat) => {
        const catChecks = checks.filter((c) => c.category === cat);
        if (catChecks.length === 0) return null;

        return (
          <div key={cat} className="mb-4 last:mb-0">
            <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2 px-4">
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

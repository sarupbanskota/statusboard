"use client";

import { useState } from "react";
import type { PipelineStage } from "@/lib/mock-data";

const statusStyles = {
  complete: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    line: "bg-emerald-500/40",
  },
  active: {
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    text: "text-blue-400",
    dot: "bg-blue-400 animate-pulse",
    line: "bg-blue-500/40",
  },
  pending: {
    bg: "bg-zinc-800/50",
    border: "border-zinc-700",
    text: "text-zinc-500",
    dot: "bg-zinc-600",
    line: "bg-zinc-700",
  },
  failed: {
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    line: "bg-red-500/40",
  },
};

function StatusIcon({ status }: { status: PipelineStage["status"] }) {
  if (status === "active") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400" />
      </span>
    );
  }
  const icons = { complete: "✓", pending: "·", failed: "✕" };
  return <>{icons[status]}</>;
}

function StageNode({
  stage,
  isLast,
  isExpanded,
  onToggle,
}: {
  stage: PipelineStage;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const s = statusStyles[stage.status];

  return (
    <div className="flex items-start gap-0 flex-1 min-w-0">
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Stage circle */}
        <button
          onClick={onToggle}
          className={`w-10 h-10 rounded-full border-2 ${s.border} ${s.bg} flex items-center justify-center text-sm font-medium ${s.text} transition-all hover:scale-105 cursor-pointer`}
        >
          <StatusIcon status={stage.status} />
        </button>
        {/* Label */}
        <span className={`text-xs mt-2 font-medium ${s.text}`}>
          {stage.label}
        </span>
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="flex items-center flex-1 pt-5 px-1">
          <div className={`h-0.5 w-full ${s.line} rounded-full`} />
        </div>
      )}
    </div>
  );
}

export function Pipeline({ stages }: { stages: PipelineStage[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expanded = stages.find((s) => s.id === expandedId);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">
        Today&apos;s Pipeline
      </h3>

      {/* Pipeline stages */}
      <div className="flex items-start">
        {stages.map((stage, i) => (
          <StageNode
            key={stage.id}
            stage={stage}
            isLast={i === stages.length - 1}
            isExpanded={expandedId === stage.id}
            onToggle={() =>
              setExpandedId(expandedId === stage.id ? null : stage.id)
            }
          />
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-6 p-4 rounded-lg bg-zinc-950/50 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">
              {expanded.label}
            </span>
            {expanded.completedAt && (
              <span className="text-xs text-zinc-600">
                {new Date(expanded.completedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mt-1">{expanded.detail}</p>
        </div>
      )}
    </div>
  );
}

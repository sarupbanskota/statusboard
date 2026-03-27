"use client";

import { useState } from "react";
import type { PipelineStage } from "@/lib/types";

const statusStyles = {
  complete: {
    bg: "bg-green-bg",
    border: "border-green-border",
    text: "text-green",
    line: "bg-green/40",
  },
  active: {
    bg: "bg-blue-bg",
    border: "border-blue-border",
    text: "text-blue",
    line: "bg-blue/40",
  },
  pending: {
    bg: "bg-surface-raised",
    border: "border-border",
    text: "text-text-muted",
    line: "bg-border",
  },
  failed: {
    bg: "bg-red-bg",
    border: "border-red-border",
    text: "text-red",
    line: "bg-red/40",
  },
};

function StatusIcon({ status }: { status: PipelineStage["status"] }) {
  if (status === "active") {
    return (
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue" />
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
        <button
          onClick={onToggle}
          className={`w-10 h-10  border ${s.border} ${s.bg} flex items-center justify-center text-sm font-medium ${s.text} transition-all hover:scale-105 cursor-pointer`}
        >
          <StatusIcon status={stage.status} />
        </button>
        <span className={`text-xs mt-2 font-medium ${s.text}`}>
          {stage.label}
        </span>
      </div>

      {!isLast && (
        <div className="flex items-center flex-1 pt-5 px-1">
          <div className={`h-0.5 w-full ${s.line} rounded-full`} />
        </div>
      )}
    </div>
  );
}

export function Pipeline({ stages, dateFor }: { stages: PipelineStage[]; dateFor?: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expanded = stages.find((s) => s.id === expandedId);

  let dateLabel = "Pipeline";
  if (dateFor) {
    const d = new Date(dateFor + "T12:00:00");
    const today = new Date().toISOString().split("T")[0];
    if (dateFor === today) {
      dateLabel = "Today's Pipeline";
    } else {
      dateLabel = `Pipeline — ${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
    }
  }

  return (
    <div className=" border border-border bg-surface p-5">
      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-5">
        {dateLabel}
      </h3>

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

      {expanded && (
        <div className="mt-5 p-3  bg-bg border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{expanded.label}</span>
            {expanded.completedAt && (
              <span className="text-xs text-text-muted font-mono">
                {new Date(expanded.completedAt).toLocaleTimeString()}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">{expanded.detail}</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { DoneTodayBotData } from "@/lib/types";
import { SmokAlarmLogo } from "@/components/logo";

type AppSummary = {
  slug: string;
  name: string;
  description: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  checksSummary: string;
  pipelineStage: string;
  lastCheckedAt: string;
};

function summarizeApp(data: DoneTodayBotData): AppSummary {
  const checks = data.qualityChecks;
  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const total = checks.length;

  const pipelineFailed = data.pipeline.some((s) => s.status === "failed");
  const activeStage = data.pipeline.find((s) => s.status === "active");
  const lastComplete = [...data.pipeline]
    .reverse()
    .find((s) => s.status === "complete");

  let status: AppSummary["status"] = "unknown";
  if (total === 0 && pipelineFailed) status = "down";
  else if (total === 0) status = "unknown";
  else if (failed > 0 || pipelineFailed) status = "degraded";
  else status = "healthy";

  return {
    slug: "done-today-bot",
    name: "Done Today Bot",
    description: "Slack bot that generates daily done-today summaries",
    status,
    checksSummary:
      total > 0 ? `${passed}/${total} checks passed` : "No check results yet",
    pipelineStage: pipelineFailed
      ? "Pipeline failed"
      : activeStage
        ? `${activeStage.label} in progress`
        : lastComplete
          ? `${lastComplete.label} complete`
          : "Idle",
    lastCheckedAt: data.lastCheckedAt,
  };
}

const statusColors = {
  healthy: {
    border: "border-green-border",
    dot: "bg-green",
    label: "Healthy",
    labelColor: "text-green",
  },
  degraded: {
    border: "border-amber-border",
    dot: "bg-amber",
    label: "Degraded",
    labelColor: "text-amber",
  },
  down: {
    border: "border-red-border",
    dot: "bg-red",
    label: "Down",
    labelColor: "text-red",
  },
  unknown: {
    border: "border-border",
    dot: "bg-text-muted",
    label: "Unknown",
    labelColor: "text-text-muted",
  },
};

function AppCard({ app }: { app: AppSummary }) {
  const colors = statusColors[app.status];
  const checkedAt = new Date(app.lastCheckedAt);
  const timeStr = checkedAt.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`block border ${colors.border} bg-surface p-5 transition-colors hover:bg-surface-raised/50`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
            <h2 className="text-base font-medium">{app.name}</h2>
            <span className={`text-xs font-medium ${colors.labelColor}`}>
              {colors.label}
            </span>
          </div>
          <p className="text-text-secondary text-sm">{app.description}</p>
        </div>
        <span className="text-text-muted text-sm">→</span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
        <span>{app.checksSummary}</span>
        <span>·</span>
        <span>{app.pipelineStage}</span>
        <span>·</span>
        <span>Checked {timeStr}</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [apps, setApps] = useState<AppSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apps/done-today-bot");
      const data: DoneTodayBotData = await res.json();
      setApps([summarizeApp(data)]);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <SmokAlarmLogo size={28} />
            <h1 className="text-2xl font-semibold tracking-tight">
              Smoke Alarm
            </h1>
          </div>
          <p className="text-text-secondary text-sm mt-1">
            Health dashboard for your apps
          </p>
        </div>
        <button
          disabled
          className="px-4 py-2 bg-surface-raised border border-border text-sm font-medium opacity-40 cursor-not-allowed"
        >
          Refresh
        </button>
      </div>

      {apps.length > 0 ? (
        <div className="space-y-4">
          {apps.map((app) => (
            <AppCard key={app.slug} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center text-text-muted py-20">
          {loading ? "Loading..." : "No apps configured"}
        </div>
      )}
    </main>
  );
}

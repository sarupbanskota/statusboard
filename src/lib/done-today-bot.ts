import type {
  PipelineStage,
  QualityCheck,
  DayHistory,
  HealthResponse,
  DoneTodayBotData,
} from "./types";

const BOT_URL = process.env.DONE_TODAY_BOT_URL
  || "https://upbeat-magic-production-3a7a.up.railway.app";

type TestResultFile = {
  runAt: string;
  commit: { sha: string; message: string; url: string; runUrl?: string | null } | null;
  health: HealthResponse | null;
  checks: QualityCheck[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warned: number;
  };
};

type HistoryEntry = {
  runAt: string;
  commit: TestResultFile["commit"];
  summary: TestResultFile["summary"];
  health: HealthResponse | null;
};

// --- Pipeline ---

export async function fetchPipeline(): Promise<{ stages: PipelineStage[]; dateFor: string | null }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BOT_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const health: HealthResponse = await res.json();
    return { stages: healthToPipeline(health), dateFor: health.dateFor };
  } catch {
    return {
      stages: [
        { id: "sources", label: "Sources", status: "failed", detail: "Cannot reach Railway deployment" },
        { id: "draft", label: "Draft", status: "pending", detail: "" },
        { id: "enrichment", label: "Enrichment", status: "pending", detail: "" },
        { id: "review", label: "Review", status: "pending", detail: "" },
        { id: "posted", label: "Posted", status: "pending", detail: "" },
      ],
      dateFor: null,
    };
  }
}

function healthToPipeline(h: HealthResponse): PipelineStage[] {
  const sources = h.sourcesCompleted || [];
  const remoteCount = sources.filter((s) =>
    ["slack", "gmail", "calendar", "github"].includes(s)
  ).length;
  const hasWhatsApp = sources.includes("whatsapp");
  const hasClaudeCode = sources.includes("claude-code");

  return [
    {
      id: "sources",
      label: "Sources",
      status: remoteCount >= 4 ? "complete" : remoteCount > 0 ? "active" : "pending",
      detail: `${remoteCount}/4 remote sources collected`,
      completedAt: h.sinceTimestamp || undefined,
    },
    {
      id: "draft",
      label: "Draft",
      status: h.draftState ? "complete" : remoteCount >= 4 ? "active" : "pending",
      detail: h.draftState ? `Draft generated for ${h.dateFor}` : "Waiting for sources",
    },
    {
      id: "enrichment",
      label: "Enrichment",
      status: hasWhatsApp && hasClaudeCode ? "complete" : hasWhatsApp || hasClaudeCode ? "active" : "pending",
      detail: [
        hasWhatsApp ? "WhatsApp ✓" : "WhatsApp pending",
        hasClaudeCode ? "Claude Code ✓" : "Claude Code pending",
      ].join(" · "),
    },
    {
      id: "review",
      label: "Review",
      status:
        h.draftState === "finalized" || h.draftState === "posted"
          ? "complete"
          : h.draftState === "pending_review" ? "active" : "pending",
      detail:
        h.draftState === "pending_review"
          ? "Awaiting approval in #sarup-daily-drafts"
          : h.draftState === "finalized" || h.draftState === "posted" ? "Approved" : "Waiting for draft",
    },
    {
      id: "posted",
      label: "Posted",
      status: h.draftState === "posted" ? "complete" : "pending",
      detail: h.draftState === "posted" ? "Posted to #done-today" : "Will post after approval",
    },
  ];
}

// --- Quality Checks ---

async function fetchLatestResult(): Promise<TestResultFile | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BOT_URL}/test-results/latest`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- History ---

async function fetchHistory(): Promise<HistoryEntry[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BOT_URL}/test-results/history`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function buildDayHistory(entries: HistoryEntry[], days: number): DayHistory[] {
  const now = new Date();

  // Group entries by date, keep the latest per day
  const byDate = new Map<string, HistoryEntry>();
  for (const entry of entries) {
    const date = entry.runAt.split("T")[0];
    const existing = byDate.get(date);
    if (!existing || entry.runAt > existing.runAt) {
      byDate.set(date, entry);
    }
  }

  const history: DayHistory[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const entry = byDate.get(dateStr);

    history.push({
      date: dateStr,
      drafted: entry ? (entry.health?.draftState != null) : false,
      checksPassed: entry ? entry.summary.failed === 0 : null,
      posted: entry ? entry.health?.draftState === "posted" : false,
    });
  }

  return history;
}

// --- Combined ---

export async function getDoneTodayBotData(): Promise<DoneTodayBotData> {
  const [pipelineData, latestResult, historyEntries] = await Promise.all([
    fetchPipeline(),
    fetchLatestResult(),
    fetchHistory(),
  ]);

  return {
    pipeline: pipelineData.stages,
    pipelineDateFor: pipelineData.dateFor,
    qualityChecks: latestResult?.checks ?? [],
    latestCommit: latestResult?.commit ?? null,
    historyWeek: buildDayHistory(historyEntries, 7),
    historyMonth: buildDayHistory(historyEntries, new Date().getDate()),
    lastCheckedAt: latestResult?.runAt ?? new Date().toISOString(),
  };
}

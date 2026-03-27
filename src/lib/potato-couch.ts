import type {
  PipelineStage,
  QualityCheck,
  DayHistory,
  PotatoCouchHealthResponse,
  PotatoCouchData,
} from "./types";

const BOT_URL =
  process.env.POTATO_COUCH_URL || "https://potato-couch-production.up.railway.app";

type TestResultFile = {
  runAt: string;
  commit: { sha: string; message: string; url: string; runUrl?: string | null } | null;
  health: PotatoCouchHealthResponse | null;
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
  health: PotatoCouchHealthResponse | null;
};

// --- Pipeline ---

export async function fetchPipeline(): Promise<PipelineStage[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${BOT_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const health: PotatoCouchHealthResponse = await res.json();
    return healthToPipeline(health);
  } catch {
    return [
      { id: "detect", label: "Detect", status: "failed", detail: "Cannot reach Potato Couch deployment" },
      { id: "react", label: "React", status: "pending", detail: "" },
      { id: "transcript", label: "Transcript", status: "pending", detail: "" },
      { id: "analysis", label: "Analysis", status: "pending", detail: "" },
      { id: "post", label: "Post", status: "pending", detail: "" },
    ];
  }
}

function healthToPipeline(h: PotatoCouchHealthResponse): PipelineStage[] {
  const hasProcessed = h.totalProcessed > 0;
  const hasFailed = h.totalFailed > 0;
  const lastMethod = h.transcriptMethod;

  return [
    {
      id: "detect",
      label: "Detect",
      status: h.connected ? "complete" : "failed",
      detail: h.connected
        ? `Socket Mode connected · ${h.totalProcessed} videos processed`
        : "Socket Mode not connected",
      completedAt: h.startedAt,
    },
    {
      id: "react",
      label: "React",
      status: h.connected ? "complete" : "pending",
      detail: h.connected ? "Eyes emoji reaction active" : "Waiting for connection",
    },
    {
      id: "transcript",
      label: "Transcript",
      status: !hasProcessed
        ? "pending"
        : lastMethod
          ? "complete"
          : hasFailed
            ? "failed"
            : "pending",
      detail: lastMethod
        ? `Last succeeded via ${lastMethod}`
        : hasFailed
          ? `${h.totalFailed}/${h.totalProcessed} videos failed transcript fetch`
          : "No videos processed yet",
    },
    {
      id: "analysis",
      label: "Analysis",
      status: hasProcessed && lastMethod ? "complete" : hasProcessed ? "failed" : "pending",
      detail: hasProcessed
        ? `${h.totalProcessed - h.totalFailed}/${h.totalProcessed} analyses completed`
        : "Waiting for transcript",
    },
    {
      id: "post",
      label: "Post",
      status: hasProcessed && !hasFailed ? "complete" : hasProcessed ? "complete" : "pending",
      detail: h.lastVideoUrl
        ? `Last: ${h.lastVideoUrl}`
        : "No videos posted yet",
      completedAt: h.lastVideoAt ?? undefined,
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
      drafted: entry != null, // a test run happened that day
      checksPassed: entry ? entry.summary.failed === 0 : null,
      posted: entry ? entry.summary.failed === 0 && entry.summary.total > 0 : false,
    });
  }

  return history;
}

// --- Combined ---

export async function getPotatoCouchData(): Promise<PotatoCouchData> {
  const [pipeline, latestResult, historyEntries] = await Promise.all([
    fetchPipeline(),
    fetchLatestResult(),
    fetchHistory(),
  ]);

  return {
    pipeline,
    qualityChecks: latestResult?.checks ?? [],
    latestCommit: latestResult?.commit ?? null,
    historyWeek: buildDayHistory(historyEntries, 7),
    historyMonth: buildDayHistory(historyEntries, new Date().getDate()),
    lastCheckedAt: latestResult?.runAt ?? new Date().toISOString(),
  };
}

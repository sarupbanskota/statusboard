"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Pipeline } from "@/components/pipeline";
import { QualityChecks } from "@/components/quality-checks";
import { HistoryStrip } from "@/components/history-strip";
import type { PotatoCouchData } from "@/lib/types";

export default function PotatoCouchPage() {
  const [data, setData] = useState<PotatoCouchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apps/potato-couch");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const runChecks = useCallback(async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/apps/potato-couch/run", {
        method: "POST",
      });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to run checks:", e);
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          ← Back to overview
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Potato Couch
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              YouTube mention finder for CodeCrafters
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="px-3 py-1.5 bg-surface-raised hover:bg-surface-raised/80 border border-border text-xs font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={runChecks}
              disabled={running}
              className="px-3 py-1.5 bg-green-bg hover:bg-green-bg/80 border border-green-border text-green text-xs font-medium transition-colors disabled:opacity-50"
            >
              {running ? "Running..." : "Run checks"}
            </button>
          </div>
        </div>
      </div>

      {data ? (
        <div className="space-y-4">
          <Pipeline stages={data.pipeline} />

          {data.qualityChecks.length > 0 ? (
            <QualityChecks checks={data.qualityChecks} />
          ) : (
            <div className="border border-border bg-surface p-5">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                Quality Checks
              </h3>
              <p className="text-sm text-text-secondary">
                No results yet.{" "}
                <button
                  onClick={runChecks}
                  className="text-green hover:underline"
                  disabled={running}
                >
                  Run checks
                </button>{" "}
                to verify against fixture data.
              </p>
            </div>
          )}

          <HistoryStrip
            weekHistory={data.historyWeek}
            monthHistory={data.historyMonth}
          />
        </div>
      ) : (
        <div className="text-center text-text-muted py-20">
          {loading ? "Loading..." : "Failed to load data"}
        </div>
      )}
    </main>
  );
}

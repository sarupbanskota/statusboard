"use client";

import { useEffect, useState, useCallback } from "react";
import type { AppStatus } from "./api/status/route";
import { StatusCard } from "@/components/status-card";

export default function Home() {
  const [statuses, setStatuses] = useState<AppStatus[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      setStatuses(data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Failed to fetch status:", e);
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
          <h1 className="text-2xl font-semibold tracking-tight">Statusboard</h1>
          <p className="text-text-secondary text-sm mt-1">
            {lastRefresh
              ? `Last checked ${lastRefresh.toLocaleTimeString()}`
              : "Loading..."}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-surface-raised hover:bg-surface-raised/80 border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Checking..." : "Refresh"}
        </button>
      </div>

      {statuses ? (
        <div className="space-y-4">
          {statuses.map((app) => (
            <StatusCard key={app.slug} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center text-text-muted py-20">
          Running health checks...
        </div>
      )}
    </main>
  );
}

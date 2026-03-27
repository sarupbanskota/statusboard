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
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statusboard</h1>
          <p className="text-zinc-500 mt-1">
            {lastRefresh
              ? `Last checked ${lastRefresh.toLocaleTimeString()}`
              : "Loading..."}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Checking..." : "Refresh"}
        </button>
      </div>

      {statuses ? (
        <div className="grid gap-6">
          {statuses.map((app) => (
            <StatusCard key={app.slug} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center text-zinc-500 py-20">
          Running health checks...
        </div>
      )}
    </main>
  );
}

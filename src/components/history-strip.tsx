"use client";

import { useState } from "react";
import type { DayHistory } from "@/lib/mock-data";

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function dayNum(dateStr: string): string {
  return dateStr.split("-")[2].replace(/^0/, "");
}

function dayStatus(day: DayHistory): {
  color: string;
  bg: string;
  border: string;
  tooltip: string;
} {
  if (!day.drafted) {
    return {
      color: "text-zinc-600",
      bg: "bg-zinc-800/50",
      border: "border-zinc-700/50",
      tooltip: "No draft generated",
    };
  }
  if (day.checksPassed === false) {
    return {
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      tooltip: "Quality checks failed",
    };
  }
  if (day.posted) {
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      tooltip: "Posted to #done-today",
    };
  }
  if (day.checksPassed === null) {
    return {
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      tooltip: "Draft generated, quality pending",
    };
  }
  return {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    tooltip: "Quality passed, not posted",
  };
}

const today = new Date().toISOString().split("T")[0];

function WeekView({ history }: { history: DayHistory[] }) {
  return (
    <div className="flex gap-3 justify-between">
      {history.map((day) => {
        const s = dayStatus(day);
        const isToday = day.date === today;

        return (
          <div
            key={day.date}
            className="flex flex-col items-center gap-2 flex-1"
            title={s.tooltip}
          >
            <span className="text-[10px] text-zinc-600 uppercase">
              {dayLabel(day.date)}
            </span>
            <div
              className={`w-10 h-10 rounded-lg border ${s.border} ${s.bg} flex items-center justify-center ${
                isToday ? "ring-1 ring-zinc-500" : ""
              }`}
            >
              <span className={`text-sm font-medium ${s.color}`}>
                {dayNum(day.date)}
              </span>
            </div>
            {/* Status dots */}
            <div className="flex gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${day.drafted ? "bg-emerald-400" : "bg-zinc-700"}`}
                title={day.drafted ? "Drafted" : "Not drafted"}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  day.checksPassed === true
                    ? "bg-emerald-400"
                    : day.checksPassed === false
                      ? "bg-red-400"
                      : "bg-zinc-700"
                }`}
                title={
                  day.checksPassed === true
                    ? "Quality passed"
                    : day.checksPassed === false
                      ? "Quality failed"
                      : "Not checked"
                }
              />
              <span
                className={`w-1.5 h-1.5 rounded-full ${day.posted ? "bg-emerald-400" : "bg-zinc-700"}`}
                title={day.posted ? "Posted" : "Not posted"}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthView({ history }: { history: DayHistory[] }) {
  // Build a calendar grid — pad to start on the correct weekday
  const firstDate = new Date(history[0].date + "T12:00:00");
  const startDow = firstDate.getDay(); // 0=Sun
  const padded: (DayHistory | null)[] = [
    ...Array(startDow).fill(null),
    ...history,
  ];

  // Fill remaining cells to complete the last week
  while (padded.length % 7 !== 0) {
    padded.push(null);
  }

  const weeks: (DayHistory | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-[10px] text-zinc-600 uppercase text-center"
          >
            {d}
          </div>
        ))}
      </div>
      {/* Weeks */}
      <div className="grid grid-cols-7 gap-1.5">
        {padded.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="w-full aspect-square" />;
          }

          const s = dayStatus(day);
          const isToday = day.date === today;

          return (
            <div
              key={day.date}
              className={`aspect-square rounded-md border ${s.border} ${s.bg} flex items-center justify-center ${
                isToday ? "ring-1 ring-zinc-500" : ""
              }`}
              title={`${day.date}: ${s.tooltip}`}
            >
              <span className={`text-xs font-medium ${s.color}`}>
                {dayNum(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HistoryStrip({
  weekHistory,
  monthHistory,
}: {
  weekHistory: DayHistory[];
  monthHistory: DayHistory[];
}) {
  const [view, setView] = useState<"week" | "month">("week");

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          History
        </h3>
        <div className="flex bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === "week"
                ? "bg-zinc-700 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === "month"
                ? "bg-zinc-700 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-400"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {view === "week" ? (
        <WeekView history={weekHistory} />
      ) : (
        <MonthView history={monthHistory} />
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center">
        {["Drafted", "Quality", "Posted"].map((label) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-zinc-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

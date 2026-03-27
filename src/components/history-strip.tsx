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
      color: "text-text-muted",
      bg: "bg-surface-raised",
      border: "border-border",
      tooltip: "No draft generated",
    };
  }
  if (day.checksPassed === false) {
    return {
      color: "text-red",
      bg: "bg-red-bg",
      border: "border-red-border",
      tooltip: "Quality checks failed",
    };
  }
  if (day.posted) {
    return {
      color: "text-green",
      bg: "bg-green-bg",
      border: "border-green-border",
      tooltip: "Posted to #done-today",
    };
  }
  if (day.checksPassed === null) {
    return {
      color: "text-blue",
      bg: "bg-blue-bg",
      border: "border-blue-border",
      tooltip: "Draft generated, quality pending",
    };
  }
  return {
    color: "text-amber",
    bg: "bg-amber-bg",
    border: "border-amber-border",
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
            <span className="text-[10px] text-text-muted uppercase font-medium">
              {dayLabel(day.date)}
            </span>
            <div
              className={`w-10 h-10 rounded-lg border ${s.border} ${s.bg} flex items-center justify-center ${
                isToday ? "ring-1 ring-text-muted" : ""
              }`}
            >
              <span className={`text-sm font-medium ${s.color}`}>
                {dayNum(day.date)}
              </span>
            </div>
            <div className="flex gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${day.drafted ? "bg-green" : "bg-surface-raised"}`}
                title={day.drafted ? "Drafted" : "Not drafted"}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  day.checksPassed === true
                    ? "bg-green"
                    : day.checksPassed === false
                      ? "bg-red"
                      : "bg-surface-raised"
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
                className={`w-1.5 h-1.5 rounded-full ${day.posted ? "bg-green" : "bg-surface-raised"}`}
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
  const firstDate = new Date(history[0].date + "T12:00:00");
  const startDow = firstDate.getDay();
  const padded: (DayHistory | null)[] = [
    ...Array(startDow).fill(null),
    ...history,
  ];

  while (padded.length % 7 !== 0) {
    padded.push(null);
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-[10px] text-text-muted uppercase text-center font-medium"
          >
            {d}
          </div>
        ))}
      </div>
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
              className={`aspect-square rounded-lg border ${s.border} ${s.bg} flex items-center justify-center ${
                isToday ? "ring-1 ring-text-muted" : ""
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
    <div className="rounded-[10px] border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
          History
        </h3>
        <div className="flex bg-bg rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === "week"
                ? "bg-surface-raised text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              view === "month"
                ? "bg-surface-raised text-text-primary"
                : "text-text-muted hover:text-text-secondary"
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

      <div className="flex gap-4 mt-4 justify-center">
        {["Drafted", "Quality", "Posted"].map((label) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            <span className="text-[10px] text-text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

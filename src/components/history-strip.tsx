"use client";

import { useState } from "react";
import type { DayHistory } from "@/lib/types";

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function dayNum(dateStr: string): string {
  return dateStr.split("-")[2].replace(/^0/, "");
}

function formatDateRange(history: DayHistory[]): string {
  if (history.length === 0) return "";
  const first = new Date(history[0].date + "T12:00:00");
  const last = new Date(history[history.length - 1].date + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${first.toLocaleDateString("en-US", opts)} – ${last.toLocaleDateString("en-US", opts)}`;
}

function formatMonth(history: DayHistory[]): string {
  if (history.length === 0) return "";
  const d = new Date(history[0].date + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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
      tooltip: "Drafted ✓ · Quality ✕ · Not posted",
    };
  }
  if (day.posted) {
    return {
      color: "text-green",
      bg: "bg-green-bg",
      border: "border-green-border",
      tooltip: "Drafted ✓ · Quality ✓ · Posted ✓",
    };
  }
  if (day.checksPassed === null) {
    return {
      color: "text-blue",
      bg: "bg-blue-bg",
      border: "border-blue-border",
      tooltip: "Drafted ✓ · Quality pending · Not posted",
    };
  }
  return {
    color: "text-amber",
    bg: "bg-amber-bg",
    border: "border-amber-border",
    tooltip: "Drafted ✓ · Quality ✓ · Not posted",
  };
}

const today = new Date().toISOString().split("T")[0];

function WeekView({ history }: { history: DayHistory[] }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {history.map((day) => {
        const s = dayStatus(day);
        const isToday = day.date === today;

        return (
          <div
            key={day.date}
            className="flex flex-col items-center gap-1.5"
            title={s.tooltip}
          >
            <span className="text-[10px] text-text-muted uppercase font-medium">
              {dayLabel(day.date)}
            </span>
            <div
              className={`w-full aspect-square border ${s.border} ${s.bg} flex items-center justify-center ${
                isToday ? "ring-1 ring-text-muted" : ""
              }`}
            >
              <span className={`text-sm font-medium ${s.color}`}>
                {dayNum(day.date)}
              </span>
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
              className={`aspect-square  border ${s.border} ${s.bg} flex items-center justify-center ${
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

const legendItems = [
  { label: "Drafted" },
  { label: "Quality" },
  { label: "Posted" },
];

export function HistoryStrip({
  weekHistory,
  monthHistory,
}: {
  weekHistory: DayHistory[];
  monthHistory: DayHistory[];
}) {
  const [view, setView] = useState<"week" | "month">("week");

  const dateLabel =
    view === "week"
      ? formatDateRange(weekHistory)
      : formatMonth(monthHistory);

  return (
    <div className=" border border-border bg-surface p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">
            History
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">{dateLabel}</p>
        </div>
        <div className="flex bg-bg  p-0.5 border border-border">
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1 text-xs font-medium  transition-colors ${
              view === "week"
                ? "bg-surface-raised text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            className={`px-3 py-1 text-xs font-medium  transition-colors ${
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

    </div>
  );
}

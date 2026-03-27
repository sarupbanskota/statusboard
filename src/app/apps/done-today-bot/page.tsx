import Link from "next/link";
import { Pipeline } from "@/components/pipeline";
import { QualityChecks } from "@/components/quality-checks";
import { HistoryStrip } from "@/components/history-strip";
import {
  mockPipeline,
  mockQualityChecks,
  mockHistoryWeek,
  mockHistoryMonth,
} from "@/lib/mock-data";

export default function DoneTodayBotPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          ← Back to overview
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-3">
          Done Today Bot
        </h1>
        <p className="text-zinc-500 mt-1">
          Slack bot that generates daily done-today summaries
        </p>
      </div>

      {/* Panels */}
      <div className="space-y-6">
        <Pipeline stages={mockPipeline} />
        <QualityChecks checks={mockQualityChecks} />
        <HistoryStrip weekHistory={mockHistoryWeek} monthHistory={mockHistoryMonth} />
      </div>
    </main>
  );
}

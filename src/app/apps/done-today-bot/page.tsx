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
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          ← Back to overview
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mt-3">
          Done Today Bot
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Slack bot that generates daily done-today summaries
        </p>
      </div>

      <div className="space-y-4">
        <Pipeline stages={mockPipeline} />
        <QualityChecks checks={mockQualityChecks} />
        <HistoryStrip weekHistory={mockHistoryWeek} monthHistory={mockHistoryMonth} />
      </div>
    </main>
  );
}

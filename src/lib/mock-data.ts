// Types

export type PipelineStage = {
  id: string;
  label: string;
  status: "complete" | "active" | "pending" | "failed";
  detail: string;
  completedAt?: string;
};

export type SubCheck = {
  name: string;
  status: "pass" | "fail" | "warn";
};

export type QualityCheck = {
  id: string;
  name: string;
  description: string;
  category: "integration" | "eval" | "functional";
  status: "pass" | "fail" | "warn";
  severity: "critical" | "warning";
  durationMs?: number;
  detail?: string;
  subChecks?: SubCheck[];
  logUrl?: string;
  checkedAt: string;
};

export type DayHistory = {
  date: string;
  drafted: boolean;
  checksPassed: boolean | null; // null = not run
  posted: boolean;
};

// Mock data — represents a typical day where the bot is mid-pipeline

export const mockPipeline: PipelineStage[] = [
  {
    id: "sources",
    label: "Sources",
    status: "complete",
    detail: "Slack (12 msgs) ·  Gmail (4 emails) ·  Calendar (3 events) ·  GitHub (7 commits)",
    completedAt: "2026-03-27T07:00:32-07:00",
  },
  {
    id: "draft",
    label: "Draft",
    status: "complete",
    detail: "Generated 5 bullets from 26 raw items",
    completedAt: "2026-03-27T07:00:38-07:00",
  },
  {
    id: "enrichment",
    label: "Enrichment",
    status: "active",
    detail: "WhatsApp ✓ (2 convos) ·  Claude Code pending",
    completedAt: undefined,
  },
  {
    id: "review",
    label: "Review",
    status: "pending",
    detail: "Waiting for enrichment to complete",
  },
  {
    id: "posted",
    label: "Posted",
    status: "pending",
    detail: "Will post to #done-today after approval",
  },
];

export const mockQualityChecks: QualityCheck[] = [
  // Integration checks
  {
    id: "health-check",
    name: "Health endpoint",
    description: "Railway deployment responds to /health with expected fields",
    category: "integration",
    status: "pass",
    severity: "critical",
    durationMs: 142,
    logUrl: "https://railway.app/project/done-today-bot/logs",
    checkedAt: "2026-03-27T07:01:00-07:00",
  },
  {
    id: "format-validation",
    name: "Format validation",
    description: "Date header, bullet chars (● / ○), and sub-bullet indentation",
    category: "integration",
    status: "pass",
    severity: "warning",
    durationMs: 3,
    detail: "Date header, bullet chars, sub-bullet indent all correct",
    checkedAt: "2026-03-27T07:01:00-07:00",
  },
  {
    id: "confidential-keyword-scan",
    name: "BD confidentiality scan",
    description: "Scans for banned confidential terms that should never appear in output",
    category: "integration",
    status: "pass",
    severity: "critical",
    durationMs: 5,
    checkedAt: "2026-03-27T07:01:00-07:00",
  },
  {
    id: "vague-language-scan",
    name: "Vague language scan",
    description: "Flags corporate filler like \"strategy discussion\" or \"process optimization\"",
    category: "integration",
    status: "warn",
    severity: "warning",
    durationMs: 4,
    detail: "\"process optimization\" found in bullet 3 — consider being more specific",
    checkedAt: "2026-03-27T07:01:00-07:00",
  },
  {
    id: "em-dash-check",
    name: "Em-dash detection",
    description: "Ensures regular dashes (-) are used instead of Unicode em-dashes (\u2014)",
    category: "integration",
    status: "pass",
    severity: "warning",
    durationMs: 2,
    checkedAt: "2026-03-27T07:01:00-07:00",
  },
  {
    id: "no-verbatim-subjects",
    name: "No verbatim subjects",
    description: "Bullets describe activity, not copy-paste email subject lines",
    category: "integration",
    status: "pass",
    severity: "warning",
    durationMs: 8,
    checkedAt: "2026-03-27T07:01:00-07:00",
  },
  // Eval checks (LLM-judged)
  {
    id: "ai-rule-compliance",
    name: "Rule compliance",
    description: "LLM evaluates the draft against 10 writing and confidentiality rules",
    category: "eval",
    status: "warn",
    severity: "warning",
    durationMs: 4200,
    detail: "8/10 rules passed",
    subChecks: [
      { name: "No verbatim subjects", status: "pass" },
      { name: "No vague language", status: "pass" },
      { name: "No trivial standalone items", status: "fail" },
      { name: "Quality over quantity", status: "pass" },
      { name: "No em-dashes", status: "pass" },
      { name: "BD confidentiality", status: "pass" },
      { name: "No financial figures", status: "pass" },
      { name: "No negotiation details", status: "pass" },
      { name: "Every bullet specific", status: "pass" },
      { name: "Proportionality", status: "fail" },
    ],
    checkedAt: "2026-03-27T07:01:05-07:00",
  },
  {
    id: "ai-accuracy",
    name: "Accuracy",
    description: "Verifies every bullet traces to raw source data with no fabrications",
    category: "eval",
    status: "pass",
    severity: "warning",
    durationMs: 3800,
    detail: "All 5 bullets traced to raw source data. No fabrications detected.",
    checkedAt: "2026-03-27T07:01:09-07:00",
  },
  {
    id: "ai-confidentiality",
    name: "Confidentiality",
    description: "Semantic analysis for confidential leaks that keyword scan might miss",
    category: "eval",
    status: "pass",
    severity: "critical",
    durationMs: 5100,
    detail: "No confidential leaks. BD language used appropriately.",
    checkedAt: "2026-03-27T07:01:14-07:00",
  },
  // Functional tests
  {
    id: "approval-flow",
    name: "Approval flow",
    description: "Reacting with \ud83d\udc4d or saying \"lgtm\" posts the draft to #done-today",
    category: "functional",
    status: "pass",
    severity: "critical",
    durationMs: 1200,
    detail: "Draft posted to #done-today within 2s of approval",
    checkedAt: "2026-03-27T07:02:00-07:00",
  },
  {
    id: "feedback-revision",
    name: "Feedback revision",
    description: "Replying with feedback in the thread produces a revised draft",
    category: "functional",
    status: "pass",
    severity: "warning",
    durationMs: 3400,
    detail: "Revised draft incorporated feedback and wrapped in <draft> tags",
    checkedAt: "2026-03-27T07:02:04-07:00",
  },
  {
    id: "channel-targeting",
    name: "Channel targeting",
    description: "Drafts go to #sarup-daily-drafts, approved posts go to #done-today",
    category: "functional",
    status: "pass",
    severity: "critical",
    durationMs: 800,
    checkedAt: "2026-03-27T07:02:05-07:00",
  },
  {
    id: "source-collection",
    name: "Source collection",
    description: "All 4 remote sources (Slack, Gmail, Calendar, GitHub) return data",
    category: "functional",
    status: "fail",
    severity: "critical",
    durationMs: 5400,
    detail: "Slack: 12 msgs, Gmail: 0 emails (API error 401), Calendar: 3 events, GitHub: 7 commits",
    checkedAt: "2026-03-27T07:02:07-07:00",
  },
  {
    id: "enrichment-pipeline",
    name: "Enrichment pipeline",
    description: "Local sources (WhatsApp, Claude Code) post enrichment via /enrich endpoint",
    category: "functional",
    status: "warn",
    severity: "warning",
    durationMs: 1500,
    detail: "WhatsApp enrichment received. Claude Code enrichment timed out.",
    checkedAt: "2026-03-27T07:02:09-07:00",
  },
  {
    id: "access-control",
    name: "Access control",
    description: "Only authorized Slack user can interact; others get rejection",
    category: "functional",
    status: "pass",
    severity: "critical",
    durationMs: 600,
    checkedAt: "2026-03-27T07:02:10-07:00",
  },
];

export const mockHistoryWeek: DayHistory[] = [
  { date: "2026-03-21", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-22", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-23", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-24", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-25", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-26", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-27", drafted: true, checksPassed: null, posted: false },
];

export const mockHistoryMonth: DayHistory[] = [
  { date: "2026-03-01", drafted: false, checksPassed: null, posted: false }, // Sun
  { date: "2026-03-02", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-03", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-04", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-05", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-06", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-07", drafted: false, checksPassed: null, posted: false }, // Sat
  { date: "2026-03-08", drafted: false, checksPassed: null, posted: false }, // Sun
  { date: "2026-03-09", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-10", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-11", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-12", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-13", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-14", drafted: false, checksPassed: null, posted: false }, // Sat
  { date: "2026-03-15", drafted: false, checksPassed: null, posted: false }, // Sun
  { date: "2026-03-16", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-17", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-18", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-19", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-20", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-21", drafted: false, checksPassed: null, posted: false }, // Sat
  { date: "2026-03-22", drafted: true, checksPassed: true, posted: true },  // Sun but worked
  { date: "2026-03-23", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-24", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-25", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-26", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-27", drafted: true, checksPassed: null, posted: false }, // Today
];

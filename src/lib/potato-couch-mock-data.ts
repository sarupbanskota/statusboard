import type { PipelineStage, QualityCheck, DayHistory } from "./mock-data";

// Pipeline: shows the most recent video analysis (mid-failure state to reflect current bug)
export const potatoCouchPipeline: PipelineStage[] = [
  {
    id: "detect",
    label: "Detect",
    status: "complete",
    detail: "YouTube link in #shipped by Emily · youtu.be/7I3G21RyARs",
    completedAt: "2026-03-26T18:15:02-07:00",
  },
  {
    id: "react",
    label: "React",
    status: "complete",
    detail: "Added :eyes: to original message",
    completedAt: "2026-03-26T18:15:03-07:00",
  },
  {
    id: "transcript",
    label: "Transcript",
    status: "failed",
    detail:
      "youtube-transcript-plus: blocked · HTML scrape: blocked · Supadata API: 200 OK but empty segments",
    completedAt: "2026-03-26T18:15:18-07:00",
  },
  {
    id: "analysis",
    label: "Analysis",
    status: "complete",
    detail:
      'Claude returned "not mentioned" — likely analyzing empty transcript',
    completedAt: "2026-03-26T18:15:22-07:00",
  },
  {
    id: "post",
    label: "Post",
    status: "complete",
    detail:
      "Posted to thread: \"Watched it — we\'re not mentioned in this one.\" No emoji added.",
    completedAt: "2026-03-26T18:15:23-07:00",
  },
];

export const potatoCouchQualityChecks: QualityCheck[] = [
  // Integration checks
  {
    id: "slack-connection",
    name: "Slack connection",
    description: "Socket Mode connection is active and receiving events",
    category: "integration",
    status: "pass",
    severity: "critical",
    durationMs: 85,
    checkedAt: "2026-03-27T10:00:00-07:00",
  },
  {
    id: "yt-transcript-plus",
    name: "youtube-transcript-plus",
    description:
      "Free scraping library can fetch transcripts from YouTube",
    category: "integration",
    status: "fail",
    severity: "critical",
    durationMs: 3200,
    detail:
      "Blocked by YouTube — returns 403 on all tested videos. Has been failing since ~Mar 20.",
    logUrl: "https://github.com/nicholasgasior/youtube-transcript-plus/issues",
    checkedAt: "2026-03-27T10:00:03-07:00",
  },
  {
    id: "html-scrape",
    name: "HTML caption scrape",
    description:
      "Custom scraper extracts caption tracks from YouTube watch page",
    category: "integration",
    status: "fail",
    severity: "critical",
    durationMs: 2800,
    detail:
      "Caption track URLs found but JSON3 and XML endpoints both return empty/malformed responses",
    checkedAt: "2026-03-27T10:00:06-07:00",
  },
  {
    id: "supadata-api",
    name: "Supadata API",
    description: "Paid transcript API returns segments with timestamps",
    category: "integration",
    status: "warn",
    severity: "warning",
    durationMs: 1400,
    detail:
      "API responds 200 but returns empty segments array for some videos. Works on ~40% of tested URLs.",
    checkedAt: "2026-03-27T10:00:08-07:00",
  },
  {
    id: "metadata-fetch",
    name: "Metadata fetch",
    description: "oEmbed API returns title and author for YouTube URLs",
    category: "integration",
    status: "pass",
    severity: "warning",
    durationMs: 210,
    checkedAt: "2026-03-27T10:00:08-07:00",
  },
  {
    id: "description-fetch",
    name: "Description extraction",
    description:
      "Watch page scraping extracts video description for link detection",
    category: "integration",
    status: "pass",
    severity: "warning",
    durationMs: 680,
    detail: "Description extracted via meta tag fallback (JSON embed failed)",
    checkedAt: "2026-03-27T10:00:09-07:00",
  },
  // Eval checks (Claude analysis quality)
  {
    id: "mention-detection",
    name: "Mention detection",
    description:
      "Claude correctly identifies CodeCrafters mentions in transcript + description",
    category: "eval",
    status: "fail",
    severity: "critical",
    durationMs: 4600,
    detail:
      "0/3 known mentions detected in last 5 videos — likely caused by empty transcripts being passed to Claude",
    subChecks: [
      { name: "Direct name mention", status: "fail" },
      { name: "Affiliate link in description", status: "pass" },
      { name: "Indirect reference (\"build X from scratch\")", status: "fail" },
      { name: "Sponsor segment detection", status: "fail" },
    ],
    checkedAt: "2026-03-27T10:00:14-07:00",
  },
  {
    id: "sentiment-accuracy",
    name: "Sentiment classification",
    description:
      "Positive/neutral/negative classification matches human judgment",
    category: "eval",
    status: "warn",
    severity: "warning",
    durationMs: 3200,
    detail:
      "Cannot evaluate — no mentions detected in recent videos to classify",
    checkedAt: "2026-03-27T10:00:17-07:00",
  },
  // Functional checks
  {
    id: "eyes-reaction",
    name: "Eyes reaction",
    description:
      "Bot immediately adds :eyes: when a YouTube link is detected",
    category: "functional",
    status: "pass",
    severity: "warning",
    durationMs: 340,
    detail: "Reaction added within 1s of message event",
    checkedAt: "2026-03-27T10:01:00-07:00",
  },
  {
    id: "status-updates",
    name: "Status updates",
    description:
      "Bot posts intermediate status messages as it falls through transcript approaches",
    category: "functional",
    status: "pass",
    severity: "warning",
    durationMs: 820,
    detail:
      "All 3 status messages posted correctly: initial try, scrape fallback, paid API fallback",
    checkedAt: "2026-03-27T10:01:01-07:00",
  },
  {
    id: "emoji-intensity",
    name: "Emoji intensity mapping",
    description:
      "Reaction emojis match mention intensity (none / :+1: / :fire::tada: / :fire::tada::rocket:)",
    category: "functional",
    status: "warn",
    severity: "warning",
    durationMs: 150,
    detail:
      "Cannot verify — no positive mentions in recent videos to trigger intensity emojis",
    checkedAt: "2026-03-27T10:01:01-07:00",
  },
  {
    id: "thread-posting",
    name: "Thread posting",
    description: "Analysis results posted as threaded reply to original message",
    category: "functional",
    status: "pass",
    severity: "critical",
    durationMs: 480,
    checkedAt: "2026-03-27T10:01:02-07:00",
  },
  {
    id: "error-dm",
    name: "Admin error DM",
    description:
      "Errors and credit-exhaustion send detailed DM to admin with stack trace",
    category: "functional",
    status: "pass",
    severity: "warning",
    durationMs: 620,
    checkedAt: "2026-03-27T10:01:02-07:00",
  },
];

// History: detected = video link found, checksPassed = transcript fetched OK, posted = analysis posted
// Reflects the recent pattern where transcript fetching started failing around Mar 20
export const potatoCouchHistoryWeek: DayHistory[] = [
  { date: "2026-03-21", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-22", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-23", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-24", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-25", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-26", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-27", drafted: true, checksPassed: false, posted: false },
];

export const potatoCouchHistoryMonth: DayHistory[] = [
  { date: "2026-03-01", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-02", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-03", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-04", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-05", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-06", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-07", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-08", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-09", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-10", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-11", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-12", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-13", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-14", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-15", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-16", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-17", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-18", drafted: true, checksPassed: true, posted: true },
  { date: "2026-03-19", drafted: true, checksPassed: true, posted: true },
  // Transcript fetching starts failing around here
  { date: "2026-03-20", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-21", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-22", drafted: false, checksPassed: null, posted: false },
  { date: "2026-03-23", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-24", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-25", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-26", drafted: true, checksPassed: false, posted: false },
  { date: "2026-03-27", drafted: true, checksPassed: false, posted: false },
];

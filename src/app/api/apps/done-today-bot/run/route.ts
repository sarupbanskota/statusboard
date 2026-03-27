import { NextResponse } from "next/server";
import { getDoneTodayBotData } from "@/lib/done-today-bot";

export const dynamic = "force-dynamic";

export async function POST() {
  // Re-fetch latest data from Railway (tests run on CI schedule)
  const data = await getDoneTodayBotData();
  return NextResponse.json(data);
}

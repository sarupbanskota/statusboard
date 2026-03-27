import { NextResponse } from "next/server";
import { getDoneTodayBotData } from "@/lib/done-today-bot";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDoneTodayBotData();
  return NextResponse.json(data);
}

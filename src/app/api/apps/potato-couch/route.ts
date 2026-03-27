import { NextResponse } from "next/server";
import { getPotatoCouchData } from "@/lib/potato-couch";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPotatoCouchData();
  return NextResponse.json(data);
}

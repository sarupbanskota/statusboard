import { NextResponse } from "next/server";
import { getPotatoCouchData } from "@/lib/potato-couch";

export const dynamic = "force-dynamic";

export async function POST() {
  const data = await getPotatoCouchData();
  return NextResponse.json(data);
}

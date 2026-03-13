import { NextResponse } from "next/server";
import { getSessions } from "@/lib/studio";

export function GET() {
  const sessions = getSessions();
  return NextResponse.json({ sessions });
}

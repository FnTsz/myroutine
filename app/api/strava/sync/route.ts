import { NextResponse } from "next/server";
import { syncStravaActivities } from "@/lib/strava";

export async function POST() {
  try {
    const result = await syncStravaActivities();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

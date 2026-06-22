import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { habitLogs } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const since = format(subDays(new Date(), 365), "yyyy-MM-dd");

    const logs = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, Number(id)), gte(habitLogs.date, since)));

    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

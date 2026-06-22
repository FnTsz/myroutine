import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { hydrationLogs } from "@/db/schema";
import { eq, gte, desc } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const days = searchParams.get("days");

    if (days) {
      const since = format(subDays(new Date(), Number(days)), "yyyy-MM-dd");
      const logs = await db
        .select()
        .from(hydrationLogs)
        .where(gte(hydrationLogs.date, since))
        .orderBy(desc(hydrationLogs.date));
      return NextResponse.json(logs);
    }

    if (date) {
      const rows = await db.select().from(hydrationLogs).where(eq(hydrationLogs.date, date)).limit(1);
      return NextResponse.json(rows[0] ?? { amountMl: 0 });
    }

    return NextResponse.json({ amountMl: 0 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, amountMl, set } = await req.json();

    const existing = await db.select().from(hydrationLogs).where(eq(hydrationLogs.date, date)).limit(1);

    if (existing.length > 0) {
      const newAmount = set ? amountMl : existing[0].amountMl + amountMl;
      const updated = await db
        .update(hydrationLogs)
        .set({ amountMl: newAmount })
        .where(eq(hydrationLogs.id, existing[0].id))
        .returning();
      return NextResponse.json(updated[0]);
    }

    const result = await db.insert(hydrationLogs).values({ date, amountMl }).returning();
    return NextResponse.json(result[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

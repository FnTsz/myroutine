import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { sleepLogs } from "@/db/schema";
import { eq, gte, desc } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") ?? "90");
    const since = format(subDays(new Date(), days), "yyyy-MM-dd");

    const logs = await db
      .select()
      .from(sleepLogs)
      .where(gte(sleepLogs.date, since))
      .orderBy(sleepLogs.date);

    return NextResponse.json(logs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const existing = await db
      .select()
      .from(sleepLogs)
      .where(eq(sleepLogs.date, body.date))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(sleepLogs)
        .set({ score: body.score, notes: body.notes ?? null })
        .where(eq(sleepLogs.id, existing[0].id))
        .returning();
      return NextResponse.json(updated[0]);
    }

    const result = await db.insert(sleepLogs).values({
      date: body.date,
      score: body.score,
      notes: body.notes ?? null,
    }).returning();
    return NextResponse.json(result[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
    await db.delete(sleepLogs).where(eq(sleepLogs.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

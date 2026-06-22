import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { habitLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { today } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const habitId = Number(id);
    const body = req.headers.get("content-type")?.includes("application/json")
      ? await req.json().catch(() => ({}))
      : {};
    const date = body.date ?? today();

    const existing = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date)))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(habitLogs)
        .set({ completed: !existing[0].completed })
        .where(eq(habitLogs.id, existing[0].id))
        .returning();
      return NextResponse.json(updated[0]);
    } else {
      const created = await db
        .insert(habitLogs)
        .values({ habitId, date, completed: true })
        .returning();
      return NextResponse.json(created[0]);
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

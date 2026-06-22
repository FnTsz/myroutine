import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { habits, habitLogs } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // YYYY-MM
    if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });

    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const firstDay = `${month}-01`;
    const lastDay = `${month}-${String(daysInMonth).padStart(2, "0")}`;

    const allHabits = await db.select().from(habits).where(eq(habits.active, true));

    const allLogs = await db
      .select()
      .from(habitLogs)
      .where(and(gte(habitLogs.date, firstDay), lte(habitLogs.date, lastDay)));

    const result = allHabits.map((h) => {
      const logs: Record<number, boolean> = {};
      allLogs
        .filter((l) => l.habitId === h.id)
        .forEach((l) => {
          logs[Number(l.date.split("-")[2])] = l.completed;
        });
      return { id: h.id, name: h.name, color: h.color, logs };
    });

    return NextResponse.json({ habits: result, daysInMonth });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

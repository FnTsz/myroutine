import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { hydrationLogs, habits, habitLogs } from "@/db/schema";
import { eq, gte, desc, and } from "drizzle-orm";
import { subDays, format } from "date-fns";

const HYDRATION_GOAL = 3000;

// Ao atingir a meta de água, marca o hábito "Água" automaticamente naquele dia
async function checkWaterHabit(date: string) {
  const all = await db.select().from(habits).where(eq(habits.active, true));
  const habit = all.find((h) => {
    const n = h.name.trim().toLowerCase();
    return n === "água" || n === "agua";
  });
  if (!habit) return;

  const existing = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habit.id), eq(habitLogs.date, date)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(habitLogs).values({ habitId: habit.id, date, completed: true });
  } else if (!existing[0].completed) {
    await db.update(habitLogs).set({ completed: true }).where(eq(habitLogs.id, existing[0].id));
  }
}

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
      if (newAmount >= HYDRATION_GOAL) await checkWaterHabit(date);
      return NextResponse.json(updated[0]);
    }

    const result = await db.insert(hydrationLogs).values({ date, amountMl }).returning();
    if (amountMl >= HYDRATION_GOAL) await checkWaterHabit(date);
    return NextResponse.json(result[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

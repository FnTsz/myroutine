import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { workoutLogs, habits, habitLogs } from "@/db/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

// Cada categoria de treino marca automaticamente o hábito correspondente
const CATEGORY_HABIT: Record<string, string> = {
  corrida: "Correr",
  mobilidade: "Mobilidade",
  outro: "Exercicio",
};

async function checkHabitForCategory(category: string, date: string) {
  const habitName = CATEGORY_HABIT[category] ?? CATEGORY_HABIT.outro;
  const habit = await db
    .select()
    .from(habits)
    .where(and(eq(habits.name, habitName), eq(habits.active, true)))
    .limit(1);
  if (habit.length === 0) return;

  const existing = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habit[0].id), eq(habitLogs.date, date)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(habitLogs).values({ habitId: habit[0].id, date, completed: true });
  } else if (!existing[0].completed) {
    await db.update(habitLogs).set({ completed: true }).where(eq(habitLogs.id, existing[0].id));
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = db.select().from(workoutLogs);
    if (from && to) {
      query = query.where(and(gte(workoutLogs.date, from), lte(workoutLogs.date, to))) as typeof query;
    }

    const workouts = await query.orderBy(desc(workoutLogs.date));
    return NextResponse.json({ workouts });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = body.category ?? "outro";
    const result = await db.insert(workoutLogs).values({
      date: body.date,
      name: body.name,
      category,
      durationMin: body.durationMin ?? null,
      calories: body.calories ?? null,
    }).returning();
    await checkHabitForCategory(category, body.date);
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
    await db.delete(workoutLogs).where(eq(workoutLogs.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

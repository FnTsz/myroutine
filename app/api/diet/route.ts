import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { meals, dietConfig } from "@/db/schema";
import { eq, gte, desc } from "drizzle-orm";
import { subDays, format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const since = searchParams.get("since") ?? format(subDays(new Date(), 7), "yyyy-MM-dd");

    let mealsList;
    if (date) {
      mealsList = await db.select().from(meals).where(eq(meals.date, date)).orderBy(meals.mealType);
    } else {
      mealsList = await db.select().from(meals).where(gte(meals.date, since)).orderBy(desc(meals.date));
    }

    const config = await db.select().from(dietConfig).limit(1);
    return NextResponse.json({
      meals: mealsList,
      dailyGoal: config[0]?.dailyGoal ?? 2000,
      proteinGoal: config[0]?.proteinGoal ?? 150,
      carbsGoal: config[0]?.carbsGoal ?? 250,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "config") {
      const values = {
        dailyGoal: body.dailyGoal,
        proteinGoal: body.proteinGoal,
        carbsGoal: body.carbsGoal,
      };
      const existing = await db.select().from(dietConfig).limit(1);
      if (existing.length > 0) {
        await db.update(dietConfig).set(values);
      } else {
        await db.insert(dietConfig).values(values);
      }
      return NextResponse.json({ ok: true });
    }

    const result = await db.insert(meals).values({
      date: body.date,
      mealType: body.mealType,
      description: body.description,
      calories: body.calories ?? null,
      protein: body.protein ?? null,
      carbs: body.carbs ?? null,
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
    await db.delete(meals).where(eq(meals.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

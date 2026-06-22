import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { trainingPlans, stravaActivities } from "@/db/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let plansQuery = db.select().from(trainingPlans);
    let activitiesQuery = db.select().from(stravaActivities);

    if (from && to) {
      plansQuery = plansQuery.where(and(gte(trainingPlans.date, from), lte(trainingPlans.date, to))) as typeof plansQuery;
      activitiesQuery = activitiesQuery.where(and(gte(stravaActivities.date, from), lte(stravaActivities.date, to))) as typeof activitiesQuery;
    }

    const [plans, activities] = await Promise.all([
      plansQuery.orderBy(trainingPlans.date),
      activitiesQuery.orderBy(desc(stravaActivities.date)),
    ]);

    return NextResponse.json({ plans, activities });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db.insert(trainingPlans).values({
      date: body.date,
      title: body.title,
      description: body.description ?? null,
      type: body.type ?? "run",
      plannedDistance: body.plannedDistance ?? null,
      plannedDuration: body.plannedDuration ?? null,
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
    await db.delete(trainingPlans).where(eq(trainingPlans.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

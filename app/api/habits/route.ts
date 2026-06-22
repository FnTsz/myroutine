import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { habits, habitLogs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { today } from "@/lib/utils";

export async function GET() {
  try {
    const all = await db.select().from(habits).where(eq(habits.active, true)).orderBy(desc(habits.createdAt));
    const todayStr = today();

    const withLogs = await Promise.all(
      all.map(async (h) => {
        const log = await db
          .select()
          .from(habitLogs)
          .where(and(eq(habitLogs.habitId, h.id), eq(habitLogs.date, todayStr)))
          .limit(1);

        // Calculate streak
        const logs = await db
          .select()
          .from(habitLogs)
          .where(and(eq(habitLogs.habitId, h.id), eq(habitLogs.completed, true)))
          .orderBy(desc(habitLogs.date));

        let streak = 0;
        const today_ = new Date();
        for (let i = 0; i < logs.length; i++) {
          const logDate = new Date(logs[i].date);
          const diff = Math.round((today_.getTime() - logDate.getTime()) / 86400000);
          if (diff === i || diff === i + 1) streak++;
          else break;
        }

        return {
          ...h,
          completedToday: log[0]?.completed ?? false,
          streak,
        };
      })
    );

    return NextResponse.json(withLogs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db.insert(habits).values({
      name: body.name,
      frequency: body.frequency ?? "daily",
      frequencyDays: body.frequencyDays ?? 1,
      color: body.color ?? "#6366f1",
    }).returning();
    return NextResponse.json(result[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { entertainment } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const items = type
      ? await db.select().from(entertainment).where(eq(entertainment.type, type)).orderBy(desc(entertainment.createdAt))
      : await db.select().from(entertainment).orderBy(desc(entertainment.createdAt));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim() || !body.type) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }
    const result = await db.insert(entertainment).values({
      type: body.type,
      name: body.name.trim(),
      author: body.author ?? null,
      date: body.date ?? null,
      rating: body.rating ?? null,
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
    await db.delete(entertainment).where(eq(entertainment.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

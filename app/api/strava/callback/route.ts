import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { stravaTokens } from "@/db/schema";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect("/training?strava=denied");
  }

  try {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Token exchange failed");

    await db.delete(stravaTokens);
    await db.insert(stravaTokens).values({
      athleteId: data.athlete.id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    });

    return NextResponse.redirect("/training?strava=connected");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect("/training?strava=error");
  }
}

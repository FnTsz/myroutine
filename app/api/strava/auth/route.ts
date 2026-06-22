import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "STRAVA_CLIENT_ID not set" }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: process.env.STRAVA_REDIRECT_URI ?? "http://localhost:3000/api/strava/callback",
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });

  return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${params}`);
}

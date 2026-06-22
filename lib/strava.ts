import { db } from "@/db/client";
import { stravaTokens, stravaActivities } from "@/db/schema";
import { format } from "date-fns";

async function getValidToken() {
  const tokens = await db.select().from(stravaTokens).limit(1);
  if (tokens.length === 0) throw new Error("Strava not connected");

  const token = tokens[0];
  const nowSec = Math.floor(Date.now() / 1000);

  if (token.expiresAt > nowSec + 60) return token.accessToken;

  // Refresh
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Token refresh failed");

  await db.update(stravaTokens).set({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  });

  return data.access_token as string;
}

export async function syncStravaActivities(afterTimestamp?: number) {
  const accessToken = await getValidToken();

  const params = new URLSearchParams({
    per_page: "100",
    after: String(afterTimestamp ?? Math.floor(Date.now() / 1000) - 90 * 86400),
  });

  const res = await fetch(`https://www.strava.com/api/v3/athlete/activities?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Strava API error: ${res.status}`);
  const activities = await res.json();

  let imported = 0;
  for (const act of activities) {
    const date = format(new Date(act.start_date_local), "yyyy-MM-dd");
    const avgPace =
      act.distance > 0 && act.moving_time > 0
        ? act.moving_time / 60 / (act.distance / 1000)
        : null;

    try {
      await db
        .insert(stravaActivities)
        .values({
          stravaId: String(act.id),
          date,
          name: act.name,
          type: act.type.toLowerCase(),
          distance: act.distance,
          duration: act.moving_time,
          avgHeartRate: act.average_heartrate ?? null,
          avgPace,
          elevationGain: act.total_elevation_gain ?? null,
          rawData: JSON.stringify(act),
        })
        .onConflictDoNothing();
      imported++;
    } catch {
      // skip duplicates
    }
  }

  return { imported, total: activities.length };
}

export async function isStravaConnected(): Promise<boolean> {
  const tokens = await db.select().from(stravaTokens).limit(1);
  return tokens.length > 0;
}

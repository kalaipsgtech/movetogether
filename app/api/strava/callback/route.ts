import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");

  const tokenResponse = await fetch(
    "https://www.strava.com/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  const activitiesResponse = await fetch(
    "https://www.strava.com/api/v3/athlete/activities",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  );

  const activities = await activitiesResponse.json();

const athlete = tokenData.athlete;
  const { error } = await supabase
  .from("athletes")
  .upsert(
    {
      athlete_id: athlete.id,
      first_name: athlete.firstname,
      last_name: athlete.lastname,
      refresh_token: tokenData.refresh_token,
    },
    {
      onConflict: "athlete_id",
    }
  );

console.log("Supabase Error:", JSON.stringify(error, null, 2));
console.log("Athlete:", JSON.stringify(athlete, null, 2));

return NextResponse.redirect(
  `${process.env.NEXT_PUBLIC_SITE_URL}/connected?name=${athlete.firstname}`
);
}

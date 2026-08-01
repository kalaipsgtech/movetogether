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
  console.log("=== ACTIVITIES START ===");
console.log("Activities:", JSON.stringify(activities, null, 2));
  console.log("Activities:", activities);
  console.log(
  "Activities Response:",
  JSON.stringify(activities, null, 2)
);

console.log(
  "Is Array:",
  Array.isArray(activities)
);

console.log(
  "Activities Length:",
  Array.isArray(activities) ? activities.length : 0
);
  
  if (Array.isArray(activities) && activities.length > 0) {
  const activityRows = activities.map((activity) => ({
    athlete_id: tokenData.athlete.id,
    activity_id: activity.id,
    activity_name: activity.name,
    distance: activity.distance,
    moving_time: activity.moving_time,
    activity_date: activity.start_date,
  }));

  const { error: activitiesError } = await supabase
    .from("Activities")
    .upsert(activityRows, {
      onConflict: "activity_id",
    });

  console.log(
    "Activities Error:",
    JSON.stringify(activitiesError, null, 2)
  );
    console.log(
  "Activity Rows Count:",
  activityRows.length
);

console.log(
  "First Activity Row:",
  JSON.stringify(activityRows[0], null, 2)
);
}

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

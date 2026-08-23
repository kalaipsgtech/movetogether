import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY"
  );
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

type StravaWebhookEvent = {
  object_type: "activity" | "athlete";
  object_id: number;
  aspect_type: "create" | "update" | "delete";
  owner_id: number;
  subscription_id: number;
  event_time: number;
  updates?: {
    title?: string;
    type?: string;
    private?: string;
    authorized?: string;
  };
};

type AthleteTokenRow = {
  athlete_id: number;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
};

/*
  GET is used only when Strava verifies the
  webhook callback URL during subscription setup.
*/
export async function GET(
  request: NextRequest
) {
  const searchParams =
    request.nextUrl.searchParams;

  const mode =
    searchParams.get("hub.mode");

  const challenge =
    searchParams.get("hub.challenge");

  const receivedVerifyToken =
    searchParams.get("hub.verify_token");

  const expectedVerifyToken =
    process.env.STRAVA_WEBHOOK_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    challenge &&
    receivedVerifyToken ===
      expectedVerifyToken
  ) {
    console.log(
      "Strava webhook verification successful"
    );

    return NextResponse.json({
      "hub.challenge": challenge,
    });
  }

  console.error(
    "Strava webhook verification failed"
  );

  return NextResponse.json(
    {
      error:
        "Webhook verification failed",
    },
    {
      status: 403,
    }
  );
}

/*
  Refresh the Strava access token using the
  athlete's stored refresh token.

  This works even when access_token and expires_at
  are currently NULL for older athletes.
*/
async function refreshStravaToken(
  athlete: AthleteTokenRow
) {
  if (!athlete.refresh_token) {
    throw new Error(
      `No refresh token found for athlete ${athlete.athlete_id}`
    );
  }

  const clientId =
    process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;

  const clientSecret =
    process.env.STRAVA_CLIENT_SECRET;

  if (!clientId) {
    throw new Error(
      "Missing NEXT_PUBLIC_STRAVA_CLIENT_ID"
    );
  }

  if (!clientSecret) {
    throw new Error(
      "Missing STRAVA_CLIENT_SECRET"
    );
  }

  const tokenResponse = await fetch(
    "https://www.strava.com/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token:
          athlete.refresh_token,
      }),
      cache: "no-store",
    }
  );

  if (!tokenResponse.ok) {
    const errorText =
      await tokenResponse.text();

    throw new Error(
      `Strava token refresh failed for athlete ${athlete.athlete_id}. Status: ${tokenResponse.status}. Response: ${errorText}`
    );
  }

  const tokenData =
    await tokenResponse.json();

  if (
    !tokenData.access_token ||
    !tokenData.refresh_token ||
    !tokenData.expires_at
  ) {
    throw new Error(
      `Strava returned incomplete token data for athlete ${athlete.athlete_id}`
    );
  }

  /*
    Strava may return a new refresh token.
    Always save all three latest values.
  */
  const { error: tokenUpdateError } =
    await supabaseAdmin
      .from("athletes")
      .update({
        access_token:
          tokenData.access_token,
        refresh_token:
          tokenData.refresh_token,
        expires_at:
          tokenData.expires_at,
      })
      .eq(
        "athlete_id",
        athlete.athlete_id
      );

  if (tokenUpdateError) {
    throw new Error(
      `Could not save refreshed Strava token: ${tokenUpdateError.message}`
    );
  }

  return tokenData.access_token as string;
}

/*
  Convert activity distance to MoveTogether points.
*/
function calculatePoints(
  activityType: string,
  distanceInMetres: number
) {
  const distanceKm =
    distanceInMetres / 1000;

  if (activityType === "Walk") {
    return distanceKm * 1;
  }

  if (activityType === "Run") {
    return distanceKm * 2;
  }

  if (activityType === "Ride") {
    return distanceKm * 0.5;
  }

  return 0;
}

/*
  Fetch one newly created or updated activity
  from Strava and save it in Supabase.
*/
async function syncActivity(
  event: StravaWebhookEvent
) {
  const {
    data: athlete,
    error: athleteError,
  } = await supabaseAdmin
    .from("athletes")
    .select(
      "athlete_id, refresh_token, access_token, expires_at"
    )
    .eq("athlete_id", event.owner_id)
    .maybeSingle();

  if (athleteError) {
    throw new Error(
      `Could not find athlete: ${athleteError.message}`
    );
  }

  /*
    Ignore events for athletes who have not
    authorized this MoveTogether application.
  */
  if (!athlete) {
    console.log(
      `Ignoring webhook event because athlete ${event.owner_id} is not registered in MoveTogether`
    );

    return;
  }

  /*
    Always refresh using the saved refresh token.
    This also populates access_token and expires_at
    for the older athletes whose fields are NULL.
  */
  const accessToken =
    await refreshStravaToken(
      athlete as AthleteTokenRow
    );

  const activityResponse = await fetch(
    `https://www.strava.com/api/v3/activities/${event.object_id}`,
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!activityResponse.ok) {
    const errorText =
      await activityResponse.text();

    throw new Error(
      `Could not fetch Strava activity ${event.object_id}. Status: ${activityResponse.status}. Response: ${errorText}`
    );
  }

  const activity =
    await activityResponse.json();

  /*
    Use Strava's activity type. Your points
    dashboard currently supports Walk, Run
    and Ride only.
  */
  const activityType =
    activity.type ||
    activity.sport_type ||
    "";

  /*
    Ignore unsupported activity types so that,
    for example, swimming or workouts are not
    accidentally counted as walking.
  */
  const supportedTypes = [
    "Walk",
    "Run",
    "Ride",
  ];

  if (
    !supportedTypes.includes(activityType)
  ) {
    console.log(
      `Ignoring unsupported activity type: ${activityType}`
    );

    return;
  }

  const distance =
    Number(activity.distance || 0);

  const movingTime =
    Number(activity.moving_time || 0);

  const points =
    calculatePoints(
      activityType,
      distance
    );

  const activityRow = {
    athlete_id: event.owner_id,
    activity_id: activity.id,
    activity_name:
      activity.name || activityType,
    distance,
    moving_time: movingTime,
    activity_date:
      activity.start_date,
    activity_type: activityType,
    points,
  };

  const {
    error: activityUpsertError,
  } = await supabaseAdmin
    .from("Activities")
    .upsert(
      activityRow,
      {
        onConflict: "activity_id",
      }
    );

  if (activityUpsertError) {
    throw new Error(
      `Could not save activity ${event.object_id}: ${activityUpsertError.message}`
    );
  }

  const {
    error: lastSyncError,
  } = await supabaseAdmin
    .from("athletes")
    .update({
      last_sync:
        new Date().toISOString(),
    })
    .eq(
      "athlete_id",
      event.owner_id
    );

  if (lastSyncError) {
    console.error(
      "Could not update last_sync:",
      lastSyncError.message
    );
  }

  console.log(
    `Successfully synced activity ${event.object_id} for athlete ${event.owner_id}`
  );
}

/*
  Remove a deleted activity from Supabase so its
  distance and points disappear from the dashboard.
*/
async function deleteActivity(
  activityId: number
) {
  const { error } =
    await supabaseAdmin
      .from("Activities")
      .delete()
      .eq(
        "activity_id",
        activityId
      );

  if (error) {
    throw new Error(
      `Could not delete activity ${activityId}: ${error.message}`
    );
  }

  console.log(
    `Successfully deleted activity ${activityId}`
  );
}

/*
  POST receives create, update, delete and
  athlete deauthorization events from Strava.
*/
export async function POST(
  request: NextRequest
) {
  let event: StravaWebhookEvent;

  try {
    event = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid webhook JSON",
      },
      {
        status: 400,
      }
    );
  }

  console.log(
    "Strava webhook event:",
    JSON.stringify(event)
  );

  /*
    If an athlete disconnects MoveTogether
    from Strava, remove the stored credentials.
  */
  if (
    event.object_type === "athlete" &&
    event.updates?.authorized === "false"
  ) {
    const { error } =
      await supabaseAdmin
        .from("athletes")
        .update({
          refresh_token: null,
          access_token: null,
          expires_at: null,
        })
        .eq(
          "athlete_id",
          event.owner_id
        );

    if (error) {
      console.error(
        "Could not clear athlete tokens:",
        error.message
      );

      return NextResponse.json(
        {
          error:
            "Could not process athlete deauthorization",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      received: true,
    });
  }

  /*
    Acknowledge other athlete events without
    trying to treat them as activities.
  */
  if (
    event.object_type !== "activity"
  ) {
    return NextResponse.json({
      received: true,
    });
  }

  try {
    if (
      event.aspect_type === "delete"
    ) {
      await deleteActivity(
        event.object_id
      );
    }

    if (
      event.aspect_type === "create" ||
      event.aspect_type === "update"
    ) {
      await syncActivity(event);
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "Strava webhook processing error:",
      error
    );

    /*
      Returning 500 tells Strava the delivery did
      not complete successfully.
    */
    return NextResponse.json(
      {
        error:
          "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}

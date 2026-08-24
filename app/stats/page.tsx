import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Athlete = {
  athlete_id: number;
  athlete_name?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
};

type Activity = {
  athlete_id: number;
  activity_type: string;
  distance: number;
};

function getAthleteName(athlete: Athlete) {
  return (
    athlete.athlete_name ||
    athlete.name ||
    `${athlete.firstname || ""} ${athlete.lastname || ""}`.trim() ||
    `Athlete ${athlete.athlete_id}`
  );
}

export default async function StatsPage() {
  const [{ data: athletes }, { data: activities }] =
    await Promise.all([
      supabase.from("athletes").select("*"),
      supabase
        .from("Activities")
        .select(
          "athlete_id, activity_type, distance"
        ),
    ]);

  const athleteMap = new Map();

  athletes?.forEach((athlete) => {
    athleteMap.set(
      athlete.athlete_id,
      getAthleteName(athlete)
    );
  });

  const walkingMap = new Map();
  const runningMap = new Map();
  const cyclingMap = new Map();

  activities?.forEach((activity) => {
    const distanceKm =
      (activity.distance || 0) / 1000;

    if (
      activity.activity_type === "Walk"
    ) {
      walkingMap.set(
        activity.athlete_id,
        (walkingMap.get(
          activity.athlete_id
        ) || 0) + distanceKm
      );
    }

    if (
      activity.activity_type === "Run"
    ) {
      runningMap.set(
        activity.athlete_id,
        (runningMap.get(
          activity.athlete_id
        ) || 0) + distanceKm
      );
    }

    if (
      activity.activity_type === "Ride"
    ) {
      cyclingMap.set(
        activity.athlete_id,
        (cyclingMap.get(
          activity.athlete_id
        ) || 0) + distanceKm
      );
    }
  });

  function buildLeaderboard(
    map: Map<number, number>
  ) {
    return [...map.entries()]
      .map(([athleteId, distance]) => ({
        athleteId,
        athleteName:
          athleteMap.get(athleteId) ||
          `Athlete ${athleteId}`,
        distance,
      }))
      .sort(
        (a, b) =>
          b.distance - a.distance
      );
  }

  const walkers =
    buildLeaderboard(walkingMap);

  const runners =
    buildLeaderboard

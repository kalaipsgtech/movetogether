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
  first_name?: string;
  last_name?: string;
};

type Activity = {
  athlete_id: number;
  activity_type: string;
  distance: number;
  activity_date: string;
};
function getAthleteName(athlete: Athlete) {

  if (
    athlete.athlete_name &&
    athlete.athlete_name.trim()
  ) {
    return athlete.athlete_name.trim();
  }

  if (
    athlete.name &&
    athlete.name.trim()
  ) {
    return athlete.name.trim();
  }

  const firstName =
    athlete.firstname ||
    athlete.first_name ||
    "";

  const lastName =
    athlete.lastname ||
    athlete.last_name ||
    "";

  const fullName =
    `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  return `Athlete ${athlete.athlete_id}`;
}

export default async function StatsPage() {
  const [{ data: athletes }, { data: activities }] =
    await Promise.all([
      supabase.from("athletes").select("*"),
      supabase
  .from("Activities")
  .select(
    "athlete_id, activity_type, distance, activity_date"
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

  const challengeStart = new Date(
  "2026-08-20T00:00:00+05:30"
);

const challengeEnd = new Date(
  "2026-09-08T23:59:59+05:30"
);
  activities?.forEach((activity) => {

  const activityDate =
    new Date(activity.activity_date);

  if (
    activityDate < challengeStart ||
    activityDate > challengeEnd
  ) {
    return;
  }

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
    buildLeaderboard(runningMap);

  const riders =
    buildLeaderboard(cyclingMap);

  function renderCard(
    title: string,
    emoji: string,
    data: any[]
  ) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-xl font-bold mb-4">
          {emoji} {title}
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                Rank
              </th>
              <th className="text-left py-2">
                Athlete
              </th>
              <th className="text-right py-2">
                Distance
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map(
              (row, index) => (
                <tr
                  key={row.athleteId}
                  className="border-b"
                >
                  <td className="py-2">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : index + 1}
                  </td>

                  <td className="py-2">
                    {row.athleteName}
                  </td>

                  <td className="py-2 text-right">
                    {row.distance.toFixed(1)} km
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-rose-50 p-4 pb-28">
      <h1 className="text-3xl font-bold text-center mb-6">
        📈 Fitness Statistics
      </h1>

      {renderCard(
        "Walking Champions",
        "🚶",
        walkers
      )}

      {renderCard(
        "Running Champions",
        "🏃",
        runners
      )}

      {renderCard(
        "Cycling Champions",
        "🚴",
        riders
      )}
    </main>
  );
}

import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function calculateStreak(activities: any[]) {
  return 0;
}
export default async function PointsDashboardPage() {
  const { data: athletes } = await supabase
    .from("athletes")
    .select("athlete_id, first_name, last_name");

 const { data: activities } = await supabase
  .from("Activities")
  .select(
    "athlete_id, activity_type, distance, points, activity_date"
  );

  const rows =
    athletes?.map((athlete) => {
      const athleteActivities =
        activities?.filter(
          (a) =>
            a.athlete_id === athlete.athlete_id
        ) || [];

      const streakDays =
  calculateStreak(athleteActivities);
      
      const rideKm = athleteActivities
  .filter((a) => a.activity_type === "Ride")
  .reduce(
    (sum, a) => sum + ((a.distance || 0) / 1000),
    0
  );

const walkKm = athleteActivities
  .filter((a) => a.activity_type === "Walk")
  .reduce(
    (sum, a) => sum + ((a.distance || 0) / 1000),
    0
  );

const runKm = athleteActivities
  .filter((a) => a.activity_type === "Run")
  .reduce(
    (sum, a) => sum + ((a.distance || 0) / 1000),
    0
  );
      const ridePoints = athleteActivities
        .filter((a) => a.activity_type === "Ride")
        .reduce(
          (sum, a) => sum + (a.points || 0),
          0
        );

      const walkPoints = athleteActivities
        .filter((a) => a.activity_type === "Walk")
        .reduce(
          (sum, a) => sum + (a.points || 0),
          0
        );

      const runPoints = athleteActivities
        .filter((a) => a.activity_type === "Run")
        .reduce(
          (sum, a) => sum + (a.points || 0),
          0
        );

      const totalPoints =
        ridePoints +
        walkPoints +
        runPoints;

      return {
  name: `${athlete.first_name} ${athlete.last_name}`,

  walkKm,
  rideKm,
  runKm,

  streakDays,

  totalPoints,
};
      
    }) || [];

  rows.sort(
    (a, b) =>
      b.totalPoints - a.totalPoints
  );

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1>
        🏆 MoveTogether Points Dashboard
      </h1>

      <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Walk (km)</th>
            <th>Ride (km)</th>
            <th>Run (km)</th>
            <th>Streak</th>
            <th>Total Points</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.name}
              style={{
                textAlign: "center",
              }}
            >
<td>
  {index === 0
    ? "🥇"
    : index === 1
    ? "🥈"
    : index === 2
    ? "🥉"
    : index + 1}
</td>

<td>{row.name}</td>

<td>{row.walkKm.toFixed(1)} km </td>

<td>{row.rideKm.toFixed(1)} km </td>

<td>{row.runKm.toFixed(1)} km </td>

<td>{row.streakDays}</td>

<td>{Math.round(row.totalPoints)}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

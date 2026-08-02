import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PointsDashboardPage() {
  const { data: athletes } = await supabase
    .from("athletes")
    .select("athlete_id, first_name, last_name");

  const { data: activities } = await supabase
    .from("Activities")
    .select(
      "athlete_id, activity_type, distance, points"
    );

  const rows =
    athletes?.map((athlete) => {
      const athleteActivities =
        activities?.filter(
          (a) =>
            a.athlete_id === athlete.athlete_id
        ) || [];

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
        ridePoints,
        walkPoints,
        runPoints,
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
        }}
      >
        <thead>
          <tr>
            <th>Name</th>

            <th>Ride/km</th>
            <th>Walk/km</th>
            <th>Run/km</th>

            <th>Ride Points</th>
            <th>Walk Points</th>
            <th>Run Points</th>

            <th>Total Points</th>
            <th>Ranking</th>
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
              <td>{row.name}</td>

              <td>0.5</td>
              <td>1</td>
              <td>2</td>

              <td>
                {row.ridePoints.toFixed(2)}
              </td>

              <td>
                {row.walkPoints.toFixed(2)}
              </td>

              <td>
                {row.runPoints.toFixed(2)}
              </td>

              <td>
                {row.totalPoints.toFixed(2)}
              </td>

              <td>{index + 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

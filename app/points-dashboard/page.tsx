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
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #FFF1F2, #FFE4E6, #FCE7F3)",
  }}
>
 <h1
  style={{
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    fontSize: "40px",
    fontWeight: "900",
    textAlign: "center",
    color: "#0F766E",
    textShadow: "2px 2px 8px rgba(0,0,0,0.15)",
  }}
>
  🏆 MoveTogether Fitness Challenge
</h1>

      <table
  style={{
    width: "auto",
    margin: "0 auto",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  }}
>
        <thead>
          <tr>
            <th
  style={{
    border: "1px solid #D1D5DB",
    padding: "12px",
  }}
>
  Rank
</th>
          
            <th
  style={{
    border: "1px solid #BFC5CC",
    padding: "12px",
    textAlign: "center",
  }}
>
  Name
</th>

            <th
  style={{
    border: "1px solid #BFC5CC",
    padding: "12px",
    textAlign: "center",
  }}
>
  Walk
  <br />
  <span
    style={{
      fontSize: "12px",
      color: "#666",
    }}
  >
    (km)
  </span>
</th>
            
           <th
  style={{
    border: "1px solid #BFC5CC",
    padding: "12px",
    textAlign: "center",
  }}
>
  Ride
  <br />
  <span
    style={{
      fontSize: "12px",
      color: "#666",
    }}
  >
    (km)
  </span>
</th>
            
            <th
  style={{
    border: "1px solid #BFC5CC",
    padding: "12px",
    textAlign: "center",
  }}
>
  Run
  <br />
  <span
    style={{
      fontSize: "12px",
      color: "#666",
    }}
  >
    (km)
  </span>
</th>
            <th
  style={{
    border: "1px solid #BFC5CC",
    padding: "12px",
    textAlign: "center",
  }}
>
  Streak
</th>
            <th
  style={{
    border: "1px solid #BFC5CC",
    padding: "12px",
    textAlign: "center",
  }}
>
  Total Points
</th>

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

<td
  style={{
    border: "1px solid #D1D5DB",
    padding: "10px 15px",
  }}
>
  {row.name}
</td>

<td
  style={{
    border: "1px solid #D1D5DB",
    padding: "10px 15px",
  }}
>
  {row.walkKm.toFixed(1)}
</td>

<td
  style={{
    border: "1px solid #D1D5DB",
    padding: "10px 15px",
  }}
>
  {row.rideKm.toFixed(1)}
</td>

<td
  style={{
    border: "1px solid #D1D5DB",
    padding: "10px 15px",
  }}
>
  {row.runKm.toFixed(1)}
</td>

<td
  style={{
    border: "1px solid #D1D5DB",
    padding: "10px 15px",
  }}
>
  {row.streakDays}
</td>

<td
  style={{
    border: "1px solid #D1D5DB",
    padding: "10px 15px",
  }}
>
  {Math.round(row.totalPoints)}
</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

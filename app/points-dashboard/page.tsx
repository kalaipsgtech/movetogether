import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CHALLENGE_START = new Date("2026-08-16");
const CHALLENGE_END = new Date("2026-08-19");

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
  activities?.filter((a) => {
    if (a.athlete_id !== athlete.athlete_id)
      return false;

    const activityDate = new Date(
      a.activity_date
    );

    return (
      activityDate >= CHALLENGE_START &&
      activityDate <= CHALLENGE_END
    );
  }) || [];

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
  padding: "12px",
  fontFamily: "Arial",
  minHeight: "100vh",
  width: "100%",
    background:
      "linear-gradient(135deg, #FFF1F2, #FFE4E6, #FCE7F3)",
  }}
>

 <h1
  style={{
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    fontSize: "clamp(28px, 5vw, 40px)",
    fontWeight: "900",
    textAlign: "center",
    color: "#0F766E",
    textShadow: "2px 2px 8px rgba(0,0,0,0.15)",
  }}
>
  🏆 MoveTogether Fitness Challenge
</h1>
<div
  style={{
    textAlign: "center",
    marginBottom: "20px",
    color: "#0F766E",
    fontWeight: "600",
    fontSize: "18px",
  }}
>
  📅 Challenge Period:
  20 Aug 2026 - 08 Sep 2026
</div>
      <div
  style={{
    width: "100%",
    overflowX: "auto",
  }}
>
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
  Total
  <br />
  <span
    style={{
      fontSize: "12px",
      color: "#666",
    }}
  >
    Points
  </span>
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
  {Math.round(row.totalPoints)}
</td>
              
            </tr>
          ))}
        </tbody>

      </table>
        </div>

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "15px",
          textAlign: "center",
          color: "#0F766E",
          fontWeight: "700",
        }}
      >
        🏅 Activity Points System
      </h2>

      <table
        style={{
          margin: "0 auto",
          borderCollapse: "collapse",
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
              }}
            >
              Activity
            </th>

            <th
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
              }}
            >
              Points / km
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
              }}
            >
              🚴 Ride
            </td>
            <td
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
                textAlign: "center",
              }}
            >
              0.5
            </td>
          </tr>

          <tr>
            <td
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
              }}
            >
              🚶 Walk
            </td>
            <td
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
                textAlign: "center",
              }}
            >
              1
            </td>
          </tr>

          <tr>
            <td
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
              }}
            >
              🏃 Run
            </td>
            <td
              style={{
                border: "1px solid #BFC5CC",
                padding: "10px 20px",
                textAlign: "center",
              }}
            >
              2
            </td>
          </tr>
        </tbody>
      </table>

      <p
        style={{
          textAlign: "center",
          marginTop: "10px",
          color: "#6B7280",
          fontSize: "14px",
        }}
      >
        Points are awarded based on the distance completed in each activity.
      </p>

    </main>
  );
}


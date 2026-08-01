import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select(
      "athlete_id, first_name, last_name, total_distance_km, last_sync"
    )
    const sortedAthletes = (athletes || [])
      .sort(
          (a, b) =>
            (b.total_distance_km || 0) -
            (a.total_distance_km || 0)
  );

  if (error) {
    return (
      <main style={{ padding: "60px", textAlign: "center" }}>
        <h1>🏆 Leaderboard</h1>
        <p>Error loading leaderboard.</p>
      </main>
    );
  }

  return (
    <main
      style={{
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial",
      }}
    >
      <h1>🏆 MoveTogether Leaderboard</h1>

      <p>Ranked by Total Distance</p>

      <div
        style={{
          maxWidth: "600px",
          margin: "30px auto",
          textAlign: "left",
        }}
      >
        {athletes?.map((athlete, index) => (
          <div
            key={athlete.athlete_id}
            style={{
              padding: "18px",
              marginBottom: "12px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3>
              #{index + 1} {athlete.first_name} {athlete.last_name}
            </h3>

            <p>
              Distance:{" "}
              {athlete.total_distance_km
                ? athlete.total_distance_km.toFixed(2)
                : "0"} km
            </p>

            <p>
              Last Sync:{" "}
              {athlete.last_sync
                ? new Date(athlete.last_sync).toLocaleDateString()
                : "Never"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

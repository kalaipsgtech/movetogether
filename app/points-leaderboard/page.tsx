import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PointsLeaderboardPage() {
  const { data: athletes } = await supabase
    .from("athletes")
    .select("athlete_id, first_name, last_name");

  const { data: activities } = await supabase
    .from("Activities")
    .select("athlete_id, activity_type, points");

  return (
    <main
      style={{
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial",
      }}
    >
      <h1>⭐ Points Leaderboard</h1>

      <p>
        Points leaderboard is under construction.
      </p>

      <p>
        Athletes Found: {athletes?.length || 0}
      </p>

      <p>
        Activities Found: {activities?.length || 0}
      </p>
    </main>
  );
}

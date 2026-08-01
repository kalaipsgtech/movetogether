import { supabase } from "@/lib/supabase";

export default async function MembersPage() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("athlete_id, first_name, last_name, connected_at")
    .order("connected_at", { ascending: true });

  if (error) {
    return (
      <main
        style={{
          textAlign: "center",
          padding: "60px",
          fontFamily: "Arial",
        }}
      >
        <h1>👥 Connected Members</h1>
        <p>Unable to load members.</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
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
      <h1>👥 Connected Members</h1>

      <p>
        These are the Strava users who have connected to MoveTogether.
      </p>

      {athletes && athletes.length > 0 ? (
        <div
          style={{
            maxWidth: "500px",
            margin: "30px auto",
            textAlign: "left",
          }}
        >
          {athletes.map((athlete, index) => (
            <div
              key={athlete.athlete_id}
              style={{
                padding: "16px",
                marginBottom: "12px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <strong>
                {index + 1}. {athlete.first_name} {athlete.last_name}
              </strong>
              <br />
              <small>
                Athlete ID: {athlete.athlete_id}
              </small>
            </div>
          ))}
        </div>
      ) : (
        <p>No members connected yet.</p>
      )}
    </main>
  );
}

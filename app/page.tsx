export default function Home() {
  return (
    <main
      style={{
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial",
      }}
    >
      <h1>❤️ MoveTogether</h1>

      <h2>Family Fitness Dashboard</h2>

      <p>
        Connect your Strava account and track progress together.
      </p>

      <button
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          marginTop: "20px",
        }}
      >
        Connect Strava
      </button>
    </main>
  );
}
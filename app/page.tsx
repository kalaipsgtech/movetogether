"use client";

export default function Home() {
  const connectStrava = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    const authUrl =
      https://www.strava.com/oauth/authorize +
      ?client_id=${clientId} +
      &response_type=code +
      &redirect_uri=${redirectUri} +
      &approval_prompt=force +
      &scope=read,activity:read_all;

    window.location.href = authUrl;
  };

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
        onClick={connectStrava}
        style={{
          padding: "12px 24px",
          fontSize: "18px",
          marginTop: "20px",
          cursor: "pointer",
        }}
      >
        Connect Strava
      </button>
    </main>
  );
}

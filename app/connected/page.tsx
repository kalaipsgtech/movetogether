export default function ConnectedPage({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  return (
    <main
      style={{
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial",
      }}
    >
      <h1>✅ Strava Connected</h1>

      <h2>Welcome {searchParams.name}</h2>

      <p>
        Your account has been successfully linked.
      </p>
    </main>
  );
}

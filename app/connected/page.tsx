export default async function ConnectedPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;

  return (
    <main
      style={{
        textAlign: "center",
        padding: "60px",
        fontFamily: "Arial",
      }}
    >
      <h1>✅ Strava Connected</h1>

      <h2>Welcome {params.name}</h2>

      <p>
        Your account has been successfully linked.
      </p>
    </main>
  );
}

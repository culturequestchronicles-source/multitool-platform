export default function EnvCheck() {
    return (
      <div style={{ padding: 24, fontFamily: "ui-sans-serif" }}>
        <h1>Env Check</h1>
        <pre>
  {JSON.stringify(
    {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY_present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    null,
    2
  )}
        </pre>
      </div>
    );
  }
  
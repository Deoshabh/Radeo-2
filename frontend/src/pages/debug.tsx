export default function DebugPage() {
    // Only include public variables that Next.js exposes to the client.
    const publicEnv = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    };
  
    return (
      <pre>{JSON.stringify(publicEnv, null, 2)}</pre>
    );
  }
  
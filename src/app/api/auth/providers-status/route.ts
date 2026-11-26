import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.AUTH_GOOGLE_ID?.trim() || "";
  const clientSecret = process.env.AUTH_GOOGLE_SECRET?.trim() || "";

  const googleConfigured = Boolean(
    clientId &&
    clientSecret &&
    !clientId.includes("placeholder") &&
    !clientSecret.includes("placeholder") &&
    !clientId.includes("your-google")
  );

  return NextResponse.json({
    providers: {
      credentials: true,
      demoLogin: true,
      google: {
        configured: googleConfigured,
        id: "google",
        name: "Google",
      },
    },
  });
}

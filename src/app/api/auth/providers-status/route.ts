import { NextResponse } from "next/server";

export async function GET() {
  const googleConfigured = Boolean(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET &&
    !process.env.AUTH_GOOGLE_ID.includes("placeholder") &&
    !process.env.AUTH_GOOGLE_SECRET.includes("placeholder") &&
    !process.env.AUTH_GOOGLE_ID.includes("your-google")
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

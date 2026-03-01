import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.DASHBOARD_PASSWORD;

    if (!correctPassword) {
      console.error("DASHBOARD_PASSWORD env var not set");
      return NextResponse.json({ error: "Server-Konfigurationsfehler" }, { status: 500 });
    }

    if (password !== correctPassword) {
      return NextResponse.json({ error: "Falsches Passwort" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("dashboard_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get("dashboard_session");
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase server client not configured" },
      { status: 503 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("call_attempts")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("API Error fetching call attempts:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: data ?? [] });
}

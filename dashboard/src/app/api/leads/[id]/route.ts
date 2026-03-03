import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_FIELDS = new Set([
  "caller_name",
  "company",
  "email",
  "phone",
  "company_size",
  "current_stack",
  "pain_point",
  "timeline",
  "status",
  "notes",
  "next_steps",
  "assigned_to",
  "disposition_code",
  "is_dnc",
  "dnc_reason",
  "callback_datetime",
  "next_call_scheduled_at",
  "follow_up_reason",
  "campaign_id",
]);

const VALID_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
  "lost",
  "not_reached",
  "rejected",
  "queued",
  "attempting",
  "exhausted",
  "callback_scheduled",
  "dnc",
]);

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").slice(0, 2000);
}

export async function PATCH(
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Filter to allowed fields only
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    if (key === "status" && !VALID_STATUSES.has(value as string)) continue;
    if (key === "next_steps" && Array.isArray(value)) {
      updates[key] = value.map((v) => sanitize(v)).filter(Boolean);
    } else {
      updates[key] = value === null ? null : sanitize(value);
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }

  return NextResponse.json(data);
}

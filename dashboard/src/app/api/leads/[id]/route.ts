import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

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
]);

const VALID_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
  "lost",
]);

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").slice(0, 2000);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

const VALID_ROLES = new Set(["sales_rep", "manager", "admin"]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase server client not configured" },
      { status: 503 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
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

  // Validate required fields
  const name = sanitize(body.name);
  const email = sanitize(body.email);

  if (!name) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );
  }

  // Validate role if provided
  const role = body.role ? sanitize(body.role) : "sales_rep";
  if (!VALID_ROLES.has(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${[...VALID_ROLES].join(", ")}` },
      { status: 400 }
    );
  }

  const avatarUrl = body.avatar_url ? sanitize(body.avatar_url) : null;
  const isActive = body.is_active !== undefined ? Boolean(body.is_active) : true;

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .insert({
      name,
      email,
      role,
      avatar_url: avatarUrl,
      is_active: isActive,
    })
    .select()
    .single();

  if (error) {
    // Handle unique constraint violation on email
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A team member with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

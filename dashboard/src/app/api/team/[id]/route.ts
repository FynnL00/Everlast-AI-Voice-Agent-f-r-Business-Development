import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

const VALID_ROLES = new Set(["sales_rep", "manager", "admin"]);
const ALLOWED_FIELDS = new Set(["name", "email", "role", "avatar_url", "is_active"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, "").slice(0, 500);
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

    if (key === "email") {
      const email = sanitize(value);
      if (!EMAIL_REGEX.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
      updates[key] = email;
    } else if (key === "role") {
      const role = sanitize(value);
      if (!VALID_ROLES.has(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${[...VALID_ROLES].join(", ")}` },
          { status: 400 }
        );
      }
      updates[key] = role;
    } else if (key === "is_active") {
      updates[key] = Boolean(value);
    } else if (key === "avatar_url") {
      updates[key] = value === null ? null : sanitize(value);
    } else {
      const sanitized = sanitize(value);
      if (!sanitized && key === "name") {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updates[key] = sanitized;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A team member with this email already exists" },
        { status: 409 }
      );
    }
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase server client not configured" },
      { status: 503 }
    );
  }

  // Soft delete: set is_active = false
  const { data, error } = await supabaseAdmin
    .from("team_members")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

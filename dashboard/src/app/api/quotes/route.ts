import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, "").slice(0, 500);
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("dashboard_session");
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Supabase server client not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);

  // Pagination
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Filters
  const speaker = searchParams.get("speaker");
  const sentiment = searchParams.get("sentiment");
  const search = searchParams.get("search");
  const leadId = searchParams.get("leadId");

  // Build query with join to leads table for lead_name and lead_company
  let query = supabaseAdmin
    .from("lead_quotes")
    .select(
      "*, leads!inner(caller_name, company)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  // Apply filters
  if (speaker && ["agent", "caller"].includes(speaker)) {
    query = query.eq("speaker", speaker);
  }

  if (sentiment && ["positiv", "neutral", "negativ"].includes(sentiment)) {
    query = query.eq("sentiment", sentiment);
  }

  if (leadId) {
    if (!UUID_REGEX.test(leadId)) {
      return NextResponse.json({ error: "Ungültige ID" }, { status: 400 });
    }
    query = query.eq("lead_id", leadId);
  }

  if (search) {
    const sanitizedSearch = sanitize(search);
    query = query.ilike("quote_text", `%${sanitizedSearch}%`);
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
  }

  // Transform joined data to flatten lead info
  const quotes = (data ?? []).map((row: Record<string, unknown>) => {
    const leads = row.leads as { caller_name: string | null; company: string | null } | null;
    const { leads: _leads, ...rest } = row;
    return {
      ...rest,
      lead_name: leads?.caller_name ?? null,
      lead_company: leads?.company ?? null,
    };
  });

  return NextResponse.json({
    data: quotes,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    },
  });
}

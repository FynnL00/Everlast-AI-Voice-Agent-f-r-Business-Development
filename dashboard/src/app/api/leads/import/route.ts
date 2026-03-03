import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

// Simple CSV parser (no external dependency needed for 3 fixed columns)
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (values[idx]) row[h] = values[idx];
    });
    if (Object.keys(row).length > 0) rows.push(row);
  }

  return rows;
}

// Normalize German phone numbers to E.164
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\/\(\)\.]/g, "");

  // 0049... → +49...
  if (cleaned.startsWith("0049")) {
    cleaned = "+" + cleaned.slice(2);
  }
  // 049... → +49...
  if (cleaned.startsWith("049")) {
    cleaned = "+" + cleaned.slice(1);
  }
  // 0171... → +49171...
  if (cleaned.startsWith("0") && !cleaned.startsWith("+")) {
    cleaned = "+49" + cleaned.slice(1);
  }
  // Ensure starts with +
  if (!cleaned.startsWith("+")) {
    cleaned = "+49" + cleaned;
  }

  return cleaned;
}

function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+\d{8,15}$/.test(normalized);
}

function sanitizeField(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[<>"';&]/g, "")
    .slice(0, 500)
    .trim();
}

const HEADER_MAP: Record<string, string> = {
  name: "caller_name",
  email: "email",
  phone: "phone",
};

export async function POST(request: NextRequest) {
  const session = request.cookies.get("dashboard_session");
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase nicht konfiguriert" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "FormData erwartet" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const campaignId = formData.get("campaign_id") as string | null;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Datei zu groß (max 5 MB)" }, { status: 400 });
  }

  const text = await file.text();
  const rows = parseCSV(text);

  if (rows.length === 0) {
    return NextResponse.json({ error: "Keine Daten in CSV gefunden" }, { status: 400 });
  }

  // Check for required phone header
  const firstRowKeys = Object.keys(rows[0]).map((k) => k.toLowerCase());
  if (!firstRowKeys.includes("phone")) {
    return NextResponse.json(
      { error: 'Pflicht-Header "phone" fehlt in der CSV-Datei' },
      { status: 400 }
    );
  }

  const results = { created: 0, updated: 0, errors: [] as { row: number; reason: string }[] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Map CSV headers to DB fields
    const lead: Record<string, string> = {};
    for (const [csvKey, value] of Object.entries(row)) {
      const dbField = HEADER_MAP[csvKey.toLowerCase()];
      if (dbField && value) lead[dbField] = sanitizeField(value);
    }

    // Validate phone
    if (!lead.phone || !isValidPhone(lead.phone)) {
      results.errors.push({ row: i + 2, reason: "Ungültige Telefonnummer" });
      continue;
    }

    lead.phone = normalizePhone(lead.phone);

    // UPSERT on phone
    const { error } = await supabaseAdmin
      .from("leads")
      .upsert(
        {
          ...lead,
          ...(campaignId ? { campaign_id: campaignId } : {}),
          lead_source: "csv_import",
          call_direction: "outbound",
          status: "queued",
          call_attempts: 0,
        },
        {
          onConflict: "phone",
          ignoreDuplicates: false,
        }
      );

    if (error) {
      results.errors.push({ row: i + 2, reason: error.message });
    } else {
      results.created++;
    }
  }

  // Update campaign lead count
  if (campaignId) {
    const { count } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaignId);

    if (count != null) {
      await supabaseAdmin
        .from("campaigns")
        .update({ total_leads: count })
        .eq("id", campaignId);
    }
  }

  return NextResponse.json(results);
}

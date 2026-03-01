import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function sanitizeForPrompt(value: string): string {
  return value
    .slice(0, 500)
    .replace(/<[^>]*>/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/[<>]/g, "");
}

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

  try {
    // Fetch the lead with all fields
    const { data: lead, error: fetchError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !lead) {
      console.error("API Error:", fetchError);
      return NextResponse.json(
        { error: "Lead nicht gefunden" },
        { status: 404 }
      );
    }

    // Check if cached briefing is still valid (within last hour)
    if (lead.briefing && lead.briefing_generated_at) {
      const generatedAt = new Date(lead.briefing_generated_at).getTime();
      if (Date.now() - generatedAt < CACHE_TTL_MS) {
        return NextResponse.json({ briefing: lead.briefing });
      }
    }

    // Build the prompt from lead data
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      console.error("OPENROUTER_API_KEY env var not set");
      return NextResponse.json(
        { error: "Server-Konfigurationsfehler" },
        { status: 500 }
      );
    }

    const leadContext = [
      lead.conversation_summary
        ? `Zusammenfassung: ${sanitizeForPrompt(lead.conversation_summary)}`
        : null,
      lead.company ? `Firma: ${sanitizeForPrompt(lead.company)}` : null,
      lead.company_size ? `Groesse: ${sanitizeForPrompt(lead.company_size)}` : null,
      lead.pain_point ? `Hauptproblem: ${sanitizeForPrompt(lead.pain_point)}` : null,
      lead.current_stack ? `Aktueller Tech-Stack: ${sanitizeForPrompt(lead.current_stack)}` : null,
      lead.timeline ? `Zeitrahmen: ${sanitizeForPrompt(lead.timeline)}` : null,
      lead.objections_raised && lead.objections_raised.length > 0
        ? `Einwaende: ${sanitizeForPrompt(lead.objections_raised.join(", "))}`
        : null,
      lead.sentiment ? `Stimmung: ${sanitizeForPrompt(lead.sentiment)}` : null,
      lead.is_decision_maker !== null
        ? `Entscheidungstraeger: ${lead.is_decision_maker ? "Ja" : "Nein"}`
        : null,
      lead.score_company_size
        ? `Score Firmengroesse: ${lead.score_company_size}/3`
        : null,
      lead.score_tech_stack
        ? `Score Tech-Stack: ${lead.score_tech_stack}/3`
        : null,
      lead.score_pain_point
        ? `Score Pain Point: ${lead.score_pain_point}/3`
        : null,
      lead.score_timeline
        ? `Score Zeitrahmen: ${lead.score_timeline}/3`
        : null,
      lead.total_score ? `Gesamtscore: ${lead.total_score}/12` : null,
      lead.lead_grade ? `Lead-Grade: ${sanitizeForPrompt(lead.lead_grade)}` : null,
      lead.transcript ? `Transcript (Auszug): ${sanitizeForPrompt(lead.transcript.slice(0, 3000))}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const userPrompt = `Erstelle ein praeknantes Demo-Vorbereitungs-Briefing fuer folgenden Lead:

${leadContext}

Strukturiere das Briefing wie folgt:
1. Kernbotschaft (1 Satz: Was ist der wichtigste Punkt fuer diesen Lead?)
2. Vorbereitung (3-5 Bullet Points: Was muss das Demo-Team wissen?)
3. Einwaende antizipieren (Welche Einwaende koennten kommen und wie darauf reagieren?)
4. Empfohlener Demo-Fokus (Welche n8n-Features sollten hervorgehoben werden?)

Maximal 300 Woerter. Auf Deutsch.`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openrouterApiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein Sales-Briefing-Assistent. Erstelle praeknante Demo-Vorbereitungen auf Deutsch.",
          },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", response.status, errText);
      return NextResponse.json(
        { error: "Briefing-Generierung fehlgeschlagen" },
        { status: 502 }
      );
    }

    const result = await response.json();
    const briefing =
      result.choices?.[0]?.message?.content?.trim() ||
      "Briefing konnte nicht generiert werden.";

    // Save briefing to Supabase
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("leads")
      .update({ briefing, briefing_generated_at: now })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to cache briefing:", updateError.message);
      // Still return the briefing even if caching fails
    }

    return NextResponse.json({ briefing });
  } catch (err) {
    console.error("Briefing generation failed:", err);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

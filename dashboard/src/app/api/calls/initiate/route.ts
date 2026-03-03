import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const session = request.cookies.get("dashboard_session");
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Supabase nicht konfiguriert" }, { status: 503 });
  }

  let body: { leadId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Request Body" }, { status: 400 });
  }

  const { leadId } = body;
  if (!leadId) {
    return NextResponse.json({ error: "leadId erforderlich" }, { status: 400 });
  }

  // 1. Lead laden
  const { data: lead, error: leadError } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead nicht gefunden" }, { status: 404 });
  }

  if (!lead.phone) {
    return NextResponse.json({ error: "Keine Telefonnummer" }, { status: 400 });
  }

  if (lead.is_dnc) {
    return NextResponse.json({ error: "Lead ist auf DNC-Liste" }, { status: 403 });
  }

  // 2. Kampagnen-Kontext laden
  let campaignContext = "";
  let firstMessageOverride: string | null = null;
  if (lead.campaign_id) {
    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .select("name, first_message_override, system_prompt_override")
      .eq("id", lead.campaign_id)
      .single();
    if (campaign) {
      campaignContext = campaign.name;
      firstMessageOverride = campaign.first_message_override;
    }
  }

  // 3. VAPI Create Call
  const vapiKey = process.env.VAPI_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID;
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

  if (!vapiKey || !assistantId || !phoneNumberId) {
    return NextResponse.json({ error: "VAPI nicht konfiguriert" }, { status: 503 });
  }

  const vapiResponse = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vapiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId,
      assistantOverrides: {
        ...(firstMessageOverride ? { firstMessage: firstMessageOverride } : {}),
        variableValues: {
          lead_name: lead.caller_name || "dort",
          company_name: lead.company || "",
          pain_point: lead.pain_point || "",
          current_stack: lead.current_stack || "",
          campaign_context: campaignContext,
          call_reason: lead.follow_up_reason || "Erstanruf",
        },
      },
      customer: {
        number: lead.phone,
      },
      phoneNumberId,
    }),
  });

  if (!vapiResponse.ok) {
    const error = await vapiResponse.text();
    console.error("VAPI Create Call error:", error);
    return NextResponse.json({ error: `VAPI Fehler: ${error}` }, { status: 502 });
  }

  const vapiCall = await vapiResponse.json();

  // 4. Lead optimistisch updaten
  await supabaseAdmin
    .from("leads")
    .update({
      call_id: vapiCall.id,
      last_call_attempt_at: new Date().toISOString(),
      status: lead.status === "new" ? "contacted" : lead.status,
      outbound_state: "attempting",
      call_direction: "outbound",
    })
    .eq("id", leadId);

  // 5. Call-Attempt vorab erstellen
  await supabaseAdmin.from("call_attempts").insert({
    lead_id: leadId,
    campaign_id: lead.campaign_id,
    call_id: vapiCall.id,
    attempt_number: (lead.call_attempts || 0) + 1,
    disposition_code: "technical_error", // Default, wird vom Post-Call Webhook überschrieben
    direction: "outbound",
  });

  return NextResponse.json({
    callId: vapiCall.id,
    status: "initiating",
  });
}

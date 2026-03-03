// --- Disposition Codes (Outbound) ---
export type DispositionCode =
  | 'connected'
  | 'no_answer'
  | 'voicemail'
  | 'busy'
  | 'wrong_number'
  | 'gatekeeper'
  | 'callback'
  | 'not_interested'
  | 'dnc_request'
  | 'technical_error';

export const DISPOSITION_LABELS: Record<DispositionCode, string> = {
  connected: "Erreicht",
  no_answer: "Keine Antwort",
  voicemail: "Mailbox",
  busy: "Besetzt",
  wrong_number: "Falsche Nummer",
  gatekeeper: "Gatekeeper",
  callback: "Rückruf gewünscht",
  not_interested: "Kein Interesse",
  dnc_request: "DNC-Anfrage",
  technical_error: "Technischer Fehler",
};

export const DISPOSITION_COLORS: Record<DispositionCode, string> = {
  connected: "var(--chart-2)",
  no_answer: "var(--muted-foreground)",
  voicemail: "var(--score-warning)",
  busy: "var(--chart-3)",
  wrong_number: "var(--destructive)",
  gatekeeper: "var(--chart-4)",
  callback: "var(--chart-5)",
  not_interested: "var(--score-danger)",
  dnc_request: "var(--destructive)",
  technical_error: "var(--chart-3)",
};

// --- Campaign ---
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface CadenceConfig {
  max_attempts: number;
  intervals_minutes: number[];
  voicemail_action: 'skip' | 'leave_message';
  leave_voicemail_after_attempt: number;
}

export interface Campaign {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  created_by: string | null;
  assigned_agent_id: string | null;
  start_date: string | null;
  end_date: string | null;
  calling_window_start: string;
  calling_window_end: string;
  calling_timezone: string;
  calling_days: number[];
  cadence_config: CadenceConfig;
  target_filter: Record<string, unknown> | null;
  total_leads: number;
  leads_called: number;
  leads_connected: number;
  leads_converted: number;
  system_prompt_override: string | null;
  first_message_override: string | null;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Entwurf",
  active: "Aktiv",
  paused: "Pausiert",
  completed: "Abgeschlossen",
  archived: "Archiviert",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "var(--muted-foreground)",
  active: "var(--score-good)",
  paused: "var(--score-warning)",
  completed: "var(--chart-2)",
  archived: "var(--chart-3)",
};

// --- Call Attempt ---
export interface CallAttempt {
  id: string;
  created_at: string;
  lead_id: string;
  campaign_id: string | null;
  call_id: string | null;
  attempt_number: number;
  disposition_code: DispositionCode;
  duration_seconds: number | null;
  direction: 'inbound' | 'outbound';
  gatekeeper_name: string | null;
  callback_datetime: string | null;
  notes: string | null;
  ended_reason: string | null;
  recording_url: string | null;
}

// --- Lead ---
export interface Lead {
  id: string;
  created_at: string;
  updated_at?: string;
  caller_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  company_size: string | null;
  current_stack: string | null;
  pain_point: string | null;
  timeline: string | null;
  budget: string | null;
  score_company_size: number | null;
  score_tech_stack: number | null;
  score_pain_point: number | null;
  score_timeline: number | null;
  score_budget: number | null;
  score_engagement: number | null;
  total_score: number | null;
  lead_grade: "A" | "B" | "C" | null;
  call_id: string | null;
  call_duration_seconds: number | null;
  transcript: string | null;
  conversation_summary: string | null;
  sentiment: "positiv" | "neutral" | "negativ" | null;
  sentiment_score: number | null;
  sentiment_reason: string | null;
  objections_raised: string[] | null;
  drop_off_point: string | null;
  appointment_booked: boolean;
  appointment_datetime: string | null;
  cal_booking_id: string | null;
  call_started_at: string | null;
  is_decision_maker: boolean | null;
  status: 'new' | 'not_reached' | 'contacted' | 'qualified' | 'appointment_booked' | 'converted' | 'lost';
  next_steps: string[] | null;
  notes: string | null;
  briefing: string | null;
  briefing_generated_at: string | null;
  assigned_to: string | null;
  // Outbound fields
  campaign_id: string | null;
  call_direction: 'inbound' | 'outbound';
  disposition_code: DispositionCode | null;
  call_attempts: number;
  last_call_attempt_at: string | null;
  next_call_scheduled_at: string | null;
  voicemail_left: boolean;
  gatekeeper_name: string | null;
  callback_datetime: string | null;
  time_to_connect_seconds: number | null;
  is_dnc: boolean;
  dnc_reason: string | null;
  recording_url: string | null;
  legal_basis: string | null;
  lead_source: 'csv_import' | 'manual' | 'inbound_call' | 'api';
  follow_up_reason: string | null;
}

// --- Team Management ---
export interface TeamMember {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  email: string;
  role: 'sales_rep' | 'manager' | 'admin';
  avatar_url: string | null;
  is_active: boolean;
}

export const ROLE_LABELS: Record<TeamMember["role"], string> = {
  sales_rep: "Sales Rep",
  manager: "Manager",
  admin: "Admin",
};

// --- Objection Categories ---
export interface ObjectionCategory {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  counter_argument: string | null;
  is_active: boolean;
  occurrence_count: number;
}

// --- Scoring Dimensions ---
export type ScoringDimension =
  | 'company_size'
  | 'tech_stack'
  | 'pain_point'
  | 'timeline'
  | 'budget'
  | 'engagement'
  | 'sentiment'
  | 'objection'
  | 'drop_off'
  | 'general';

export const SCORING_DIMENSION_LABELS: Record<ScoringDimension, string> = {
  company_size: "Unternehmensgröße",
  tech_stack: "Tech-Stack",
  pain_point: "Pain Point",
  timeline: "Timeline",
  budget: "Budget",
  engagement: "Engagement",
  sentiment: "Stimmung",
  objection: "Einwand",
  drop_off: "Gesprächsabbruch",
  general: "Allgemein",
};

export const SCORING_DIMENSION_COLORS: Record<ScoringDimension, string> = {
  company_size: "bg-blue-500/10 text-blue-600 border-blue-200",
  tech_stack: "bg-purple-500/10 text-purple-600 border-purple-200",
  pain_point: "bg-orange-500/10 text-orange-600 border-orange-200",
  timeline: "bg-teal-500/10 text-teal-600 border-teal-200",
  budget: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  engagement: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  sentiment: "bg-pink-500/10 text-pink-600 border-pink-200",
  objection: "bg-red-500/10 text-red-600 border-red-200",
  drop_off: "bg-amber-500/10 text-amber-600 border-amber-200",
  general: "bg-gray-500/10 text-gray-600 border-gray-200",
};

// Sorted order for displaying dimensions
export const SCORING_DIMENSION_ORDER: ScoringDimension[] = [
  'company_size', 'tech_stack', 'pain_point', 'timeline', 'budget',
  'engagement', 'sentiment', 'objection', 'drop_off', 'general',
];

// --- Quotes ---
export interface LeadQuote {
  id: string;
  created_at: string;
  lead_id: string;
  quote_text: string;
  speaker: 'agent' | 'caller' | null;
  topic: string | null;
  sentiment: 'positiv' | 'neutral' | 'negativ' | null;
  context: string | null;
  scoring_dimension: ScoringDimension | null;
  score_value: number | null;
  // Joined from leads for display
  lead_name?: string;
  lead_company?: string;
}

export interface LeadFilters {
  grades: ("A" | "B" | "C")[];
  statuses: Lead["status"][];
  sentiments: (NonNullable<Lead["sentiment"]>)[];
  appointmentBooked: boolean | null;
  dateRange: { from: string | null; to: string | null };
  assignedTo: string | null;
  campaignId: string | null;
  dispositionCodes: DispositionCode[];
  isDnc: boolean | null;
  callDirection: Lead["call_direction"] | null;
}

export interface LeadUpdatePayload {
  caller_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  company_size?: string;
  current_stack?: string;
  pain_point?: string;
  timeline?: string;
  status?: Lead["status"];
  notes?: string;
  next_steps?: string[];
  assigned_to?: string | null;
  disposition_code?: DispositionCode;
  is_dnc?: boolean;
  dnc_reason?: string;
  callback_datetime?: string;
  next_call_scheduled_at?: string;
  follow_up_reason?: string;
  campaign_id?: string | null;
}

export const STATUS_LABELS: Record<Lead["status"], string> = {
  new: "Neu",
  not_reached: "Nicht erreicht",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  appointment_booked: "Termin gebucht",
  converted: "Konvertiert",
  lost: "Verloren",
};

export const STATUS_COLORS: Record<Lead["status"], string> = {
  new: "var(--muted-foreground)",
  not_reached: "var(--chart-3)",
  contacted: "var(--chart-1)",
  qualified: "var(--chart-5)",
  appointment_booked: "var(--score-warning)",
  converted: "var(--score-good)",
  lost: "var(--score-danger)",
};

export const SENTIMENT_LABELS: Record<NonNullable<Lead["sentiment"]>, string> = {
  positiv: "Positiv",
  neutral: "Neutral",
  negativ: "Negativ",
};

export const SENTIMENT_COLORS: Record<NonNullable<Lead["sentiment"]>, string> = {
  positiv: "var(--score-good)",
  neutral: "var(--score-warning)",
  negativ: "var(--score-danger)",
};

export type SortField = "caller_name" | "company" | "total_score" | "status" | "sentiment" | "call_duration_seconds" | "appointment_booked" | "created_at" | "call_attempts" | "disposition_code" | "next_call_scheduled_at";
export type SortDirection = "asc" | "desc";

export interface KPIData {
  totalCalls: number;
  callsToday: number;
  winRate: number;
  appointmentRate: number;
  avgDuration: number;
  aLeadsToday: number;
  gradeDistribution: { grade: string; count: number; color: string }[];
  objectionDistribution: { objection: string; count: number }[];
  recentLeads: Lead[];
  conversionTrend: { date: string; rate: number }[];
}

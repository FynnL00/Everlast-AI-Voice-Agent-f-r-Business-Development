export interface Lead {
  id: string;
  created_at: string;
  caller_name: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  company_size: string | null;
  current_stack: string | null;
  pain_point: string | null;
  timeline: string | null;
  score_company_size: number | null;
  score_tech_stack: number | null;
  score_pain_point: number | null;
  score_timeline: number | null;
  total_score: number | null;
  lead_grade: "A" | "B" | "C" | null;
  call_id: string | null;
  call_duration_seconds: number | null;
  transcript: string | null;
  conversation_summary: string | null;
  sentiment: "positiv" | "neutral" | "negativ" | null;
  objections_raised: string[] | null;
  drop_off_point: string | null;
  appointment_booked: boolean;
  appointment_datetime: string | null;
  cal_booking_id: string | null;
  call_started_at: string | null;
  is_decision_maker: boolean | null;
  status: 'new' | 'contacted' | 'qualified' | 'appointment_booked' | 'converted' | 'lost';
  next_steps: string[] | null;
  notes: string | null;
  briefing: string | null;
  briefing_generated_at: string | null;
}

export interface LeadFilters {
  grades: ("A" | "B" | "C")[];
  statuses: Lead["status"][];
  sentiments: (NonNullable<Lead["sentiment"]>)[];
  appointmentBooked: boolean | null;
  dateRange: { from: string | null; to: string | null };
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
}

export const STATUS_LABELS: Record<Lead["status"], string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  qualified: "Qualifiziert",
  appointment_booked: "Termin gebucht",
  converted: "Konvertiert",
  lost: "Verloren",
};

export const STATUS_COLORS: Record<Lead["status"], string> = {
  new: "#5e6278",
  contacted: "#3b82f6",
  qualified: "#8b5cf6",
  appointment_booked: "#f59e0b",
  converted: "#42d77d",
  lost: "#ef4444",
};

export const SENTIMENT_LABELS: Record<NonNullable<Lead["sentiment"]>, string> = {
  positiv: "Positiv",
  neutral: "Neutral",
  negativ: "Negativ",
};

export const SENTIMENT_COLORS: Record<NonNullable<Lead["sentiment"]>, string> = {
  positiv: "#42d77d",
  neutral: "#f59e0b",
  negativ: "#ef4444",
};

export type SortField = "caller_name" | "company" | "total_score" | "status" | "sentiment" | "call_duration_seconds" | "appointment_booked" | "created_at";
export type SortDirection = "asc" | "desc";

export interface KPIData {
  totalCalls: number;
  conversionRate: number;
  avgDuration: number;
  aLeadsToday: number;
  gradeDistribution: { grade: string; count: number; color: string }[];
  objectionDistribution: { objection: string; count: number }[];
  recentLeads: Lead[];
  conversionTrend: { date: string; rate: number }[];
}

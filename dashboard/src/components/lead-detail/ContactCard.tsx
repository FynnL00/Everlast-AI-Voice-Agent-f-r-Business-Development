"use client";

import { User, Building, Mail, Phone, Users, Wrench } from "lucide-react";
import type { Lead, LeadUpdatePayload } from "@/lib/types";
import Card from "@/components/ui/Card";
import EditableField from "./EditableField";

interface ContactCardProps {
  lead: Lead;
  onUpdate: (fields: Partial<LeadUpdatePayload>) => Promise<void>;
}

export default function ContactCard({ lead, onUpdate }: ContactCardProps) {
  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Kontaktdaten
      </h3>
      <div className="space-y-1">
        <EditableField
          icon={User}
          label="Name"
          value={lead.caller_name}
          onSave={(v) => onUpdate({ caller_name: v })}
        />
        <EditableField
          icon={Building}
          label="Firma"
          value={lead.company}
          onSave={(v) => onUpdate({ company: v })}
        />
        <EditableField
          icon={Mail}
          label="E-Mail"
          value={lead.email}
          type="email"
          onSave={(v) => onUpdate({ email: v })}
        />
        <EditableField
          icon={Phone}
          label="Telefon"
          value={lead.phone}
          type="tel"
          onSave={(v) => onUpdate({ phone: v })}
        />
        <EditableField
          icon={Users}
          label="Größe"
          value={lead.company_size}
          onSave={(v) => onUpdate({ company_size: v })}
        />
        <EditableField
          icon={Wrench}
          label="Tech-Stack"
          value={lead.current_stack}
          onSave={(v) => onUpdate({ current_stack: v })}
        />
      </div>
    </Card>
  );
}

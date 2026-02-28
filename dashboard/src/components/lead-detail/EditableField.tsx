"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string | null;
  onSave: (value: string) => Promise<void>;
  label: string;
  type?: "text" | "email" | "tel" | "textarea";
  icon?: LucideIcon;
}

export default function EditableField({
  value,
  onSave,
  label,
  type = "text",
  icon: Icon,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value ?? "");
  }, [value]);

  const handleSave = useCallback(async () => {
    const trimmed = editValue.trim();
    if (trimmed === (value ?? "")) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  }, [editValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value ?? "");
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type !== "textarea") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel, type]
  );

  if (isEditing) {
    const sharedClasses =
      "w-full bg-transparent border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors";

    return (
      <div className="flex items-start gap-3 py-2">
        {Icon && (
          <Icon
            size={16}
            className="text-[var(--muted)] mt-2.5 shrink-0"
          />
        )}
        <div className="flex-1">
          <span className="text-xs text-[var(--muted)] mb-1 block">
            {label}
          </span>
          {type === "textarea" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={cn(sharedClasses, "min-h-[80px] resize-y")}
              rows={3}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={sharedClasses}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-start gap-3 py-2 w-full text-left rounded-lg px-1 -mx-1 transition-all duration-150 hover:bg-white/5 group",
        isSaving && "opacity-50"
      )}
    >
      {Icon && (
        <Icon
          size={16}
          className="text-[var(--muted)] mt-0.5 shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-[var(--muted)] block">{label}</span>
        <span
          className={cn(
            "text-sm block truncate",
            value
              ? "text-[var(--foreground)]"
              : "text-[var(--muted)] italic"
          )}
        >
          {value || "\u2014"}
        </span>
      </div>
    </button>
  );
}

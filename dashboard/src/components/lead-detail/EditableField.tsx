"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, X, Loader2 } from "lucide-react";
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
      "w-full bg-transparent border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring transition-colors";

    return (
      <div className="flex items-start gap-3 py-2">
        {Icon && (
          <Icon
            size={16}
            className="text-muted-foreground mt-2.5 shrink-0"
          />
        )}
        <div className="flex-1">
          <span className="text-xs text-muted-foreground mb-1 block">
            {label}
          </span>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              {type === "textarea" ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
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
                  onKeyDown={handleKeyDown}
                  className={sharedClasses}
                />
              )}
            </div>
            <div className="flex gap-1 pb-0.5">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                title="Speichern"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                title="Abbrechen"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-start gap-3 py-2 w-full text-left rounded-lg px-2 -mx-2 transition-all duration-150 hover:bg-muted/50 group",
        isSaving && "opacity-50"
      )}
    >
      {Icon && (
        <Icon
          size={16}
          className="text-muted-foreground mt-0.5 shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground block">{label}</span>
        <span
          className={cn(
            "text-sm block truncate",
            value
              ? "text-foreground"
              : "text-muted-foreground italic"
          )}
        >
          {value || "\u2014"}
        </span>
      </div>
    </button>
  );
}

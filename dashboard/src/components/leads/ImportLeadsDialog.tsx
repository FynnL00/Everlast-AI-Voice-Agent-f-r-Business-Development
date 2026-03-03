"use client";

import { useState, useRef, useCallback } from "react";
import Dialog from "@/components/ui/dialog";
import { useCampaigns } from "@/lib/campaigns-context";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportLeadsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface ImportResult {
  created: number;
  updated: number;
  errors: number;
}

export default function ImportLeadsDialog({ open, onClose }: ImportLeadsDialogProps) {
  const { campaigns } = useCampaigns();

  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep(1);
    setFile(null);
    setPreview([]);
    setCampaignId("");
    setImporting(false);
    setResult(null);
    setError(null);
    setDragOver(false);
  }, []);

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseCSVPreview = (text: string): string[][] => {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    return lines.slice(0, 4).map((line) =>
      line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))
    );
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Bitte eine CSV-Datei auswählen");
      return;
    }
    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPreview(parseCSVPreview(text));
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFileSelect(selectedFile);
  };

  const downloadTemplate = () => {
    const headers = "caller_name,company,email,phone,company_size,current_stack,pain_point,timeline";
    const example = "Max Mustermann,Beispiel GmbH,max@beispiel.de,+491234567890,50 Mitarbeiter,Zapier,Manuelle Prozesse,1 Monat";
    const csv = `${headers}\n${example}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-import-vorlage.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (campaignId) {
        formData.append("campaign_id", campaignId);
      }

      const res = await fetch("/api/leads/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Import fehlgeschlagen");
        setImporting(false);
        return;
      }

      const data = await res.json();
      setResult({
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        errors: data.errors ?? 0,
      });
    } catch {
      setError("Netzwerkfehler beim Import");
    }
    setImporting(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} title="Leads importieren" className="max-w-xl">
      {result ? (
        /* Result Summary */
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
            <CheckCircle size={20} className="text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Import abgeschlossen</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {result.created} erstellt, {result.updated} aktualisiert
                {result.errors > 0 && `, ${result.errors} Fehler`}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      ) : step === 1 ? (
        /* Step 1: File Upload */
        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
              dragOver
                ? "border-primary bg-primary/5"
                : file
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-border hover:border-primary/50 hover:bg-sidebar-accent/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleInputChange}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet size={32} className="text-green-500" />
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  Klicken um andere Datei auszuwählen
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  CSV-Datei hierher ziehen
                </p>
                <p className="text-xs text-muted-foreground">
                  oder klicken zum Auswählen
                </p>
              </div>
            )}
          </div>

          {/* Template Download */}
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Download size={12} />
            Muster-CSV herunterladen
          </button>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-3 py-2 bg-sidebar-accent/50 text-xs font-semibold text-muted-foreground">
                Vorschau (erste {Math.min(preview.length, 3)} Zeilen)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <tbody>
                    {preview.slice(0, 4).map((row, i) => (
                      <tr
                        key={i}
                        className={cn(
                          "border-b border-border/30",
                          i === 0 && "bg-sidebar-accent/30 font-semibold"
                        )}
                      >
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-1.5 truncate max-w-[120px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground"
            >
              Abbrechen
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!file}
              className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Weiter
            </button>
          </div>
        </div>
      ) : (
        /* Step 2: Campaign Assignment */
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 border border-border">
            <FileSpreadsheet size={18} className="text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{file?.name}</p>
              <p className="text-xs text-muted-foreground">Bereit zum Import</p>
            </div>
          </div>

          {/* Campaign Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Kampagne zuordnen
            </label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1rem",
              }}
            >
              <option value="" className="bg-card text-foreground">
                Keine Kampagne (optional)
              </option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} className="bg-card text-foreground">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground"
            >
              Zurück
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {importing && <Loader2 size={14} className="animate-spin" />}
              Import starten
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

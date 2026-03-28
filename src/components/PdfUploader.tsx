"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  name: string;
  description: string;
}

const TEMPLATE_ICONS: Record<string, string> = {
  faktura: "receipt",
  sja: "shield",
  sertifikat: "award",
};

const TEMPLATE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  faktura: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  sja: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  sertifikat: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
};

function TemplateIcon({ type }: { type: string }) {
  const icon = TEMPLATE_ICONS[type] ?? "file";
  if (icon === "receipt")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2Z" />
        <path d="M8 10h8M8 14h4" />
      </svg>
    );
  if (icon === "shield")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5.5-3.8 10-8 11-4.2-1-8-5.5-8-11V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  if (icon === "award")
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
      </svg>
    );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

export function PdfUploader({ templates }: { templates: Template[] }) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pdf")) return;
      setFileName(file.name);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      if (selectedTemplate) {
        formData.append("templateId", selectedTemplate);
      }

      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.id) {
          router.push(`/extract/${data.id}`);
        }
      } catch {
        setIsUploading(false);
        setFileName(null);
      }
    },
    [selectedTemplate, router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  return (
    <div className="space-y-8">
      {/* Template selector */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-text-light">
            Dokumenttype
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Auto-detect option */}
          <button
            onClick={() => setSelectedTemplate(null)}
            className={`group relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
              selectedTemplate === null
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border-subtle hover:border-border bg-surface-raised"
            }`}
          >
            <div className={`p-1.5 rounded-lg ${selectedTemplate === null ? "text-primary" : "text-text-light"}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold block">Auto-detect</span>
              <span className="text-xs text-text-light">AI identifiserer typen</span>
            </div>
            {selectedTemplate === null && (
              <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>

          {templates.map((t) => {
            const colors = TEMPLATE_COLORS[t.id] ?? { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700" };
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`group relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${
                  selectedTemplate === t.id
                    ? `${colors.border} ${colors.bg} shadow-sm`
                    : "border-border-subtle hover:border-border bg-surface-raised"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${selectedTemplate === t.id ? colors.text : "text-text-light"}`}>
                  <TemplateIcon type={t.id} />
                </div>
                <div>
                  <span className="text-sm font-semibold block">{t.name}</span>
                  <span className="text-xs text-text-light line-clamp-1">
                    {t.description.slice(0, 40)}...
                  </span>
                </div>
                {selectedTemplate === t.id && (
                  <div className={`absolute top-2 right-2 h-2 w-2 rounded-full ${colors.text.replace("text-", "bg-")}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all ${
          isUploading
            ? "border-primary bg-primary/5"
            : isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-slate-300 hover:border-primary/50 animate-breathe"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />

        <div className="flex flex-col items-center justify-center py-16 px-8">
          {isUploading ? (
            <>
              <div className="relative mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary animate-pulse">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <p className="text-sm font-mono text-primary font-medium">
                Behandler {fileName}...
              </p>
              <p className="text-xs text-text-light mt-1">
                Konverterer sider og kjører AI-ekstraksjon
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 p-4 rounded-2xl bg-slate-100 group-hover:bg-primary/10 transition-colors">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-light">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-base font-semibold text-text">
                Slipp PDF her, eller klikk for å velge
              </p>
              <p className="text-sm text-text-light mt-1">
                Maks 20 MB · PDF-format
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

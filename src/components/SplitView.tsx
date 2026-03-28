"use client";

import { useState } from "react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { PageNavigator } from "./PageNavigator";

interface ExtractedField {
  name: string;
  value: string | null;
  confidence: number;
}

interface Page {
  pageNumber: number;
  imageBase64: string | null;
  pageData: ExtractedField[] | null;
  confidence: number | null;
}

interface ExtractionData {
  id: string;
  fileName: string;
  templateName: string | null;
  status: string;
  confidence: number | null;
  extractedData: ExtractedField[] | null;
  pageCount: number;
  pages: Page[];
}

export function SplitView({ data }: { data: ExtractionData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const page = data.pages.find((p) => p.pageNumber === currentPage);

  const fields = data.extractedData ?? [];
  const foundCount = fields.filter((f) => f.value !== null).length;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-surface-raised border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-text-light hover:text-text transition-colors flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Tilbake
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-text truncate max-w-[200px]">
            {data.fileName}
          </span>
          {data.templateName && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {data.templateName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-text-light">
            {foundCount}/{fields.length} felt
          </span>
          {data.confidence !== null && (
            <ConfidenceBadge confidence={data.confidence} />
          )}
          <ExportButtons fields={fields} fileName={data.fileName} />
        </div>
      </div>

      {/* Split content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: PDF Preview */}
        <div className="w-1/2 bg-panel flex flex-col">
          <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
            {page?.imageBase64 ? (
              <div className="relative rounded-lg overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${page.imageBase64}`}
                  alt={`Side ${currentPage}`}
                  className="max-w-full h-auto"
                />
                {/* Scan overlay when processing */}
                {data.status === "processing" && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-scan" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-inverse/40">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
                <span className="mt-3 text-sm font-mono">
                  {data.status === "processing"
                    ? "Konverterer PDF..."
                    : "Ingen forhåndsvisning"}
                </span>
              </div>
            )}
          </div>

          {/* Page nav */}
          {data.pageCount > 1 && (
            <div className="border-t border-panel-light px-6 py-3">
              <PageNavigator
                currentPage={currentPage}
                totalPages={data.pageCount}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Right: Extracted Data */}
        <div className="w-1/2 bg-surface overflow-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-mono uppercase tracking-widest text-text-light">
                Ekstraherte data
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {data.status === "processing" ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-4 flex-1 bg-slate-100 rounded" />
                  </div>
                ))}
                <p className="text-sm text-text-light font-mono mt-6">
                  AI analyserer dokumentet...
                </p>
              </div>
            ) : fields.length > 0 ? (
              <div className="space-y-1">
                {fields.map((field, i) => (
                  <div
                    key={field.name}
                    className="group flex items-start gap-4 p-3 rounded-xl hover:bg-surface-raised transition-colors animate-field-in"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="w-36 shrink-0">
                      <span className="text-xs font-mono text-text-light uppercase tracking-wide">
                        {field.name.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {field.value ? (
                        <span className="text-sm font-medium text-text break-words">
                          {field.value}
                        </span>
                      ) : (
                        <span className="text-sm text-danger/70 italic">
                          Ikke funnet
                        </span>
                      )}
                    </div>
                    <div className="shrink-0">
                      <ConfidenceBadge
                        confidence={field.confidence}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-light">
                Ingen data ble ekstrahert.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportButtons({
  fields,
  fileName,
}: {
  fields: ExtractedField[];
  fileName: string;
}) {
  const baseName = fileName.replace(/\.pdf$/i, "");

  const downloadCSV = () => {
    const header = fields.map((f) => `"${f.name}"`).join(",");
    const values = fields
      .map((f) => `"${(f.value ?? "").replace(/"/g, '""')}"`)
      .join(",");
    const csv = `${header}\n${values}`;
    download(csv, `${baseName}.csv`, "text/csv");
  };

  const downloadJSON = () => {
    const obj: Record<string, unknown> = {};
    for (const f of fields) {
      obj[f.name] = { value: f.value, confidence: f.confidence };
    }
    download(JSON.stringify(obj, null, 2), `${baseName}.json`, "application/json");
  };

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (fields.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={downloadCSV}
        className="text-xs font-mono px-3 py-1.5 rounded-lg border border-border bg-surface-raised text-text-light hover:text-text hover:border-primary/30 transition-all"
      >
        CSV
      </button>
      <button
        onClick={downloadJSON}
        className="text-xs font-mono px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
      >
        JSON
      </button>
    </div>
  );
}

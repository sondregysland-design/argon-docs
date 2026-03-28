import { db } from "@/lib/db";
import { extractions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function HistorikkPage() {
  const allExtractions = await db.query.extractions.findMany({
    orderBy: [desc(extractions.createdAt)],
  });

  return (
    <div className="bg-dotgrid min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-6 pt-12 pb-24">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-text-light">
              Ekstraksjonlogg
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-panel">
            Historikk
          </h1>
          <p className="text-text-light mt-2">
            Alle PDF-dokumenter som er behandlet. Klikk for å se detaljer eller
            eksportere på nytt.
          </p>
        </div>

        {allExtractions.length === 0 ? (
          <div className="text-center py-20 animate-fade-up">
            <div className="inline-flex p-4 rounded-2xl bg-surface-raised border border-border-subtle mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-light" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <p className="text-text-light font-medium">
              Ingen dokumenter behandlet ennå
            </p>
            <Link
              href="/"
              className="inline-block mt-4 text-sm text-primary hover:text-primary-dark font-medium"
            >
              Last opp ditt første dokument →
            </Link>
          </div>
        ) : (
          <div className="bg-surface-raised rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-text-light px-6 py-3">
                    Dokument
                  </th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-text-light px-6 py-3">
                    Mal
                  </th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-text-light px-6 py-3">
                    Sider
                  </th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-text-light px-6 py-3">
                    Konfidens
                  </th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-text-light px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-text-light px-6 py-3">
                    Dato
                  </th>
                </tr>
              </thead>
              <tbody>
                {allExtractions.map((ext, i) => (
                  <tr
                    key={ext.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface transition-colors animate-fade-up"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/extract/${ext.id}`}
                        className="text-sm font-medium text-text hover:text-primary transition-colors"
                      >
                        {ext.fileName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {ext.templateName ? (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {ext.templateName}
                        </span>
                      ) : (
                        <span className="text-xs text-text-light">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-text-light">
                      {ext.pageCount}
                    </td>
                    <td className="px-6 py-4">
                      {ext.confidence !== null ? (
                        <ConfidenceBar confidence={ext.confidence} />
                      ) : (
                        <span className="text-xs text-text-light">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ext.status} />
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-text-light">
                      {ext.createdAt
                        ? new Date(ext.createdAt).toLocaleDateString("nb-NO")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-text-light">{pct}%</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    processing: "bg-accent/10 text-accent",
    completed: "bg-success/10 text-success",
    failed: "bg-danger/10 text-danger",
  };

  const labels: Record<string, string> = {
    processing: "Behandler",
    completed: "Fullført",
    failed: "Feilet",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full ${styles[status] ?? "bg-slate-100 text-slate-500"}`}
    >
      {status === "processing" && (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
      )}
      {labels[status] ?? status}
    </span>
  );
}

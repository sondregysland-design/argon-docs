import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

interface TemplateField {
  name: string;
  description: string;
  type: string;
}

const TEMPLATE_ACCENTS: Record<string, { border: string; bg: string; dot: string }> = {
  faktura: { border: "border-l-blue-500", bg: "bg-blue-50", dot: "bg-blue-500" },
  sja: { border: "border-l-emerald-500", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  sertifikat: { border: "border-l-amber-500", bg: "bg-amber-50", dot: "bg-amber-500" },
};

export default async function MalerPage() {
  const allTemplates = await db.query.templates.findMany({
    orderBy: [desc(templates.usageCount)],
  });

  return (
    <div className="bg-dotgrid min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-4xl px-6 pt-12 pb-24">
        {/* Header */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-text-light">
              Dokumentmaler
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-panel">
            Maler
          </h1>
          <p className="text-text-light mt-2">
            Forhåndsdefinerte felt for ulike dokumenttyper. Maler styrer hva
            AI-en leter etter i dokumentet ditt.
          </p>
        </div>

        {/* Template grid */}
        <div className="space-y-4">
          {allTemplates.map((t, i) => {
            const fields: TemplateField[] = JSON.parse(t.fields);
            const accent = TEMPLATE_ACCENTS[t.id] ?? {
              border: "border-l-slate-400",
              bg: "bg-slate-50",
              dot: "bg-slate-400",
            };

            return (
              <div
                key={t.id}
                className={`bg-surface-raised rounded-xl border border-border overflow-hidden border-l-4 ${accent.border} animate-fade-up`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-text">
                          {t.name}
                        </h2>
                        {t.builtIn && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            Innebygd
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-light mt-1">
                        {t.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className="text-2xl font-bold font-mono text-text">
                        {t.usageCount}
                      </span>
                      <span className="block text-xs text-text-light">
                        brukt
                      </span>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-text-light uppercase tracking-wide">
                      {fields.length} felt
                    </span>
                    <div className="flex-1 h-px bg-border-subtle" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((f) => (
                      <span
                        key={f.name}
                        className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg ${accent.bg} text-text`}
                        title={f.description}
                      >
                        <span className={`h-1 w-1 rounded-full ${accent.dot}`} />
                        {f.name.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

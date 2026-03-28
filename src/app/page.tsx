import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PdfUploader } from "@/components/PdfUploader";

export default async function Home() {
  const allTemplates = await db.query.templates.findMany({
    orderBy: [desc(templates.usageCount)],
  });

  const templateData = allTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }));

  return (
    <div className="bg-dotgrid min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        {/* Header */}
        <div className="mb-12 animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-text-light">
              PDF Intelligence
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center text-panel leading-tight">
            Fra PDF til
            <span className="relative mx-2">
              <span className="relative z-10 text-primary">data</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/10 -skew-x-3 rounded" />
            </span>
            på sekunder
          </h1>

          <p className="text-center text-text-light mt-4 text-lg max-w-lg mx-auto leading-relaxed">
            Last opp et dokument. AI-en leser, forstår og ekstraherer
            strukturerte data — klar til eksport.
          </p>
        </div>

        {/* Upload section */}
        <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <PdfUploader templates={templateData} />
        </div>

        {/* Feature hints */}
        <div
          className="mt-16 grid grid-cols-3 gap-6 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          {[
            {
              label: "Maler",
              desc: "Faktura, SJA, sertifikat + egendefinerte",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ),
            },
            {
              label: "Eksport",
              desc: "CSV og JSON med ett klikk",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              ),
            },
            {
              label: "Historikk",
              desc: "Alle dokumenter lagret og søkbare",
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="p-2 rounded-lg bg-surface-raised border border-border-subtle text-text-light">
                {item.icon}
              </div>
              <span className="text-xs font-semibold text-text">
                {item.label}
              </span>
              <span className="text-xs text-text-light">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

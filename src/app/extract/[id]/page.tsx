"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { SplitView } from "@/components/SplitView";

interface ExtractionData {
  id: string;
  fileName: string;
  templateName: string | null;
  status: string;
  confidence: number | null;
  extractedData: Array<{
    name: string;
    value: string | null;
    confidence: number;
  }> | null;
  pageCount: number;
  pages: Array<{
    pageNumber: number;
    imageBase64: string | null;
    pageData: Array<{
      name: string;
      value: string | null;
      confidence: number;
    }> | null;
    confidence: number | null;
  }>;
}

export default function ExtractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ExtractionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const res = await fetch(`/api/extract/${id}`);
        if (!res.ok) {
          setError("Kunne ikke hente ekstraksjon.");
          return;
        }
        const json = await res.json();
        if (active) {
          setData(json);
          // Keep polling if still processing
          if (json.status === "processing") {
            setTimeout(poll, 2000);
          }
        }
      } catch {
        if (active) setError("Nettverksfeil.");
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-danger font-medium">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-sm text-text-light hover:text-text"
          >
            ← Tilbake
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-mono text-text-light">Laster...</span>
        </div>
      </div>
    );
  }

  if (data.status === "failed") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-danger font-medium">
            Ekstraksjon feilet. Vennligst pr&oslash;v igjen.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-sm text-text-light hover:text-text"
          >
            &larr; Last opp p&aring; nytt
          </button>
        </div>
      </div>
    );
  }

  return <SplitView data={data} />;
}

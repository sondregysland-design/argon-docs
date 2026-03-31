"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { SplitView } from "@/components/SplitView";
import type { ExtractionData } from "@/lib/types";

export default function ExtractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ExtractionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

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
          // Keep polling if still processing, with backoff
          if (json.status === "processing" || json.status === "uploading") {
            const delay = pollCount < 3 ? 1000 : pollCount < 6 ? 2000 : 4000;
            setPollCount((c) => c + 1);
            setTimeout(poll, delay);
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
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
          {data.errorMessage && (
            <p className="text-xs text-text-light mt-2">{data.errorMessage}</p>
          )}
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

import { db } from "@/lib/db";
import { extractions, extractionPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { runExtraction } from "@/lib/extraction/pipeline";
import type { NextRequest } from "next/server";

export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const extraction = await db.query.extractions.findFirst({
      where: eq(extractions.id, id),
    });

    if (!extraction) {
      return Response.json({ error: "Ikke funnet." }, { status: 404 });
    }

    // Verify all pages are uploaded
    const pages = await db.query.extractionPages.findMany({
      where: eq(extractionPages.extractionId, id),
    });

    if (pages.length !== extraction.pageCount) {
      return Response.json(
        { error: `Mangler sider: ${pages.length}/${extraction.pageCount}` },
        { status: 400 }
      );
    }

    // Set status to processing
    await db
      .update(extractions)
      .set({ status: "processing" })
      .where(eq(extractions.id, id));

    // Collect images in page order, filtering out any missing base64 values
    const images = pages
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => p.imageBase64)
      .filter(Boolean) as string[];

    if (images.length !== pages.length) {
      return Response.json(
        { error: "En eller flere sider mangler bildedata." },
        { status: 400 }
      );
    }

    // Run extraction inline (awaited) so it completes within the function timeout
    try {
      await runExtraction(id, images, extraction.templateId);
    } catch (e) {
      console.error("Extraction failed:", e);
      const errorMessage =
        e instanceof Error ? e.message : "Ukjent feil under ekstraksjon.";
      return Response.json(
        { ok: false, status: "failed", error: errorMessage },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, status: "completed" });
  } catch (error) {
    console.error("Run extraction error:", error);
    return Response.json({ error: "Feil ved oppstart." }, { status: 500 });
  }
}

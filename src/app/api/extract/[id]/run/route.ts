import { db } from "@/lib/db";
import { extractions, extractionPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { runExtraction } from "@/lib/extraction/pipeline";
import type { NextRequest } from "next/server";

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

    // Run extraction in background
    const images = pages
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => p.imageBase64!)
      .filter(Boolean);

    runExtraction(id, images, extraction.templateId).catch(console.error);

    return Response.json({ ok: true, status: "processing" });
  } catch (error) {
    console.error("Run extraction error:", error);
    return Response.json({ error: "Feil ved oppstart." }, { status: 500 });
  }
}

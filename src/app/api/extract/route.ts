import { db } from "@/lib/db";
import { extractions } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { runExtraction } from "@/lib/extraction/pipeline";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, templateId, images } = body as {
      fileName: string;
      templateId: string | null;
      images: string[];
    };

    if (!fileName || !fileName.endsWith(".pdf") || !images?.length) {
      return Response.json(
        { error: "Vennligst last opp en gyldig PDF-fil." },
        { status: 400 }
      );
    }

    const extractionId = generateId();

    // Create extraction record
    await db.insert(extractions).values({
      id: extractionId,
      templateId: templateId || null,
      fileName,
      status: "processing",
      pageCount: images.length,
    });

    // Run extraction in background (non-blocking)
    runExtraction(extractionId, images, templateId).catch(console.error);

    return Response.json({ id: extractionId, status: "processing" });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Noe gikk galt under opplasting." },
      { status: 500 }
    );
  }
}

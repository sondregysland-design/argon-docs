import { db } from "@/lib/db";
import { extractions } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { runExtraction } from "@/lib/extraction/pipeline";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const templateId = formData.get("templateId") as string | null;

    if (!file || !file.name.endsWith(".pdf")) {
      return Response.json(
        { error: "Vennligst last opp en gyldig PDF-fil." },
        { status: 400 }
      );
    }

    const extractionId = generateId();
    const pdfBuffer = await file.arrayBuffer();

    // Create extraction record
    await db.insert(extractions).values({
      id: extractionId,
      templateId: templateId || null,
      fileName: file.name,
      status: "processing",
    });

    // Run extraction in background (non-blocking)
    runExtraction(extractionId, pdfBuffer, templateId).catch(console.error);

    return Response.json({ id: extractionId, status: "processing" });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Noe gikk galt under opplasting." },
      { status: 500 }
    );
  }
}

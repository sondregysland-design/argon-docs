import { db } from "@/lib/db";
import { extractions } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, templateId, pageCount } = body as {
      fileName: string;
      templateId: string | null;
      pageCount: number;
    };

    if (!fileName || !fileName.endsWith(".pdf") || !pageCount) {
      return Response.json(
        { error: "Vennligst last opp en gyldig PDF-fil." },
        { status: 400 }
      );
    }

    const extractionId = generateId();

    await db.insert(extractions).values({
      id: extractionId,
      templateId: templateId || null,
      fileName,
      status: "uploading",
      pageCount,
    });

    return Response.json({ id: extractionId, status: "uploading" });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(
      { error: "Noe gikk galt under opplasting." },
      { status: 500 }
    );
  }
}

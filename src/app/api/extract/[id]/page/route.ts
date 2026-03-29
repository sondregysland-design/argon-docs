import { db } from "@/lib/db";
import { extractions, extractionPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { pageNumber, imageBase64 } = body as {
      pageNumber: number;
      imageBase64: string;
    };

    const extraction = await db.query.extractions.findFirst({
      where: eq(extractions.id, id),
    });

    if (!extraction || extraction.status !== "uploading") {
      return Response.json({ error: "Ugyldig ekstraksjon." }, { status: 400 });
    }

    const pageId = `${id}-page-${pageNumber}`;
    await db.insert(extractionPages).values({
      id: pageId,
      extractionId: id,
      pageNumber,
      imageBase64,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Page upload error:", error);
    return Response.json({ error: "Feil ved sideopplasting." }, { status: 500 });
  }
}

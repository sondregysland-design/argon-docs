import { db } from "@/lib/db";
import { extractions, extractionPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const extraction = await db.query.extractions.findFirst({
    where: eq(extractions.id, id),
  });

  if (!extraction) {
    return Response.json(
      { error: "Ekstraksjon ikke funnet." },
      { status: 404 }
    );
  }

  const pages = await db.query.extractionPages.findMany({
    where: eq(extractionPages.extractionId, id),
    orderBy: (ep, { asc }) => [asc(ep.pageNumber)],
  });

  return Response.json({
    ...extraction,
    extractedData: extraction.extractedData
      ? JSON.parse(extraction.extractedData)
      : null,
    pages: pages.map((p) => ({
      ...p,
      pageData: p.pageData ? JSON.parse(p.pageData) : null,
    })),
  });
}

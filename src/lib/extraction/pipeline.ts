import { db } from "../db";
import { extractions, extractionPages, templates } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { extractFromImage, type ExtractionResult, type ExtractedField } from "./claude";
import type { TemplateField } from "./templates";

export async function runExtraction(
  extractionId: string,
  images: string[],
  templateId: string | null
): Promise<void> {
  try {
    // Get template fields if a template is selected
    let fields: TemplateField[] | null = null;
    let templateName: string | undefined;

    if (templateId) {
      const template = await db.query.templates.findFirst({
        where: eq(templates.id, templateId),
      });
      if (template) {
        try {
          fields = JSON.parse(template.fields) as TemplateField[];
        } catch {
          console.error("Invalid template fields JSON");
        }
        templateName = template.name;
      }
    }

    // Extract data from all pages in parallel
    const allFields: ExtractedField[] = [];
    let totalConfidence = 0;
    let detectedType: string | undefined;

    const results = await Promise.all(
      images.map((pageImage) => extractFromImage(pageImage, fields, templateName))
    );

    // Update all pages in parallel
    await Promise.all(
      results.map((result, i) => {
        const pageId = `${extractionId}-page-${i + 1}`;
        return db
          .update(extractionPages)
          .set({
            pageData: JSON.stringify(result.fields),
            confidence: result.overallConfidence,
          })
          .where(eq(extractionPages.id, pageId));
      })
    );

    // Aggregate results
    for (const result of results) {
      if (!detectedType && result.detectedType) {
        detectedType = result.detectedType;
      }
      allFields.push(...result.fields);
      totalConfidence += result.overallConfidence;
    }

    // Merge fields across pages (deduplicate, keep highest confidence)
    const mergedFields = mergeFields(allFields);
    const avgConfidence =
      images.length > 0 ? totalConfidence / images.length : 0;

    // Update extraction with results
    await db
      .update(extractions)
      .set({
        extractedData: JSON.stringify(mergedFields),
        confidence: avgConfidence,
        templateName: detectedType ?? templateName ?? "Auto-detect",
        status: "completed",
      })
      .where(eq(extractions.id, extractionId));

    // Increment template usage count
    if (templateId) {
      await db
        .update(templates)
        .set({ usageCount: sql`${templates.usageCount} + 1` })
        .where(eq(templates.id, templateId));
    }
  } catch (error) {
    console.error("Extraction failed:", error);
    await db
      .update(extractions)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Ukjent feil",
      })
      .where(eq(extractions.id, extractionId));
  }
}

function mergeFields(
  fields: ExtractedField[]
): ExtractedField[] {
  const fieldMap = new Map<string, ExtractedField>();

  for (const field of fields) {
    const existing = fieldMap.get(field.name);
    if (!existing || field.confidence > existing.confidence) {
      fieldMap.set(field.name, field);
    }
  }

  return Array.from(fieldMap.values());
}

import { db } from "../db";
import { extractions, extractionPages, templates } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { pdfToImages } from "./pdf-to-images";
import { extractFromImage, type ExtractionResult } from "./claude";
import type { TemplateField } from "./templates";

export async function runExtraction(
  extractionId: string,
  pdfBuffer: ArrayBuffer,
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
        fields = JSON.parse(template.fields) as TemplateField[];
        templateName = template.name;
      }
    }

    // Convert PDF to images
    const images = await pdfToImages(pdfBuffer);

    await db
      .update(extractions)
      .set({ pageCount: images.length })
      .where(eq(extractions.id, extractionId));

    // Extract data from each page
    const allFields: ExtractionResult["fields"] = [];
    let totalConfidence = 0;
    let detectedType: string | undefined;

    for (let i = 0; i < images.length; i++) {
      const pageImage = images[i];
      const result = await extractFromImage(pageImage, fields, templateName);

      if (!detectedType && result.detectedType) {
        detectedType = result.detectedType;
      }

      // Store page result
      const pageId = `${extractionId}-page-${i + 1}`;
      await db.insert(extractionPages).values({
        id: pageId,
        extractionId,
        pageNumber: i + 1,
        imageBase64: pageImage,
        pageData: JSON.stringify(result.fields),
        confidence: result.overallConfidence,
      });

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
      .set({ status: "failed" })
      .where(eq(extractions.id, extractionId));
  }
}

function mergeFields(
  fields: ExtractionResult["fields"]
): ExtractionResult["fields"] {
  const fieldMap = new Map<string, ExtractionResult["fields"][0]>();

  for (const field of fields) {
    const existing = fieldMap.get(field.name);
    if (!existing || field.confidence > existing.confidence) {
      fieldMap.set(field.name, field);
    }
  }

  return Array.from(fieldMap.values());
}

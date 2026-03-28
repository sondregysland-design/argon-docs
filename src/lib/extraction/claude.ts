import Anthropic from "@anthropic-ai/sdk";
import type { TemplateField } from "./templates";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ExtractedField {
  name: string;
  value: string | null;
  confidence: number; // 0-1
}

export interface ExtractionResult {
  fields: ExtractedField[];
  overallConfidence: number;
  detectedType?: string;
}

function buildSystemPrompt(
  fields: TemplateField[] | null,
  templateName?: string
): string {
  if (fields) {
    const fieldList = fields
      .map((f) => `- "${f.name}" (${f.type}): ${f.description}`)
      .join("\n");

    return `Du er en ekspert på å ekstrahere strukturerte data fra norske dokumenter.
Du analyserer et bilde av en dokumentside og ekstraherer spesifikke felt.

Dokumenttype: ${templateName ?? "Ukjent"}

Felt som skal ekstraheres:
${fieldList}

Svar KUN med gyldig JSON i dette formatet:
{
  "fields": [
    { "name": "feltnavn", "value": "ekstrahert verdi eller null hvis ikke funnet", "confidence": 0.95 }
  ],
  "overallConfidence": 0.92,
  "detectedType": "${templateName ?? "auto"}"
}

Regler:
- Sett confidence mellom 0.0 og 1.0 for hvert felt
- Bruk null som value hvis feltet ikke finnes i dokumentet
- Behold originalt format for datoer og beløp som de står i dokumentet
- overallConfidence er gjennomsnittlig confidence for alle felt med verdi`;
  }

  // Auto-detect mode
  return `Du er en ekspert på å analysere norske dokumenter.
Analyser bildet og identifiser dokumenttypen, deretter ekstraher alle relevante felt.

Vanlige dokumenttyper: Faktura, SJA-skjema, Sertifikat, Rapport, Kontrakt

Svar KUN med gyldig JSON i dette formatet:
{
  "fields": [
    { "name": "feltnavn", "value": "ekstrahert verdi", "confidence": 0.95 }
  ],
  "overallConfidence": 0.92,
  "detectedType": "Identifisert dokumenttype"
}

Regler:
- Identifiser dokumenttypen først
- Ekstraher alle relevante felt du finner
- Sett confidence mellom 0.0 og 1.0 for hvert felt
- Bruk beskrivende norske feltnavn`;
}

export async function extractFromImage(
  imageBase64: string,
  fields: TemplateField[] | null,
  templateName?: string
): Promise<ExtractionResult> {
  const systemPrompt = buildSystemPrompt(fields, templateName);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: "Ekstraher data fra dette dokumentet.",
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from response (handle markdown code blocks)
  let jsonText = textBlock.text.trim();
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  const result: ExtractionResult = JSON.parse(jsonText);
  return result;
}

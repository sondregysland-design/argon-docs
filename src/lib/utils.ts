export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function fieldsToCSV(
  fields: Array<{ name: string; value: string | null }>
): string {
  const header = fields.map((f) => `"${f.name}"`).join(",");
  const values = fields.map((f) => `"${f.value ?? ""}"`).join(",");
  return `${header}\n${values}`;
}

export function fieldsToJSON(
  fields: Array<{ name: string; value: string | null; confidence: number }>
): string {
  const obj: Record<string, unknown> = {};
  for (const field of fields) {
    obj[field.name] = {
      value: field.value,
      confidence: field.confidence,
    };
  }
  return JSON.stringify(obj, null, 2);
}

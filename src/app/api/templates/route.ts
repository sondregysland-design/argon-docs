import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { generateId } from "@/lib/utils";
import { desc } from "drizzle-orm";

export async function GET() {
  const allTemplates = await db.query.templates.findMany({
    orderBy: [desc(templates.usageCount)],
  });

  return Response.json(
    allTemplates.map((t) => ({
      ...t,
      fields: JSON.parse(t.fields),
    }))
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, fields } = body;

    if (!name || !fields || !Array.isArray(fields)) {
      return Response.json(
        { error: "Navn og felt er påkrevd." },
        { status: 400 }
      );
    }

    const id = generateId();
    await db.insert(templates).values({
      id,
      name,
      description: description ?? "",
      fields: JSON.stringify(fields),
      builtIn: false,
    });

    return Response.json({ id, name });
  } catch (error) {
    console.error("Template creation error:", error);
    return Response.json(
      { error: "Kunne ikke opprette mal." },
      { status: 500 }
    );
  }
}

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { builtInTemplates } from "../extraction/templates";

async function seed() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:./data/argon-docs.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  console.log("Seeding built-in templates...");

  for (const template of builtInTemplates) {
    await db
      .insert(schema.templates)
      .values({
        id: template.id,
        name: template.name,
        description: template.description,
        fields: JSON.stringify(template.fields),
        builtIn: true,
      })
      .onConflictDoNothing();

    console.log(`  ✓ ${template.name}`);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

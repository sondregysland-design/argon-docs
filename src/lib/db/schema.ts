import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fields: text("fields").notNull(), // JSON: Array<{ name: string; description: string; type: string }>
  builtIn: integer("built_in", { mode: "boolean" }).notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const extractions = sqliteTable("extractions", {
  id: text("id").primaryKey(),
  templateId: text("template_id").references(() => templates.id),
  templateName: text("template_name"),
  fileName: text("file_name").notNull(),
  pageCount: integer("page_count").notNull().default(0),
  extractedData: text("extracted_data"), // JSON: extracted fields
  confidence: real("confidence"),
  status: text("status", {
    enum: ["uploading", "processing", "completed", "failed"],
  })
    .notNull()
    .default("processing"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const extractionPages = sqliteTable("extraction_pages", {
  id: text("id").primaryKey(),
  extractionId: text("extraction_id")
    .notNull()
    .references(() => extractions.id, { onDelete: "cascade" }),
  pageNumber: integer("page_number").notNull(),
  imageBase64: text("image_base64"),
  pageData: text("page_data"), // JSON: per-page extracted fields
  confidence: real("confidence"),
});

export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Extraction = typeof extractions.$inferSelect;
export type ExtractionPage = typeof extractionPages.$inferSelect;

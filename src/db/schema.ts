import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(new Date().toISOString()),
});

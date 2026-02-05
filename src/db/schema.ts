import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  task: text("task").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
});

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts", // Схем хаана байхыг заана
  out: "./drizzle", // SQL файлууд хаана үүсэхийг заана
  dialect: "sqlite",
  driver: "d1-http",
});

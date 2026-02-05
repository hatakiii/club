import { getRequestContext } from "@cloudflare/next-on-pages"; // Энэ мөрийг нэмэх
import { drizzle } from "drizzle-orm/d1";
import { todos } from "@/db/schema";

export async function getTodos() {
  try {
    // Cloudflare-ийн context-ийг авах
    const context = getRequestContext();
    const d1 = context?.env?.DB;

    if (!d1) {
      console.warn("❌ D1 Binding missing");
      return [];
    }

    const db = drizzle(d1);
    return await db.select().from(todos);
  } catch (e: any) {
    console.error("❌ DB Error:", e.message);
    return [];
  }
}

// src/lib/db.ts
import { getRequestContext } from "@cloudflare/next-on-pages"; // <--- Энэ мөрийг заавал нэмнэ
import { drizzle } from "drizzle-orm/d1";
import { todos } from "@/db/schema";

export async function getTodos() {
  try {
    // Cloudflare-ийн орчныг дуудах
    const context = getRequestContext();
    const d1 = context?.env?.DB;

    if (!d1) {
      console.warn("❌ D1 Binding missing");
      return [];
    }

    const db = drizzle(d1);
    // todos хүснэгтээс өгөгдөл унших
    return await db.select().from(todos);
  } catch (e: any) {
    console.error("❌ DB Error:", e.message);
    return [];
  }
}

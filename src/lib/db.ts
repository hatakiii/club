// src/lib/db.ts
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { todos } from "@/db/schema";

export async function getTodos() {
  try {
    const context = getRequestContext();

    // 1. Биндинг байгаа эсэхийг шалгах
    const d1 = context?.env?.DB;

    if (!d1) {
      console.error(
        "❌ D1 бааз олдсонгүй. wrangler.toml болон Bindings-ээ шалгана уу.",
      );
      return [];
    }

    const db = drizzle(d1);

    // 2. Өгөгдөл унших
    return await db.select().from(todos).all();
  } catch (e: any) {
    // Хэрэв хүснэгт байхгүй бол тодорхой алдаа хэлнэ
    console.error("❌ DB Error:", e.message);
    return [];
  }
}

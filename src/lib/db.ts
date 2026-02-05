// src/lib/db.ts
export async function getTodos() {
  try {
    const context = getRequestContext();
    const d1 = context?.env?.DB;

    if (!d1) {
      console.warn("⚠️ D1 Binding missing. Локал орчныг шалгаж байна...");
      return [];
    }

    const db = drizzle(d1);

    // SQL асуулгаар хүснэгт байгаа эсэхийг баталгаажуулах
    const tableCheck = await d1
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='todos'",
      )
      .get();

    if (!tableCheck) {
      console.error(
        "❌ 'todos' хүснэгт бааз дээр олдсонгүй. Migration-аа дахин шалгана уу.",
      );
      return [];
    }

    return await db.select().from(todos);
  } catch (e: any) {
    console.error("❌ DB Error:", e.message);
    return [];
  }
}

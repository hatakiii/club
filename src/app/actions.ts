"use server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { todos } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addTodo(formData: FormData) {
  const task = formData.get("task") as string;
  const { env } = getRequestContext();
  const db = drizzle(env.DB);

  await db.insert(todos).values({ task }).run();
  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  const { env } = getRequestContext();
  const db = drizzle(env.DB);

  await db.delete(todos).where(eq(todos.id, id)).run();
  revalidatePath("/");
}

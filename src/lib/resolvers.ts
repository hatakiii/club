//api/graphql/resolver.ts
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

export const resolvers = {
  Query: {
    getTodos: async (_: any, __: any, { db }: { db: any }) => {
      return await db.select().from(todos).all();
    },
  },
  Mutation: {
    addTodo: async (
      _: any,
      { task }: { task: string },
      { db }: { db: any },
    ) => {
      const result = await db.insert(todos).values({ task }).returning();
      return result[0];
    },
    deleteTodo: async (_: any, { id }: { id: number }, { db }: { db: any }) => {
      await db.delete(todos).where(eq(todos.id, id)).run();
      return true;
    },
  },
};

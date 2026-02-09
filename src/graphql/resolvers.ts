import { getRequestContext } from "@cloudflare/next-on-pages";

type MyEnv = {
  DB: import("@cloudflare/workers-types").D1Database;
};
export const resolvers = {
  Query: {
    getTodos: async () => {
      const { env } = getRequestContext() as unknown as { env: MyEnv };
      const { results } = await env.DB.prepare(
        "SELECT * FROM todos ORDER BY created_at DESC",
      ).all();
      return results;
    },
  },
  Mutation: {
    addTodo: async (_: unknown, { title }: { title: string }) => {
      const { env } = getRequestContext() as unknown as { env: MyEnv };
      return await env.DB.prepare(
        "INSERT INTO todos (title) VALUES (?) RETURNING *",
      )
        .bind(title)
        .first();
    },

    updateTodo: async (
      _: unknown,
      {
        id,
        title,
        is_completed,
      }: { id: number; title?: string; is_completed?: boolean },
    ) => {
      const { env } = getRequestContext() as unknown as { env: MyEnv };

      const { results } = await env.DB.prepare(
        "UPDATE todos SET title = COALESCE(?, title), is_completed = COALESCE(?, is_completed) WHERE id = ? RETURNING *",
      )
        .bind(
          title ?? null,
          is_completed !== undefined ? (is_completed ? 1 : 0) : null,
          id,
        )
        .all();

      return results[0];
    },

    deleteTodo: async (_: unknown, { id }: { id: number }) => {
      const { env } = getRequestContext() as unknown as { env: MyEnv };
      const { success } = await env.DB.prepare("DELETE FROM todos WHERE id = ?")
        .bind(id)
        .run();
      return success;
    },
  },
};

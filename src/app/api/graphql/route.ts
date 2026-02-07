import { ApolloServer, HeaderMap } from "@apollo/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type MyEnv = {
  DB: import("@cloudflare/workers-types").D1Database;
};

const typeDefs = `#graphql
  type Todo {
    id: Int
    title: String
    is_completed: Boolean
    created_at: String
  }
  type Query {
    getTodos: [Todo]
  }
  type Mutation {
    addTodo(title: String!): Todo
    updateTodo(id: Int!, is_completed: Boolean!): Todo
    deleteTodo(id: Int!): Boolean
  }
`;

const resolvers = {
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
      { id, is_completed }: { id: number; is_completed: boolean },
    ) => {
      const { env } = getRequestContext() as unknown as { env: MyEnv };
      return await env.DB.prepare(
        "UPDATE todos SET is_completed = ? WHERE id = ? RETURNING *",
      )
        .bind(is_completed ? 1 : 0, id)
        .first();
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

let startPromise: Promise<void> | null = null;

async function handler(request: NextRequest) {
  if (!startPromise) {
    startPromise = server.start();
  }
  await startPromise;

  const { method, headers } = request;
  const url = new URL(request.url);

  const headerMap = new HeaderMap();
  headers.forEach((value, key) => {
    headerMap.set(key, value);
  });

  let body: unknown = null;
  if (method === "POST") {
    try {
      body = await request.json();
    } catch (_e) {
      body = null;
    }
  }

  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      body,
      method,
      headers: headerMap,
      search: url.search,
    },
    context: async () => ({}),
  });

  const bodyString =
    httpGraphQLResponse.body.kind === "complete"
      ? httpGraphQLResponse.body.string
      : "";

  return new NextResponse(bodyString, {
    status: httpGraphQLResponse.status || 200,
    headers: Object.fromEntries(httpGraphQLResponse.headers.entries()),
  });
}

export { handler as GET, handler as POST };

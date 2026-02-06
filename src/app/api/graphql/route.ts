// src/app/api/graphql/route.ts

import { ApolloServer, HeaderMap } from "@apollo/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const typeDefs = `#graphql
  type Todo {
    id: Int
    task: String
    completed: Boolean
  }
  type Query {
    getTodos: [Todo]
  }
  type Mutation {
    addTodo(task: String!): Todo
    updateTodo(id: Int!, completed: Boolean!): Todo
    deleteTodo(id: Int!): Boolean
  }
`;

const resolvers = {
  Query: {
    getTodos: async (_: any, __: any, context: any) => {
      const db = context.env?.DB;
      if (!db) throw new Error("D1 Database binding missing in context");

      const { results } = await db
        .prepare("SELECT * FROM todos ORDER BY id DESC")
        .all();
      return results;
    },
  },
  Mutation: {
    addTodo: async (_: any, { task }: { task: string }, context: any) => {
      const db = context.env?.DB;
      return await db
        .prepare(
          "INSERT INTO todos (task, completed) VALUES (?, 0) RETURNING *",
        )
        .bind(task)
        .first();
    },

    updateTodo: async (
      _: any,
      { id, completed }: { id: number; completed: boolean },
      context: any,
    ) => {
      const db = context.env?.DB;
      // D1 дээр boolean нь 1 (true) эсвэл 0 (false) байдаг
      return await db
        .prepare("UPDATE todos SET completed = ? WHERE id = ? RETURNING *")
        .bind(completed ? 1 : 0, id)
        .first();
    },

    deleteTodo: async (_: any, { id }: { id: number }, context: any) => {
      const db = context.env?.DB;
      const { success } = await db
        .prepare("DELETE FROM todos WHERE id = ?")
        .bind(id)
        .run();
      return success;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

// Server-ийг эхлүүлэх функцийг handler дотор дуудна
async function handler(request: NextRequest) {
  await server.start(); // Энд заавал await хийх хэрэгтэй

  const { method, headers } = request;
  const url = new URL(request.url);
  const headerMap = new HeaderMap();
  headers.forEach((v, k) => headerMap.set(k, v));

  const body = method === "POST" ? await request.json() : null;

  const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: {
      body,
      method,
      headers: headerMap,
      search: url.search,
    },
    // CLOUDFLARE ENV-ИЙГ ЭНД ДАМЖУУЛНА
    context: async () => {
      const requestContext = getRequestContext();
      return { env: requestContext.env };
    },
  });

  // Хариуг буцаах
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

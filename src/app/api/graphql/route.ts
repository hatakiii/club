import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { resolvers } from "./resolvers";
import { NextRequest } from "next/server";

export const runtime = "edge";

// 1. Context-ийн төрлийг тодорхойлно (Алдаа 2345-ыг засахад тусална)
interface MyContext {
  db: any; // Эсвэл Drizzle-ийн тодорхой төрлийг энд бичнэ
}

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
    deleteTodo(id: Int!): Boolean
  }
`;

// 2. Apollo Server-т context төрлийг нь дамжуулна
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

// 3. Handler үүсгэхдээ NextRequest-ийг зааж өгнө
const handler = startServerAndCreateNextHandler<NextRequest, MyContext>(
  server,
  {
    context: async (request: NextRequest) => {
      const { env } = getRequestContext();
      const db = drizzle(env.DB);
      return { db };
    },
  },
);

/**
 * 4. Next.js App Router-ийн стандарт функцүүд.
 * 'as any' ашиглах нь Overload-ийн (Алдаа 2769) зөрчлийг арилгах хамгийн найдвартай арга юм.
 */
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

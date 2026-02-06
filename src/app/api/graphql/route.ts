//api/graphql/route.ts
import { ApolloServer, BaseContext } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { resolvers } from "./resolvers";
import { NextRequest } from "next/server";

export const runtime = "edge";

// 1. Context-ийн бүтцийг тодорхойлно
interface MyContext extends BaseContext {
  db: any;
}

const typeDefs = `#graphql
  type Todo { id: Int, task: String, completed: Boolean }
  type Query { getTodos: [Todo] }
  type Mutation { 
    addTodo(task: String!): Todo 
    deleteTodo(id: Int!): Boolean
  }
`;

// 2. Generic төрлийг ApolloServer-т өгнө
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

// 3. Handler-ийн generic төрлийг MyContext-той ижил болгоно
const handler = startServerAndCreateNextHandler<NextRequest, MyContext>(
  server,
  {
    context: async () => {
      const { env } = getRequestContext();

      if (!env?.DB) {
        throw new Error("D1 Database binding missing");
      }

      return {
        db: drizzle(env.DB),
      };
    },
  },
);

export async function GET(request: NextRequest) {
  return handler(request);
}
export async function POST(request: NextRequest) {
  return handler(request);
}

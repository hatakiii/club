import { ApolloServer, BaseContext } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { drizzle } from "drizzle-orm/d1";
import { resolvers } from "../../../lib/resolvers"; // Зам зөв эсэхийг шалгаарай
import { NextRequest } from "next/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";

export const runtime = "edge";

// 1. Context-ийн төрлийг тодорхойлно
interface MyContext extends BaseContext {
  db: any;
}

// 2. Schema тодорхойлно (Таны D1 хүснэгттэй яг таарч байгаа)
const typeDefs = `#graphql
  type Todo { id: Int, task: String, completed: Boolean }
  type Query { getTodos: [Todo] }
  type Mutation { 
    addTodo(task: String!): Todo 
    deleteTodo(id: Int!): Boolean
  }
`;

// 3. Server-ээ тохируулна
const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
  introspection: true, // Production-д схем харахыг зөвшөөрнө
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({ embed: true }), // Хөтөч дээр Sandbox харуулна
  ],
});

// 4. Handler үүсгэнэ
const handler = startServerAndCreateNextHandler<NextRequest, MyContext>(
  server,
  {
    context: async () => {
      // Cloudflare-ийн орчныг авах
      const { env } = getRequestContext();

      // env.DB байгаа эсэхийг шалгах, байхгүй бол process.env-ээс хайх
      const d1Database = env?.DB || (process.env as any).DB;

      if (!d1Database) {
        console.error("CRITICAL: D1 Database binding 'DB' is missing.");
        throw new Error(
          "D1 Database binding missing. Check Cloudflare Dashboard Settings.",
        );
      }

      return {
        db: drizzle(d1Database),
      };
    },
  },
);

// 5. GET болон POST хүсэлтийг экспортолно
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}

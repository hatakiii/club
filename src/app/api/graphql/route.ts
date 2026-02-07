//src/app/api/graphql/route.ts
import { ApolloServer, HeaderMap } from "@apollo/server";
import { NextRequest, NextResponse } from "next/server";
import { typeDefs } from "@/src/graphql/typeDefs";
import { resolvers } from "@/src/graphql/resolvers";

export const runtime = "edge";

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

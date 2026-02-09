import { ApolloServer, HeaderMap } from "@apollo/server";
import { NextRequest, NextResponse } from "next/server";
import { typeDefs } from "@/src/graphql/typeDefs";
import { resolvers } from "@/src/graphql/resolvers";
import { getRequestContext } from "@cloudflare/next-on-pages";

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
      console.log("_e", _e);
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
    context: async () => {
      try {
        const { env } = getRequestContext();
        return { env };
      } catch (e) {
        console.log("e", e);
        return {};
      }
    },
  });

  const bodyString =
    httpGraphQLResponse.body.kind === "complete"
      ? httpGraphQLResponse.body.string
      : "";

  const responseHeaders = Object.fromEntries(
    httpGraphQLResponse.headers.entries(),
  );

  return new NextResponse(bodyString, {
    status: httpGraphQLResponse.status || 200,
    headers: {
      ...responseHeaders,
      "Content-Type": "application/json",
    },
  });
}

export { handler as GET, handler as POST };

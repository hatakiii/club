import { POST } from "./route";
import { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

jest.mock("@cloudflare/next-on-pages");

interface GraphQLResponse {
  data?: {
    getTodos?: Array<{ id: number; title: string }>;
  };
  errors?: Array<{ message: string }>;
}

describe("GraphQL API Route", () => {
  it("should return a 200 status and mock data", async () => {
    // Database-ээс ирэх хариултыг дуурайлгах
    const mockData = [{ id: 1, title: "Test Todo", is_completed: 0 }];

    (getRequestContext as jest.Mock).mockReturnValue({
      env: {
        DB: {
          prepare: jest.fn().mockReturnThis(),
          all: jest.fn().mockResolvedValue({ results: mockData }),
        },
      },
    });

    const query = {
      query: "{ getTodos { id title } }",
    };

    const request = new NextRequest("http://localhost:3000/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });

    const response = await POST(request);
    const body = (await response.json()) as GraphQLResponse;

    expect(response.status).toBe(200);

    expect(body.data?.getTodos).toBeDefined();
    expect(body.data?.getTodos).toHaveLength(1);
    expect(body.data?.getTodos?.[0].title).toBe("Test Todo");
  });
});

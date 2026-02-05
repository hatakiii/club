// 1. Jest Mock-ыг хамгийн дээр нь байлгах
jest.mock(
  "@cloudflare/next-on-pages",
  () => ({
    getRequestContext: jest.fn().mockReturnValue({
      env: { DB: {} },
    }),
  }),
  { virtual: true },
);

import { resolvers } from "../app/api/graphql/resolvers";

describe("GraphQL Resolvers - Full CRUD Test", () => {
  //--- 1. Query: getTodos Тест ---
  it("getTodos query нь жагсаалт амжилттай буцаах ёстой", async () => {
    const mockData = [{ id: 1, task: "Test Task", completed: false }];

    const mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      all: jest.fn().mockResolvedValue(mockData),
    };

    // 'as any' ашиглан TypeScript-ийн төрөл шалгалтыг алгасна
    const result = await resolvers.Query.getTodos(null, null, {
      db: mockDb as any,
    });

    expect(result).toHaveLength(1);
    expect(result[0].task).toBe("Test Task");
    expect(mockDb.all).toHaveBeenCalled();
  });

  //--- 2. Mutation: addTodo Тест ---
  it("addTodo mutation нь шинэ ажил амжилттай нэмэх ёстой", async () => {
    const newTask = { id: 2, task: "Шинэ ажил нэмэх", completed: false };

    const mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([newTask]),
    };

    const result = await resolvers.Mutation.addTodo(
      null,
      { task: "Шинэ ажил нэмэх" },
      { db: mockDb as any }, // as any нэмэв
    );

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith({ task: "Шинэ ажил нэмэх" });
    expect(result.task).toBe("Шинэ ажил нэмэх");
    expect(result.id).toBe(2);
  });

  //--- 3. Mutation: deleteTodo Тест ---
  it("deleteTodo mutation нь өгөгдлийг амжилттай устгах ёстой", async () => {
    const mockDb = {
      delete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({}),
    };

    const result = await resolvers.Mutation.deleteTodo(
      null,
      { id: 1 },
      { db: mockDb as any }, // as any нэмэв
    );

    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

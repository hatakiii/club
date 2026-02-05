import { addTodo, deleteTodo } from "./actions";

export const runtime = "edge";

async function getTodos() {
  // Cloudflare орчинд дотоод URL дуудахад заримдаа бүтэн хаяг шаардлагатай
  const res = await fetch("http://localhost:3000/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `{ getTodos { id task completed } }`,
    }),
    next: { revalidate: 0 }, // Кэш хийхгүй
  });
  const { data }: any = await res.json();
  return data?.getTodos || [];
}

export default async function Home() {
  const allTodos = await getTodos();

  return (
    <main className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md text-black">
      <h1 className="text-2xl font-bold mb-6">GraphQL + D1 + Drizzle</h1>

      <form action={addTodo} className="flex gap-2 mb-6">
        <input
          name="task"
          required
          placeholder="Шинэ ажил..."
          className="flex-1 border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Нэмэх
        </button>
      </form>

      <ul className="space-y-3">
        {allTodos.map((todo: any) => (
          <li key={todo.id} className="flex justify-between border-b pb-2">
            <span>{todo.task}</span>
            <form action={deleteTodo.bind(null, todo.id)}>
              <button className="text-red-500 text-sm">Устгах</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}

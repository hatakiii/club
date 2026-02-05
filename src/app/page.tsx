//app/page.tsx
import { addTodo, deleteTodo } from "@/app/actions";
import { getTodos } from "@/lib/db";

export const runtime = "edge";
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

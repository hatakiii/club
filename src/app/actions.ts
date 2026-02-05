"use server";
import { revalidatePath } from "next/cache";

const GRAPHQL_ENDPOINT = "http://localhost:3000/api/graphql";

export async function addTodo(formData: FormData) {
  const task = formData.get("task") as string;

  await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation Add($task: String!) { addTodo(task: $task) { id } }`,
      variables: { task },
    }),
  });

  revalidatePath("/");
}

export async function deleteTodo(id: number) {
  await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation Delete($id: Int!) { deleteTodo(id: $id) }`,
      variables: { id },
    }),
  });

  revalidatePath("/");
}

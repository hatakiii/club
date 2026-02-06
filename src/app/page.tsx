"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Loader2, ClipboardList } from "lucide-react";

interface Todo {
  id: number;
  task: string; // <--- title биш task
  completed: boolean; // <--- is_completed биш completed
  __typename?: string;
}

interface GetTodosData {
  getTodos: Todo[];
}

const GET_TODOS = gql`
  query GetTodos {
    getTodos {
      id
      task # <--- 'title' биш 'task'
      completed # <--- 'is_completed' биш 'completed'
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($task: String!) {
    # $title биш $task
    addTodo(task: $task) {
      # title биш task
      id
      task
      completed
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($id: Int!, $completed: Boolean!) {
    # <--- 'is_completed' биш 'completed'
    updateTodo(id: $id, completed: $completed) {
      id
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: Int!) {
    deleteTodo(id: $id)
  }
`;

export default function Home() {
  const [text, setText] = useState("");

  const { data, loading, error } = useQuery<GetTodosData>(GET_TODOS);

  const [addTodo, { loading: addLoading }] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  const [updateTodo] = useMutation(UPDATE_TODO);

  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });
  const handleAdd = async () => {
    if (!text.trim()) return;
    // 'title: text' биш 'task: text' гэж явуулна
    await addTodo({ variables: { task: text } });
    setText("");
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    await updateTodo({
      variables: { id, completed: !currentStatus }, // is_completed биш
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    await deleteTodo({ variables: { id } });
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-10 bg-linear-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-950 dark:to-zinc-900">
      <Card className="w-full max-w-sm mx-4 shadow-md border border-blue-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-blue-600 tracking-tight">
            Tasks jokgbndfbndk
          </CardTitle>
        </CardHeader>

        <div className="px-4 pb-5">
          {/* Input */}
          <div className="flex gap-2 mb-5">
            <Input
              className="h-9 text-sm rounded-lg border-zinc-200 dark:border-zinc-800 focus-visible:ring-blue-400"
              placeholder="New task..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={addLoading}
            />
            <Button
              onClick={handleAdd}
              disabled={addLoading}
              className="h-9 px-4 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              {addLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400 opacity-70" />
              <p className="text-zinc-400 text-xs">Loading...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-xs text-center">
              {error.message}
            </div>
          ) : (
            <ul className="space-y-2">
              {data?.getTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 transition"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() =>
                        handleToggle(todo.id, todo.completed)
                      }
                      className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <span
                      className={`text-sm truncate ${
                        todo.completed
                          ? "line-through text-zinc-400 opacity-60"
                          : "text-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {todo.task}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}

              {data?.getTodos.length === 0 && (
                <div className="text-center py-12 border border-dashed border-blue-100 dark:border-zinc-800 rounded-xl flex flex-col items-center gap-2">
                  <ClipboardList className="w-7 h-7 text-blue-200 dark:text-zinc-700" />
                  <p className="text-zinc-400 text-xs italic">No tasks</p>
                </div>
              )}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

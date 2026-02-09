"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Loader2, ClipboardList, Edit2, Check, X } from "lucide-react";

type Todo = {
  id: number;
  title: string;
  is_completed: boolean;
  __typename?: string;
};

type GetTodosData = {
  getTodos: Todo[];
};

const GET_TODOS = gql`
  query GetTodos {
    getTodos {
      id
      title
      is_completed
    }
  }
`;

const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    addTodo(title: $title) {
      id
      title
      is_completed
    }
  }
`;

const UPDATE_TODO = gql`
  mutation UpdateTodo($id: Int!, $title: String, $is_completed: Boolean) {
    updateTodo(id: $id, title: $title, is_completed: $is_completed) {
      id
      title
      is_completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation DeleteTodo($id: Int!) {
    deleteTodo(id: $id)
  }
`;

export default function Home() {
  // --- States ---
  const [text, setText] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  // --- Apollo Hooks ---
  const { data, loading, error } = useQuery<GetTodosData>(GET_TODOS);

  const [addTodo, { loading: addLoading }] = useMutation(ADD_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  const [updateTodo] = useMutation(UPDATE_TODO);

  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  });

  // --- Functions ---
  const handleAdd = async () => {
    if (!text.trim()) return;
    try {
      await addTodo({ variables: { title: text } });
      setText("");
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await updateTodo({
        variables: { id, is_completed: !currentStatus },
        optimisticResponse: {
          updateTodo: {
            id,
            is_completed: !currentStatus,
            title: data?.getTodos.find((t) => t.id === id)?.title || "",
            __typename: "Todo",
          },
        },
      });
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleStartEdit = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditText(currentTitle);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;
    try {
      await updateTodo({
        variables: { id, title: editText },
        refetchQueries: [{ query: GET_TODOS }],
      });
      setEditingId(null);
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTodo({ variables: { id } });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // --- Filter Logic ---
  const filteredTodos = data?.getTodos.filter((todo) => {
    if (filter === "active") return !todo.is_completed;
    if (filter === "completed") return todo.is_completed;
    return true;
  });

  return (
    <div className="flex justify-center items-start min-h-screen pt-12 bg-[#050505] text-zinc-100 selection:bg-cyan-500 selection:text-black font-mono">
      {/* Background Glow Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full" />
      </div>

      <Card className="w-full max-w-md mx-4 bg-black/60 backdrop-blur-xl border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] rounded-none border-t-4 border-t-fuchsia-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-center font-black text-3xl text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-fuchsia-500 to-cyan-400 tracking-[0.2em] uppercase italic">
            SYSTEM_TASKS
          </CardTitle>

          {/* Tab Filter Navigation */}
          <div className="flex justify-center gap-2 pt-4">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[10px] px-3 py-1 border transition-all duration-300 uppercase tracking-widest ${
                  filter === f
                    ? "border-fuchsia-500 text-fuchsia-500 bg-fuchsia-500/10 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>

        <div className="px-6 pb-8 relative z-10">
          <div className="flex gap-2 mb-10">
            <Input
              className="bg-black/40 border-zinc-800 focus-visible:ring-fuchsia-500 focus-visible:border-fuchsia-500 rounded-none border-l-2 border-l-cyan-500 placeholder:text-zinc-600 text-cyan-50"
              placeholder="INPUT_NEW_DATA..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              disabled={addLoading}
            />
            <Button
              onClick={handleAdd}
              disabled={addLoading || !text.trim()}
              className="bg-transparent border border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500 hover:text-black font-bold px-6 transition-all duration-300 rounded-none shadow-[0_0_10px_rgba(217,70,239,0.3)]"
            >
              {addLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "EXECUTE"
              )}
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
              <p className="text-cyan-500/70 text-xs tracking-[0.3em] font-bold animate-pulse">
                SYNCING_DATABASE...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/20 border-l-4 border-red-600 text-red-400 text-xs font-bold tracking-widest uppercase">
              [ERROR]:: {error.message}
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredTodos?.map((todo) => (
                <li
                  key={todo.id}
                  className="group flex items-center justify-between p-4 border border-zinc-800 bg-zinc-900/30 hover:bg-cyan-950/10 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() =>
                        handleToggle(todo.id, todo.is_completed)
                      }
                      className="w-5 h-5 border-zinc-700 rounded-none data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />

                    {editingId === todo.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          autoFocus
                          className="bg-zinc-800/50 text-cyan-400 text-sm p-1 flex-1 outline-none border-b border-fuchsia-500 font-mono"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveEdit(todo.id)
                          }
                        />
                        <button
                          onClick={() => handleSaveEdit(todo.id)}
                          className="text-green-500 hover:text-green-400 transition-colors"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`text-sm font-bold tracking-wider transition-all truncate cursor-pointer ${
                          todo.is_completed
                            ? "line-through text-zinc-600 opacity-40 italic"
                            : "text-zinc-200 group-hover:text-cyan-400"
                        }`}
                        onClick={() => handleStartEdit(todo.id, todo.title)}
                      >
                        {todo.title}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-all">
                    {editingId !== todo.id && (
                      <button
                        onClick={() => handleStartEdit(todo.id, todo.title)}
                        className="p-1 text-zinc-500 hover:text-cyan-400 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-1 text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}

              {filteredTodos?.length === 0 && (
                <div className="text-center py-16 border border-dashed border-zinc-800 flex flex-col items-center gap-4 opacity-40">
                  <ClipboardList className="w-12 h-12 text-zinc-700" />
                  <p className="text-zinc-500 text-[10px] tracking-[0.4em] uppercase">
                    No_active_sequences_found
                  </p>
                </div>
              )}
            </ul>
          )}
        </div>

        <div className="px-6 py-2 bg-zinc-900/50 flex justify-between items-center border-t border-zinc-800">
          <div className="text-[10px] text-zinc-600 tracking-tighter">
            STATUS: ONLINE
          </div>
          <div className="text-[10px] text-zinc-600 tracking-tighter italic">
            V.2.1.0-STABLE
          </div>
        </div>
      </Card>
    </div>
  );
}

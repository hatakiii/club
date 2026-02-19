"use client";

import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex justify-center items-start min-h-screen pt-12 bg-[#020202] text-zinc-100 selection:bg-fuchsia-500 selection:text-white font-mono">
      {/* Сайжруулсан арын гэрэл (Background Glow) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-900/10 blur-[150px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[0%] right-[-10%] w-[40%] h-[60%] bg-cyan-900/10 blur-[150px] rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-md mx-4 bg-black/40 backdrop-blur-2xl border-zinc-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-xl border-t-1 border-white/10 relative overflow-hidden">
        {/* Scanning Line Effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20 animate-[scan_3s_linear_infinite]" />

        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-cyan-500 font-bold tracking-[0.5em] animate-pulse">
              TERMINAL_ACTIVE
            </span>
            <span className="text-[10px] text-zinc-600 font-bold">
              LOC: 127.0.0.1
            </span>
          </div>
          <CardTitle className="text-center font-black text-4xl text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tighter italic">
            TODO<span className="text-fuchsia-500">_</span>OS
          </CardTitle>

          {/* Сайжруулсан Tab Filter */}
          <div className="flex justify-center gap-1 pt-6">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[9px] px-4 py-1.5 transition-all duration-300 uppercase tracking-[0.2em] font-bold rounded-sm ${
                  filter === f
                    ? "bg-zinc-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>

        <div className="px-6 pb-8 relative z-10">
          <div className="group flex gap-2 mb-8 p-1 bg-zinc-900/50 border border-zinc-800 focus-within:border-fuchsia-500/50 transition-all">
            <Input
              className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-zinc-700 text-cyan-50"
              placeholder="NEW_TASK_ENTRY..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button
              onClick={handleAdd}
              disabled={addLoading || !text.trim()}
              className="bg-zinc-100 text-black hover:bg-fuchsia-500 hover:text-white font-bold transition-all duration-300 rounded-none"
            >
              {addLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "ADD"
              )}
            </Button>
          </div>

          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredTodos?.map((todo) => (
                <motion.li
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={todo.id}
                  className="group flex items-center justify-between p-3 border border-zinc-800/50 bg-zinc-900/20 hover:bg-white/[0.02] hover:border-zinc-600 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() =>
                        handleToggle(todo.id, todo.is_completed)
                      }
                      className="border-zinc-700 data-[state=checked]:bg-fuchsia-500 data-[state=checked]:border-fuchsia-500"
                    />

                    <span
                      className={`text-sm tracking-wide transition-all truncate ${
                        todo.is_completed
                          ? "text-zinc-600 line-through"
                          : "text-zinc-300"
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="p-2 text-zinc-600 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>

        <div className="px-6 py-3 bg-zinc-950/80 flex justify-between items-center border-t border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
              System_Optimal
            </span>
          </div>
          <span className="text-[9px] text-zinc-700 font-mono">
            CPU_USAGE: 2.4%
          </span>
        </div>
      </Card>
    </div>
  );
}

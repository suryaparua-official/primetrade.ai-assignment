"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Users,
  Loader2,
  ClipboardList,
  Shield,
} from "lucide-react";

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  color: "indigo" | "emerald" | "amber";
}) {
  const colors = {
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      icon: "text-indigo-400",
      num: "text-indigo-300",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: "text-emerald-400",
      num: "text-emerald-300",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: "text-amber-400",
      num: "text-amber-300",
    },
  };

  const c = colors[color];

  return (
    <div
      className={`bg-[#0d0d1a] border ${c.border} rounded-xl p-5 flex items-center gap-4`}
    >
      <div className={`${c.bg} ${c.border} border rounded-lg p-2.5`}>
        <span className={c.icon}>{icon}</span>
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium mb-0.5">{label}</p>
        <p className={`text-2xl font-bold ${c.num}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Task row ───────────────────────────────────────────────────────────────

type Task = {
  _id: string;
  title: string;
  description: string;
  completed?: boolean;
};

function TaskRow({
  task,
  onToggle,
  onDelete,
  onSave,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onSave: (title: string, desc: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onSave(editTitle, editDesc);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditing(false);
  };

  return (
    <div className="group bg-[#0d0d1a] border border-[#1a1a2e] hover:border-[#252540] rounded-xl p-4 transition-colors duration-150">
      {editing ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              autoFocus
              className="flex-1 bg-[#13131f] border border-[#1e1e30] focus:border-indigo-500/50 text-[#f1f5f9] placeholder-slate-700 rounded-md px-3 py-1.5 text-sm outline-none transition-colors"
            />
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              className="flex-[2] bg-[#13131f] border border-[#1e1e30] focus:border-indigo-500/50 text-[#f1f5f9] placeholder-slate-700 rounded-md px-3 py-1.5 text-sm outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-[#13131f] hover:bg-[#1a1a2e] border border-[#1e1e30] rounded-md transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
            >
              <Check size={12} />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <button
            onClick={onToggle}
            className="shrink-0 mt-0.5 text-slate-600 hover:text-indigo-400 transition-colors"
          >
            {task.completed ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <Circle size={18} />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium truncate ${
                task.completed
                  ? "line-through text-slate-600"
                  : "text-[#f1f5f9]"
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                task.completed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {task.completed ? "Done" : "Pending"}
            </span>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const {
    tasks,
    fetchTasks,
    createTask,
    deleteTask,
    updateTask,
    toggleTask,
    fetchUsers,
    deleteUser,
    token,
    role,
    initialized,
    loading,
  } = useApp();

  const [active, setActive] = useState("Dashboard");
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const [users, setUsers] = useState<any[]>([]);

  // auth guard
  useEffect(() => {
    if (!initialized) return;
    if (!token) {
      window.location.href = "/login";
    } else {
      fetchTasks();
    }
  }, [token, initialized]);

  // admin fetch
  useEffect(() => {
    if (active === "Admin" && role === "admin") {
      fetchUsers().then((data) => {
        if (data) setUsers(data);
      });
    }
  }, [active, role]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    await createTask(newTitle.trim(), newDesc.trim());
    setNewTitle("");
    setNewDesc("");
    setCreating(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="h-screen flex flex-col bg-[#080812] text-[#f1f5f9] overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={active} setActive={setActive} />

        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* ── Dashboard ── */}
            {active === "Dashboard" && (
              <div>
                <div className="mb-7">
                  <h1 className="text-xl font-semibold text-[#f1f5f9]">
                    Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Overview of your workspace
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <StatCard
                    label="Total Tasks"
                    value={tasks.length}
                    icon={<ListTodo size={18} />}
                    color="indigo"
                  />
                  <StatCard
                    label="Completed"
                    value={completedCount}
                    icon={<CheckCircle2 size={18} />}
                    color="emerald"
                  />
                  <StatCard
                    label="Pending"
                    value={pendingCount}
                    icon={<Clock3 size={18} />}
                    color="amber"
                  />
                </div>

                {tasks.length > 0 && (
                  <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                      Progress
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round((completedCount / tasks.length) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-9 text-right">
                        {Math.round((completedCount / tasks.length) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tasks ── */}
            {active === "Tasks" && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl font-semibold text-[#f1f5f9]">
                    Tasks
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Manage your personal task list
                  </p>
                </div>

                {/* Create form */}
                <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-4 mb-5">
                  <div className="flex gap-2">
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                      placeholder="Task title"
                      className="flex-1 bg-[#13131f] border border-[#1e1e30] focus:border-indigo-500/50 text-[#f1f5f9] placeholder-slate-700 rounded-md px-3 py-2 text-sm outline-none transition-colors"
                    />
                    <input
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                      placeholder="Description (optional)"
                      className="flex-[1.5] bg-[#13131f] border border-[#1e1e30] focus:border-indigo-500/50 text-[#f1f5f9] placeholder-slate-700 rounded-md px-3 py-2 text-sm outline-none transition-colors"
                    />
                    <button
                      onClick={handleCreate}
                      disabled={creating || !newTitle.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors duration-150 flex-shrink-0"
                    >
                      {creating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      Add
                    </button>
                  </div>
                </div>

                {/* Task list */}
                {loading ? (
                  <div className="flex justify-center py-16">
                    <Loader2
                      size={22}
                      className="animate-spin text-indigo-500"
                    />
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 bg-[#0d0d1a] border border-[#1a1a2e] rounded-2xl flex items-center justify-center mb-4">
                      <ClipboardList size={22} className="text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">
                      No tasks yet
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      Add your first task above to get started
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {tasks.map((t) => (
                      <TaskRow
                        key={t._id}
                        task={t}
                        onToggle={() => toggleTask(t._id, t.completed!)}
                        onDelete={() => deleteTask(t._id)}
                        onSave={(title, desc) =>
                          updateTask(t._id, { title, description: desc })
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Profile ── */}
            {active === "Profile" && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl font-semibold text-[#f1f5f9]">
                    Profile
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Your account details
                  </p>
                </div>

                <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl p-6 max-w-sm">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/25 flex items-center justify-center">
                      <Shield
                        size={20}
                        className={
                          role === "admin"
                            ? "text-violet-400"
                            : "text-indigo-400"
                        }
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#f1f5f9]">
                        Account
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Authenticated via JWT
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2.5 border-t border-[#1a1a2e]">
                      <span className="text-xs text-slate-500">Role</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          role === "admin"
                            ? "bg-violet-500/10 text-violet-400 border-violet-500/25"
                            : "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                        }`}
                      >
                        {role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 border-t border-[#1a1a2e]">
                      <span className="text-xs text-slate-500">
                        Tasks created
                      </span>
                      <span className="text-xs font-medium text-[#f1f5f9]">
                        {tasks.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2.5 border-t border-[#1a1a2e]">
                      <span className="text-xs text-slate-500">Completed</span>
                      <span className="text-xs font-medium text-emerald-400">
                        {completedCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Admin ── */}
            {active === "Admin" && role === "admin" && (
              <div>
                <div className="mb-6">
                  <h1 className="text-xl font-semibold text-[#f1f5f9]">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Manage registered users
                  </p>
                </div>

                <div className="bg-[#0d0d1a] border border-[#1a1a2e] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1a1a2e]">
                    <Users size={14} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-400">
                      {users.length} user{users.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Users size={20} className="text-slate-600 mb-3" />
                      <p className="text-slate-500 text-sm">No users found</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1a1a2e]">
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr
                            key={u._id}
                            className="border-b border-[#1a1a2e] last:border-0 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-5 py-3.5 text-sm font-medium text-[#f1f5f9]">
                              {u.name}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-slate-400">
                              {u.email}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                  u.role === "admin"
                                    ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                    : "bg-slate-800/60 text-slate-400 border-slate-700/60"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  deleteUser(u._id);
                                  setUsers((prev) =>
                                    prev.filter((x) => x._id !== u._id),
                                  );
                                }}
                                className="flex items-center gap-1.5 ml-auto px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/40 rounded-md transition-colors"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

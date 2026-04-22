"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

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
  } = useApp();

  const [active, setActive] = useState("Dashboard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [users, setUsers] = useState<any[]>([]);

  // ================= AUTH =================
  useEffect(() => {
    if (!initialized) return;

    if (!token) {
      window.location.href = "/login";
    } else {
      fetchTasks();
    }
  }, [token, initialized]);

  // ================= ADMIN =================
  useEffect(() => {
    if (active === "Admin" && role === "admin") {
      fetchUsers().then((data) => {
        if (data) setUsers(data);
      });
    }
  }, [active, role]);

  // ================= CREATE =================
  const handleCreate = async () => {
    if (!title || !description) return;

    await createTask(title, description);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={active} setActive={setActive} />

        <div className="flex-1 p-6 overflow-auto">
          {/* ===== Dashboard ===== */}
          {active === "Dashboard" && (
            <div>
              <h1 className="text-2xl font-semibold mb-6">
                Dashboard Overview
              </h1>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#181818] p-5 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Tasks</p>
                  <h2 className="text-xl">{tasks.length}</h2>
                </div>

                <div className="bg-[#181818] p-5 rounded-lg">
                  <p className="text-gray-400 text-sm">Completed</p>
                  <h2 className="text-xl">
                    {tasks.filter((t) => t.completed).length}
                  </h2>
                </div>

                <div className="bg-[#181818] p-5 rounded-lg">
                  <p className="text-gray-400 text-sm">Pending</p>
                  <h2 className="text-xl">
                    {tasks.filter((t) => !t.completed).length}
                  </h2>
                </div>
              </div>
            </div>
          )}

          {/* ===== Tasks ===== */}
          {active === "Tasks" && (
            <div>
              <h1 className="text-xl mb-4 font-semibold">Tasks</h1>

              {/* CREATE */}
              <div className="mb-6 flex gap-2">
                <input
                  className="p-2 bg-[#2a2a2a] rounded w-40 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <input
                  className="p-2 bg-[#2a2a2a] rounded w-60 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <button
                  className="bg-green-500 px-4 rounded hover:bg-green-600 transition"
                  onClick={handleCreate}
                >
                  Add
                </button>
              </div>

              {/* TASK LIST */}
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div
                    key={t._id}
                    className="bg-[#181818] p-4 rounded-lg flex justify-between items-center hover:bg-[#1f1f1f] transition"
                  >
                    {/* LEFT */}
                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTask(t._id, t.completed!)}
                        className="accent-green-500"
                      />

                      {editId === t._id ? (
                        <div className="flex gap-2 w-full">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-[#2a2a2a] p-1 rounded w-40"
                          />
                          <input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="bg-[#2a2a2a] p-1 rounded flex-1"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3
                            className={`font-medium ${
                              t.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {t.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {t.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex gap-2 ml-4">
                      {editId === t._id ? (
                        <>
                          <button
                            onClick={() => {
                              updateTask(t._id, {
                                title: editTitle,
                                description: editDesc,
                              });
                              setEditId(null);
                            }}
                            className="px-3 py-1 bg-green-500 rounded text-black text-sm hover:bg-green-600"
                          >
                            Save
                          </button>

                          <button
                            onClick={() => setEditId(null)}
                            className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditId(t._id);
                              setEditTitle(t.title);
                              setEditDesc(t.description);
                            }}
                            className="px-3 py-1 bg-blue-500 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteTask(t._id)}
                            className="px-3 py-1 bg-red-500 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Profile ===== */}
          {active === "Profile" && (
            <div>
              <h1 className="text-xl mb-4">Profile</h1>

              <div className="bg-[#181818] p-6 rounded w-400px">
                <p>
                  <span className="text-gray-500">Role:</span> {role}
                </p>
              </div>
            </div>
          )}

          {/* ===== Admin ===== */}
          {active === "Admin" && role === "admin" && (
            <div>
              <h1 className="text-2xl font-semibold mb-6">Admin Panel</h1>

              <div className="bg-[#181818] rounded-lg overflow-hidden border border-gray-800">
                <table className="w-full text-sm">
                  {/* HEADER */}
                  <thead className="bg-[#111] text-gray-400">
                    <tr>
                      <th className="text-left px-6 py-3">Name</th>
                      <th className="text-left px-6 py-3">Email</th>
                      <th className="text-left px-6 py-3">Role</th>
                      <th className="text-right px-6 py-3">Action</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody>
                    {users.map((u, index) => (
                      <tr
                        key={u._id}
                        className={`border-t border-gray-800 transition ${
                          index % 2 === 0 ? "bg-[#181818]" : "bg-[#141414]"
                        } hover:bg-[#1f1f1f]`}
                      >
                        <td className="px-6 py-4 font-medium">{u.name}</td>

                        <td className="px-6 py-4 text-gray-400">{u.email}</td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-700 text-gray-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              deleteUser(u._id);
                              setUsers((prev) =>
                                prev.filter((x) => x._id !== u._id),
                              );
                            }}
                            className="px-3 py-1 bg-red-500 rounded text-sm hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* EMPTY STATE */}
                {users.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  // ✅ single destructure (FIXED)
  const {
    tasks,
    fetchTasks,
    createTask,
    deleteTask,
    token,
    role,
    initialized,
  } = useApp();

  const [active, setActive] = useState("Dashboard");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ✅ safe auth check
  useEffect(() => {
    if (!initialized) return;

    if (!token) {
      window.location.href = "/login";
    } else {
      fetchTasks();
    }
  }, [token, initialized]);

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
              <h1 className="text-xl mb-4">Tasks</h1>

              <div className="mb-6 flex gap-2">
                <input
                  className="p-2 bg-[#2a2a2a] rounded w-40"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <input
                  className="p-2 bg-[#2a2a2a] rounded w-60"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <button
                  className="bg-green-500 px-4 rounded"
                  onClick={handleCreate}
                >
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {tasks.map((t) => (
                  <div
                    key={t._id}
                    className="bg-[#181818] p-4 rounded flex justify-between items-center"
                  >
                    <div>
                      <h3>{t.title}</h3>
                      <p className="text-sm text-gray-400">{t.description}</p>
                    </div>

                    <button
                      onClick={() => deleteTask(t._id)}
                      className="text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== Profile ===== */}
          {active === "Profile" && (
            <div>
              <h1 className="text-xl mb-4">Profile</h1>

              <div className="bg-[#181818] p-6 rounded w-[400px]">
                <p>
                  <span className="text-gray-500">Role:</span> {role}
                </p>
              </div>
            </div>
          )}

          {/* ===== Admin ===== */}
          {active === "Admin" && role === "admin" && (
            <div>
              <h1 className="text-xl mb-4">Admin Panel</h1>

              <div className="bg-[#181818] p-6 rounded space-y-4">
                <button className="bg-blue-500 px-4 py-2 rounded">
                  Get All Users
                </button>

                <button className="bg-yellow-500 px-4 py-2 rounded">
                  System Stats
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

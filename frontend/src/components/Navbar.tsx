"use client";

import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const { logout, role } = useApp();

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-[#121212] border-b border-gray-800">
      <h1 className="text-xl font-semibold">Primetrade.ai</h1>

      <div className="flex items-center gap-4">
        {role && (
          <span
            className={`px-3 py-1 rounded text-xs ${
              role === "admin" ? "bg-red-500 text-black" : "bg-gray-700"
            }`}
          >
            {role}
          </span>
        )}

        <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">
          Logout
        </button>
      </div>
    </div>
  );
}

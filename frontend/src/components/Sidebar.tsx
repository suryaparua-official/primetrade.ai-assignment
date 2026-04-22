"use client";

import { LayoutDashboard, ListTodo, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Sidebar({ active, setActive }: any) {
  const { role } = useApp();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Tasks", icon: ListTodo },
  ];

  if (role === "admin") {
    menu.push({ name: "Admin", icon: Shield });
  }

  return (
    <div className="w-64 bg-[#111] border-r border-gray-800 p-6">
      <h2 className="text-gray-500 text-sm mb-4">MENU</h2>

      <div className="flex flex-col gap-3">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
                active === item.name
                  ? "bg-green-500 text-black shadow-md"
                  : "text-gray-400 hover:bg-[#1f1f1f] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

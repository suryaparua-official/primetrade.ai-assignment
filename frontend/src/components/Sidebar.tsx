"use client";

import { LayoutDashboard, ListTodo, User, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Sidebar({ active, setActive }: any) {
  const { role } = useApp();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Tasks", icon: ListTodo },
    { name: "Profile", icon: User },
  ];

  if (role === "admin") {
    menu.push({ name: "Admin", icon: Shield });
  }

  return (
    <div className="w-64 bg-[#111] border-r border-gray-800 p-6">
      <div className="flex flex-col gap-4 mt-6">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex items-center gap-3 px-3 py-2 rounded ${
                active === item.name
                  ? "bg-green-500 text-black"
                  : "text-gray-400 hover:bg-[#1f1f1f]"
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

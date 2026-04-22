"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function Register() {
  const { registerUser } = useApp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitHandler = async (e: any) => {
    e.preventDefault();
    await registerUser(name, email, password);
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-black via-zinc-900 to-zinc-800">
      <form
        onSubmit={submitHandler}
        className="bg-white/5 backdrop-blur-lg border border-white/10 p-10 rounded-2xl w-380px space-y-6 shadow-2xl"
      >
        <h2 className="text-2xl font-semibold text-center text-white">
          Create Account
        </h2>

        <input
          className="w-full p-3 bg-[#2a2a2a] rounded-md text-white outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 bg-[#2a2a2a] rounded-md text-white outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 bg-[#2a2a2a] rounded-md text-white outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-green-500 hover:bg-green-600 transition py-3 rounded-md font-semibold">
          Sign Up
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-green-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </form>
    </div>
  );
}

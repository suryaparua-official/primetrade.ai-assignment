"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const router = useRouter();
  const { token, initialized } = useApp();

  useEffect(() => {
    if (!initialized) return;

    if (token) router.push("/dashboard");
    else router.push("/login");
  }, [token, initialized]);

  return null;
}

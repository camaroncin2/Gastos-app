"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useStore((s) => s.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return <>{children}</>;
}

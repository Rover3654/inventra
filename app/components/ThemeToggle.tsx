"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Beim ersten Laden: aus localStorage lesen (oder "dark" setzen)
  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("theme")) as "light" | "dark" | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  // Beim Umschalten: html-Klasse setzen & speichern
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 text-sm rounded-md border border-neutral-600/40 hover:bg-neutral-800/40
                 bg-neutral-900/50 text-neutral-100 fixed top-3 right-3"
      title="Theme umschalten"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

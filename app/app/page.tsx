"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? "Fehler: " + error.message : "Registriert. Jetzt einloggen.");
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? "Fehler: " + error.message : "Eingeloggt!");
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventra – Login</h1>
      <input
        className="w-full mb-2 px-3 py-2 rounded border"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full mb-3 px-3 py-2 rounded border"
        placeholder="Passwort"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-blue-600" onClick={signIn}>Einloggen</button>
        <button className="px-3 py-2 rounded bg-neutral-700" onClick={signUp}>Registrieren</button>
      </div>
      {msg && <p className="mt-3 text-sm opacity-80">{msg}</p>}
    </main>
  );
}

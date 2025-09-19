"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setLoggedIn(!!s);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password: pw });
    setMsg(error ? "Fehler: " + error.message : "Registriert. Prüfe E-Mail oder logge dich ein.");
  }
  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setMsg(error ? "Fehler: " + error.message : "Eingeloggt!");
  }

  if (loggedIn) {
    return (
      <main className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Willkommen 👋</h1>
        <p>Nutze die Navigation oben: <a className="underline" href="/inventory">Bestand</a> oder <a className="underline" href="/activities">Aktivitäten</a>.</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Inventra – Login</h1>
      <input className="w-full mb-2 px-3 py-2 rounded border bg-transparent" placeholder="E-Mail" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full mb-3 px-3 py-2 rounded border bg-transparent" placeholder="Passwort" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-blue-600" onClick={signIn}>Einloggen</button>
        <button className="px-3 py-2 rounded bg-neutral-700" onClick={signUp}>Registrieren</button>
      </div>
      {msg && <p className="mt-3 text-sm opacity-80">{msg}</p>}
    </main>
  );
}

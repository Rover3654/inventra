"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setOk(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setOk(!!s);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (!ready) return <div className="p-6">Lade…</div>;
  if (!ok) return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-2">Bitte einloggen</h1>
      <p><a className="underline" href="/">Zum Login</a></p>
    </main>
  );

  return <>{children}</>;
}

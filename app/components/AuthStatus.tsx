"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthStatus() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // 1) Aktuelle Session laden
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });
    // 2) Auf Login/Logout reagieren (bleibt automatisch erhalten)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="px-4 py-2 text-sm opacity-80">
      {email ? (
        <div className="flex items-center gap-3">
          <span>Eingeloggt als {email}</span>
          <button onClick={signOut} className="px-2 py-1 rounded bg-neutral-700">Logout</button>
        </div>
      ) : (
        <span>Nicht eingeloggt</span>
      )}
    </div>
  );
}

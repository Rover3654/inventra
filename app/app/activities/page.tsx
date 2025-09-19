"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "../../components/RequireAuth";


type Item = { id: string; name: string };
type Activity = {
  id: string;
  ts: string;
  type: string;
  qty: number | null;
  note: string | null;
  items: { name: string | null } | null;
};

export default function ActivitiesPage() {
  // --- Form States ---
  const [items, setItems] = useState<Item[]>([]);
  const [type, setType] = useState("STOCK_OUT");
  const [itemId, setItemId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // --- Daten aus DB ---
  const [rows, setRows] = useState<Activity[]>([]);

  // --- Filter States ---
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");

  async function loadItems() {
    const { data } = await supabase.from("items").select("id,name").order("name", { ascending: true });
    if (data) {
      setItems(data);
      if (!itemId && data[0]) setItemId(data[0].id);
    }
  }

  async function loadActivities() {
    const { data } = await supabase
      .from("activities")
      .select("id,ts,type,qty,note,items(name)")
      .order("ts", { ascending: false })
      .limit(200);
    setRows(data || []);
  }

  useEffect(() => {
    loadItems();
    loadActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addActivity() {
    setMsg(null);
    const { error } = await supabase.from("activities").insert({
      type,
      item_id: itemId || null,
      qty,
      note,
      user_email: "demo@inventra",
    });
    if (error) setMsg("Fehler: " + error.message);
    else {
      setNote("");
      setMsg("Gespeichert ✅");
      loadActivities();
    }
  }

  // Clientseitiges Filtern
  const filtered = rows.filter((r) => {
    if (filterType !== "ALL" && r.type !== filterType) return false;
    const ts = new Date(r.ts);
    if (filterFrom && ts < new Date(filterFrom)) return false;
    if (filterTo && ts > new Date(filterTo + "T23:59:59")) return false;
    return true;
  });

  return (
    <RequireAuth>
      <main className="p-6 max-w-3xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold">Aktivitäten</h1>

        {/* Formular: neue Aktivität */}
        <section className="grid gap-2 sm:grid-cols-5 items-start">
          <select className="px-3 py-2 rounded border bg-transparent" value={type} onChange={(e) => setType(e.target.value)}>
            <option>STOCK_IN</option>
            <option>STOCK_OUT</option>
            <option>ADJUSTMENT</option>
            <option>LOSS</option>
          </select>

          <select className="px-3 py-2 rounded border bg-transparent" value={itemId} onChange={(e) => setItemId(e.target.value)}>
            {items.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name}
              </option>
            ))}
          </select>

          <input className="px-3 py-2 rounded border bg-transparent" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />

          <input
            className="px-3 py-2 rounded border bg-transparent sm:col-span-2"
            placeholder="Notiz (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <button className="px-3 py-2 rounded bg-blue-600 sm:col-span-1" onClick={addActivity}>
            Speichern
          </button>
        </section>

        {msg && <p className="text-sm opacity-80">{msg}</p>}

        {/* Filter UI */}
        <section className="flex flex-wrap gap-2 items-center">
          <select className="px-3 py-2 rounded border bg-transparent" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="ALL">Alle Typen</option>
            <option value="STOCK_IN">STOCK_IN</option>
            <option value="STOCK_OUT">STOCK_OUT</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
            <option value="LOSS">LOSS</option>
          </select>

          <input type="date" className="px-3 py-2 rounded border bg-transparent" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
          <input type="date" className="px-3 py-2 rounded border bg-transparent" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
        </section>

        {/* Liste der (gefilterten) Aktivitäten */}
        <ul className="space-y-2">
          {filtered.map((r) => (
            <li key={r.id} className="p-3 rounded border">
              <div className="text-sm opacity-80">{new Date(r.ts).toLocaleString()}</div>
              <div className="font-medium">
                {r.type} • {r.items?.name ?? "—"} • {r.qty ?? "—"}
              </div>
              {r.note && <div className="text-sm opacity-80">{r.note}</div>}
            </li>
          ))}
          {filtered.length === 0 && <li className="p-3 rounded border text-sm opacity-75">Keine Aktivitäten für diesen Filter.</li>}
        </ul>
      </main>
    </RequireAuth>
  );
}

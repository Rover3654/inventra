"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = { id: string; name: string; };
type Activity = { id: string; ts: string; type: string; qty: number | null; note: string | null; items: { name: string | null } | null };

export default function ActivitiesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [type, setType] = useState("STOCK_OUT");
  const [itemId, setItemId] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [note, setNote] = useState("");

  const [rows, setRows] = useState<Activity[]>([]);

  async function loadItems() {
    const { data } = await supabase.from("items").select("id,name").order("name");
    setItems(data || []);
    if (data?.[0]) setItemId(data[0].id);
  }

  async function loadActivities() {
    const { data } = await supabase
      .from("activities")
      .select("id,ts,type,qty,note,items(name)")
      .order("ts", { ascending: false })
      .limit(20);
    setRows(data || []);
  }

  useEffect(() => { loadItems(); loadActivities(); }, []);

  async function addActivity() {
    await supabase.from("activities").insert({
      type, item_id: itemId || null, qty, note, user_email: "demo@inventra",
    });
    setNote("");
    loadActivities();
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Aktivitäten</h1>

      <div className="mb-5 grid gap-2 sm:grid-cols-4">
        <select className="px-3 py-2 rounded border" value={type} onChange={e=>setType(e.target.value)}>
          <option>STOCK_IN</option>
          <option>STOCK_OUT</option>
          <option>ADJUSTMENT</option>
          <option>LOSS</option>
        </select>
        <select className="px-3 py-2 rounded border" value={itemId} onChange={e=>setItemId(e.target.value)}>
          {items.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
        </select>
        <input className="px-3 py-2 rounded border" type="number" value={qty} onChange={e=>setQty(Number(e.target.value))} />
        <input className="px-3 py-2 rounded border" placeholder="Notiz" value={note} onChange={e=>setNote(e.target.value)} />
        <button className="px-3 py-2 rounded bg-blue-600" onClick={addActivity}>Speichern</button>
      </div>

      <ul className="space-y-2">
        {rows.map(r => (
          <li key={r.id} className="p-3 rounded border">
            <div className="text-sm opacity-80">{new Date(r.ts).toLocaleString()}</div>
            <div className="font-medium">{r.type} • {r.items?.name ?? "—"} • {r.qty ?? "—"}</div>
            {r.note && <div className="text-sm opacity-80">{r.note}</div>}
          </li>
        ))}
      </ul>
    </main>
  );
}

"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = { id: string; name: string; unit: string | null; min_stock: number | null; };

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [min, setMin] = useState<number>(0);

  async function load() {
    const { data } = await supabase.from("items").select("id,name,unit,min_stock").order("name");
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function addItem() {
    await supabase.from("items").insert({ name, unit, min_stock: min });
    setName(""); setUnit(""); setMin(0);
    load();
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bestand</h1>
      <div className="mb-6 grid gap-2 sm:grid-cols-3">
        <input className="px-3 py-2 rounded border" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="px-3 py-2 rounded border" placeholder="Einheit (z.B. Flasche)" value={unit} onChange={e=>setUnit(e.target.value)} />
        <input className="px-3 py-2 rounded border" placeholder="Mindestbestand" type="number" value={min} onChange={e=>setMin(Number(e.target.value))} />
        <button className="px-3 py-2 rounded bg-blue-600" onClick={addItem}>Neues Item</button>
      </div>

      <ul className="space-y-2">
        {items.map(it => (
          <li key={it.id} className="p-3 rounded border">
            <div className="font-medium">{it.name}</div>
            <div className="text-sm opacity-80">{it.unit ?? "—"} • Min: {it.min_stock ?? 0}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}

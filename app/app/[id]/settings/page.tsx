"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "../../../components/RequireAuth";

type Item = {
  id: string;
  name: string;
  min_stock: number | null;
  low_stock_enabled: boolean | null;
  low_stock_threshold: number | null;
};
type StockRow = { stock: number | null };

export default function ItemSettingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [stock, setStock] = useState<number>(0);
  const [enabled, setEnabled] = useState(true);
  const [threshold, setThreshold] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("items")
      .select("id,name,min_stock,low_stock_enabled,low_stock_threshold")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      setItem(data as Item);
      setEnabled((data.low_stock_enabled ?? true) as boolean);
      setThreshold((data.low_stock_threshold ?? data.min_stock ?? 0) as number);
      setMinStock((data.min_stock ?? 0) as number);
    }

    const stockRes = await supabase
      .from("item_stock")
      .select("stock")
      .eq("item_id", id)
      .maybeSingle();
    setStock((stockRes.data?.stock ?? 0) as number);
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function save() {
    setMsg(null);
    const { error } = await supabase
      .from("items")
      .update({
        low_stock_enabled: enabled,
        low_stock_threshold: threshold,
        min_stock: minStock,
      })
      .eq("id", id);
    setMsg(error ? "Fehler: " + error.message : "Gespeichert ✅");
  }

  if (!item) return (
    <RequireAuth>
      <main className="p-6 max-w-xl mx-auto">Lade…</main>
    </RequireAuth>
  );

  return (
    <RequireAuth>
      <main className="p-6 max-w-xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Low-Stock für „{item.name}“</h1>
          <button className="px-3 py-1.5 rounded border" onClick={()=>router.back()}>Zurück</button>
        </div>

        <div className="rounded-xl border p-4 space-y-3">
          <div className="text-sm opacity-80">Aktueller Bestand: <b>{stock}</b></div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={(e)=>setEnabled(e.target.checked)} />
            <span>Low-Stock-Warnung aktiv</span>
          </label>

          <label className="block">
            <span className="text-sm opacity-80">Low-Stock-Schwelle</span>
            <input type="number" className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
                   value={threshold} onChange={e=>setThreshold(Number(e.target.value))} />
            <span className="text-xs opacity-60">Wird verwendet, wenn gesetzt. Sonst verwenden wir den Mindestbestand.</span>
          </label>

          <label className="block">
            <span className="text-sm opacity-80">Mindestbestand (Fallback)</span>
            <input type="number" className="mt-1 w-full px-3 py-2 rounded border bg-transparent"
                   value={minStock} onChange={e=>setMinStock(Number(e.target.value))} />
          </label>

          <div className="flex gap-2">
            <button className="px-3 py-2 rounded bg-blue-600" onClick={save}>Speichern</button>
            <button className="px-3 py-2 rounded border" onClick={load}>Zurücksetzen</button>
          </div>

          {msg && <p className="text-sm opacity-80">{msg}</p>}
        </div>
      </main>
    </RequireAuth>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import RequireAuth from "../../components/RequireAuth";

type ItemRow = {
  id: string;
  name: string;
  unit: string | null;
  min_stock: number | null;
  low_stock_enabled: boolean | null;
  low_stock_threshold: number | null;
  item_stock: { stock: number | null } | null;
};

export default function InventoryPage() {
  const [items, setItems] = useState<ItemRow[]>([]);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [min, setMin] = useState<number>(0);
  const [msg, setMsg] = useState<string | null>(null);

  // Kontextmenü
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{x:number;y:number}>({x:0,y:0});
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  function closeMenu() { setMenuOpen(false); setMenuItemId(null); }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("items")
      .select("id,name,unit,min_stock,low_stock_enabled,low_stock_threshold,item_stock(stock)")
      .order("name", { ascending: true });
    if (!error && data) setItems(data as ItemRow[]);
  }

  async function addItem() {
    setMsg(null);
    if (!name.trim()) return setMsg("Bitte einen Namen eingeben.");
    const { error } = await supabase.from("items").insert({
      name, unit: unit || null, min_stock: isNaN(min) ? 0 : min
    });
    if (error) setMsg("Fehler: " + error.message);
    else { setName(""); setUnit(""); setMin(0); setMsg("Gespeichert ✅"); load(); }
  }

  useEffect(() => { load(); }, []);

  function onContextMenu(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setMenuItemId(id);
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }

  function lowStockInfo(row: ItemRow) {
    const stock = row.item_stock?.stock ?? 0;
    const threshold = (row.low_stock_threshold ?? row.min_stock) ?? 0;
    const enabled = row.low_stock_enabled ?? true;
    return { stock, threshold, enabled, isLow: enabled && stock <= threshold };
  }

  return (
    <RequireAuth>
      <main className="p-6 max-w-3xl mx-auto space-y-5">
        <h1 className="text-2xl font-bold">Bestand</h1>

        {/* Neues Item */}
        <section className="grid gap-2 sm:grid-cols-4 items-start">
          <input className="px-3 py-2 rounded border bg-transparent" placeholder="Name"
                 value={name} onChange={e=>setName(e.target.value)} />
          <input className="px-3 py-2 rounded border bg-transparent" placeholder="Einheit (z.B. Flasche)"
                 value={unit} onChange={e=>setUnit(e.target.value)} />
          <input className="px-3 py-2 rounded border bg-transparent" placeholder="Mindestbestand"
                 type="number" value={min} onChange={e=>setMin(Number(e.target.value))} />
          <button className="px-3 py-2 rounded bg-blue-600" onClick={addItem}>Neues Item</button>
        </section>
        {msg && <p className="text-sm opacity-80">{msg}</p>}

        {/* Liste */}
        <ul className="space-y-2 relative">
          {items.map((it) => {
            const info = lowStockInfo(it);
            return (
              <li key={it.id}
                  onContextMenu={(e)=>onContextMenu(e, it.id)}
                  className="p-3 rounded border cursor-context-menu hover:bg-white/5 flex items-center justify-between">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm opacity-80">
                    {it.unit ?? "—"} • Min: {(it.low_stock_threshold ?? it.min_stock) ?? 0}
                    {" • Bestand: "}{info.stock}
                  </div>
                </div>
                {info.isLow && (
                  <span className="text-xs px-2 py-1 rounded bg-red-600/80">Low</span>
                )}
                {/* Fallback für Handy: 3-Punkte-Button */}
                <button
                  onClick={(e)=>{ e.stopPropagation(); onContextMenu(e as any, it.id); }}
                  className="ml-3 px-2 py-1 rounded border text-xs"
                  title="Menü"
                >⋯</button>
              </li>
            );
          })}

          {/* Kontextmenü */}
          {menuOpen && menuItemId && (
            <div ref={menuRef}
                 style={{ top: menuPos.y, left: menuPos.x, position:"fixed", zIndex:50 }}
                 className="min-w-44 rounded-lg border bg-neutral-900 shadow-lg">
              <button
                className="w-full text-left px-3 py-2 hover:bg-white/10"
                onClick={()=>{ router.push(`/items/${menuItemId}/settings`); closeMenu(); }}
              >
                Low-Stock-Warnung…
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-white/10"
                onClick={()=>{ router.push(`/items/${menuItemId}`); closeMenu(); }}
              >
                Artikel öffnen
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-white/10"
                onClick={closeMenu}
              >
                Abbrechen
              </button>
            </div>
          )}
        </ul>
      </main>
    </RequireAuth>
  );
}

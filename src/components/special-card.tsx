"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";
import type { Special } from "@/lib/types";

const ACCENT = {
  rose: { border: "border-rose-mid", bg: "bg-rose", text: "text-rose-deep", btn: "bg-rose-deep" },
  lav: { border: "border-lav-mid", bg: "bg-lav", text: "text-lav-deep", btn: "bg-lav-deep" },
  sage: { border: "border-sage-mid", bg: "bg-sage", text: "text-sage-deep", btn: "bg-sage-deep" },
  peach: { border: "border-peach-mid", bg: "bg-peach", text: "text-peach-deep", btn: "bg-peach-deep" },
};

export function SpecialCard({ special: s, leadTimeHours }: { special: Special; leadTimeHours: number }) {
  const { add } = useCart();
  const router = useRouter();
  const a = ACCENT[s.accent] ?? ACCENT.rose;

  function order() {
    add({
      kind: "special",
      specialId: s.id,
      qty: 1,
      name: s.name,
      emoji: s.emoji,
      sizeLabel: "",
      unitPrice: s.price_aed,
      leadTimeHours,
    });
    router.push("/order");
  }

  return (
    <div className={`lift mb-3.5 flex items-center gap-4 rounded-[16px] border-[1.5px] border-dashed bg-white p-4 ${a.border}`}>
      <div className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[12px] text-[30px] ${a.bg}`}>{s.emoji}</div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-0.5 text-[14px] font-bold">
          {s.name}
          {s.tag && <span className={`tag ml-1.5 ${a.bg} ${a.text}`}>{s.tag}</span>}
        </h3>
        <p className="mb-2 text-[12px] leading-[1.6] text-muted">{s.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[15px] font-bold ${a.text}`}>{aed(s.price_aed)}</span>
          {s.old_price_aed != null && <span className="text-[12px] text-muted line-through">{aed(s.old_price_aed)}</span>}
          <button onClick={order} className={`btn-p press ml-auto px-3.5 py-1.5 text-[11px] ${a.btn}`} disabled={s.price_aed <= 0}>
            Order now
          </button>
        </div>
      </div>
    </div>
  );
}

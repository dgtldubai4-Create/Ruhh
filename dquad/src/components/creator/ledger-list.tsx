"use client";
import { CheckCircle, HourglassMedium, ShoppingBag, Sliders } from "@phosphor-icons/react";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDateTime, fmtPoints } from "@/lib/format";
import type { LedgerEntry } from "@/lib/store/types";
import { EmptyState } from "@/components/ui/primitives";

type Kind = "available" | "pending" | "spent" | "adjustment";
function kindOf(e: LedgerEntry): Kind {
  if (e.type === "spent") return "spent";
  if (e.type === "adjustment") return "adjustment";
  return e.released ? "available" : "pending";
}
const KIND_LABEL: Record<Kind, string> = { available: "Available", pending: "Pending", spent: "Spent", adjustment: "Adjustment" };
const KIND_ICON = { available: CheckCircle, pending: HourglassMedium, spent: ShoppingBag, adjustment: Sliders } as const;

/** Ledger history grouped by month. Ink and stone only, icons carry the meaning. */
export function LedgerList({ entries, limit }: { entries: LedgerEntry[]; limit?: number }) {
  const { lang } = useLang();
  const sorted = [...entries].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit ?? entries.length);
  if (sorted.length === 0) return <EmptyState title="No points yet" body="Finish a side quest or publish a campaign and your first entry lands here." />;

  const groups: { key: string; label: string; items: LedgerEntry[] }[] = [];
  for (const e of sorted) {
    const d = new Date(e.at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    let g = groups.find((x) => x.key === key);
    if (!g) {
      g = { key, label: new Intl.DateTimeFormat(lang === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { month: "long", year: "numeric" }).format(d), items: [] };
      groups.push(g);
    }
    g.items.push(e);
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <section key={g.key} aria-label={g.label}>
          <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-stone">{g.label}</div>
          <ul className="divide-y divide-line rounded-card border border-line bg-card">
            {g.items.map((e) => {
              const kind = kindOf(e);
              const Icon = KIND_ICON[kind];
              const negative = kind === "spent" || (kind === "adjustment" && e.points < 0);
              const sign = negative ? "-" : "+";
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", kind === "pending" ? "bg-paper-2 text-stone" : "bg-paper-2 text-ink")} aria-hidden>
                    <Icon size={18} weight={kind === "pending" ? "regular" : "fill"} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-ink">{e.note.replace(/\s*\((pending publish and verification|in review|awaiting verification)\)\s*$/i, "")}</div>
                    <div className="text-[12.5px] text-stone">
                      {KIND_LABEL[kind]}
                      {kind === "pending" && ", releases after verification"}
                      {" · "}
                      {fmtDateTime(e.releasedAt ?? e.at, lang)}
                    </div>
                  </div>
                  <div className={cx("shrink-0 font-display text-[18px] font-bold tabular", kind === "pending" ? "text-stone" : "text-ink")}>
                    {sign}
                    {fmtPoints(Math.abs(e.points))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Barcode, CheckCircle, Gift, MapPin, Package, Truck } from "@phosphor-icons/react";
import type { AppState, Shipment } from "@/lib/store/types";
import { advanceShipment, nextLogisticsStatus, simulate } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDateTime } from "@/lib/format";
import { SimTag, Steps, Tag } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlays";
import { Collapse } from "./expand-row";
import { RoleNotice, useActor } from "./role-gate";
import { Portrait } from "./creator-row";
import { creatorOf, LOGISTICS_ORDER } from "./helpers";

export function ParcelCard({ s, sh, className }: { s: AppState; sh: Shipment; className?: string }) {
  const { t, lang, dir } = useLang();
  const { actor, allowed } = useActor();
  const { toast } = useToast();
  const creator = creatorOf(s, sh.creatorId);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(false);
  const next = nextLogisticsStatus(sh.status);
  const step = LOGISTICS_ORDER.indexOf(sh.status);
  const isKit = sh.kind === "product_kit";

  async function advance() {
    if (!next) return;
    setBusy(true);
    await simulate(() => advanceShipment(sh.id, actor));
    setBusy(false);
    toast(`${sh.label}: ${t.logistics[next]}`, `${creator?.name.split(" ")[0]} gets a simulated ${next === "dispatched" || next === "delivered" ? "email" : "in-app notification"}.`);
  }

  return (
    <motion.article layoutId={sh.id} layout="position" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className={cx("card flex flex-col gap-4 p-4 sm:p-5", sh.status === "delivered" && "bg-paper", className)} aria-label={sh.label}>
      <div className="flex items-start gap-3">
        <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-input", isKit ? "bg-grass-soft" : "bg-sun-soft")} aria-hidden>
          {isKit ? <Package size={22} weight="fill" className="text-ink" /> : <Gift size={22} weight="fill" className="text-ink" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-[16px] font-bold leading-tight">{sh.label}</span>
            <Tag outline>{isKit ? "Product kit" : "Reward"}</Tag>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-stone">
            {creator && <Portrait c={creator} size={22} />}
            <span className="font-semibold text-ink">{creator?.name}</span>
            <span>{creator?.market}</span>
          </div>
        </div>
      </div>

      <div>
        <Steps steps={LOGISTICS_ORDER.map((x) => t.logistics[x])} current={step} accent={isKit ? "grass" : "sun"} />
        <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
          <span className="font-semibold">{t.logistics[sh.status]}</span>
          <span className="text-stone">{step + 1} of {LOGISTICS_ORDER.length}</span>
        </div>
      </div>

      <dl className="grid gap-x-4 gap-y-2 text-[13.5px] sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex items-start gap-2">
          <MapPin size={16} weight="bold" className="mt-0.5 shrink-0 text-stone" aria-hidden />
          <div><dt className="sr-only">Address</dt><dd>{sh.address || "No address on file"}</dd></div>
        </div>
        <div className="flex items-start gap-2">
          <Truck size={16} weight="bold" className="mt-0.5 shrink-0 text-stone" aria-hidden />
          <div><dt className="sr-only">Courier</dt><dd>{sh.courier}</dd></div>
        </div>
        <div className="flex items-start gap-2 sm:col-span-2 xl:col-span-1">
          <Barcode size={16} weight="bold" className="mt-0.5 shrink-0 text-stone" aria-hidden />
          <div className="flex flex-wrap items-center gap-2"><dt className="sr-only">Tracking</dt><dd className="font-mono">{sh.tracking}</dd><SimTag>{t.common.simulated}</SimTag></div>
        </div>
      </dl>

      <div>
        <button type="button" className="text-[13px] font-semibold text-stone underline underline-offset-4 hover:text-ink" onClick={() => setHistory((v) => !v)} aria-expanded={history}>
          {history ? "Hide history" : `History (${sh.history.length})`}
        </button>
        <Collapse open={history}>
          <ol className="mt-2 flex flex-col gap-1 border-s-2 border-line ps-3 text-[13px]">
            {sh.history.map((h) => (
              <li key={h.status} className="flex justify-between gap-2">
                <span>{t.logistics[h.status]}</span>
                <span className="text-stone">{fmtDateTime(h.at, lang)}</span>
              </li>
            ))}
          </ol>
        </Collapse>
      </div>

      <div className="mt-auto">
        {!next ? (
          <div className="flex items-center gap-2 text-[14px] font-semibold"><CheckCircle size={20} weight="fill" aria-hidden /> Delivered. Nothing more to do.</div>
        ) : allowed("logistics.advance") ? (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-ink btn-sm" onClick={advance} disabled={busy} aria-busy={busy}>
              {busy ? "Updating" : `Advance to ${t.logistics[next]}`} <ArrowRight size={16} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />
            </button>
            <span className="text-[12.5px] text-stone">The creator gets a simulated notification.</span>
          </div>
        ) : (
          <RoleNotice cap="logistics.advance" />
        )}
      </div>
    </motion.article>
  );
}

"use client";
import { useState } from "react";
import { CaretDown, CaretUp, MapPin, Package, Truck } from "@phosphor-icons/react";
import { SimTag, Steps } from "@/components/ui/primitives";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDateTime } from "@/lib/format";
import type { Shipment } from "@/lib/store/types";
import { LOGISTICS_ORDER } from "./helpers";

/** Five-step parcel tracker with courier and tracking clearly marked as simulated. */
export function ShipmentTracker({ shipment, compact, className }: { shipment: Shipment; compact?: boolean; className?: string }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const idx = LOGISTICS_ORDER.indexOf(shipment.status);
  const delivered = shipment.status === "delivered";
  const stepLabels = LOGISTICS_ORDER.map((k) => t.logistics[k]);
  const Icon = delivered ? Package : Truck;

  return (
    <div className={cx("card p-4 sm:p-5", className)}>
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink" aria-hidden>
          <Icon size={22} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="truncate text-[15px] font-semibold">{shipment.label}</div>
            <span className="text-[12px] text-stone">{shipment.kind === "product_kit" ? "Product kit" : "Reward"}</span>
          </div>
          <div className="mt-0.5 text-[13.5px] text-ink">
            {t.logistics[shipment.status]}
            {!delivered && idx < LOGISTICS_ORDER.length - 1 && <span className="text-stone">, next: {t.logistics[LOGISTICS_ORDER[idx + 1]]}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Steps steps={stepLabels} current={delivered ? LOGISTICS_ORDER.length : idx} accent="grass" compact={compact} />
        {!compact && (
          <div className="mt-2 hidden grid-cols-5 gap-2 text-[11px] text-stone sm:grid">
            {stepLabels.map((l, i) => (
              <span key={l} className={cx("truncate", i <= idx && "font-semibold text-ink")}>
                {l}
              </span>
            ))}
          </div>
        )}
      </div>

      {!compact && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-stone">
            <span className="inline-flex items-center gap-1.5">
              <Truck size={15} weight="bold" /> {shipment.courier}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular">
              Tracking {shipment.tracking} <SimTag>Simulated</SimTag>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} weight="bold" /> {shipment.address}
            </span>
          </div>
          <button className="btn-ghost btn-sm mt-2 -ms-2" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
            {open ? "Hide history" : "Parcel history"}
          </button>
          {open && (
            <ol className="mt-1 flex flex-col gap-1.5 border-s-2 border-line ps-4 text-[13px]">
              {shipment.history.map((h) => (
                <li key={h.status} className="flex justify-between gap-3">
                  <span className="font-semibold text-ink">{t.logistics[h.status]}</span>
                  <span className="text-stone">{fmtDateTime(h.at, lang)}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </div>
  );
}

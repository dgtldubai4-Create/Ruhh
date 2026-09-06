"use client";
import { cx } from "@/lib/format";

export type PillOption<T extends string> = { value: T; label: string; count?: number };

/** Filter pills: one group, one value, an optional "All" reset. */
export function Pills<T extends string>({ label, options, value, onChange, allLabel, className }: {
  label: string;
  options: PillOption<T>[];
  value: T | "";
  onChange: (v: T | "") => void;
  allLabel?: string;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cx("flex flex-wrap items-center gap-1.5", className)}>
      <span className="me-1 text-[12px] font-bold uppercase tracking-[0.12em] text-stone">{label}</span>
      {allLabel && <Pill active={value === ""} onClick={() => onChange("")}>{allLabel}</Pill>}
      {options.map((o) => (
        <Pill key={o.value} active={value === o.value} onClick={() => onChange(value === o.value ? "" : o.value)}>
          {o.label}
          {typeof o.count === "number" && <span className={cx("ms-1 tabular", value === o.value ? "text-card/80" : "text-stone")}>{o.count}</span>}
        </Pill>
      ))}
    </div>
  );
}

export function Pill({ active, onClick, children, className }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx("rounded-pill border px-3 py-1.5 text-[13px] font-semibold transition-colors duration-150", active ? "border-ink bg-ink text-card" : "border-line bg-card text-ink hover:bg-paper-2", className)}
    >
      {children}
    </button>
  );
}

/** Tab strip for sectioned pages. */
export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { value: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="rail -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {tabs.map((tb) => (
        <button
          key={tb.value}
          role="tab"
          type="button"
          aria-selected={value === tb.value}
          onClick={() => onChange(tb.value)}
          className={cx("shrink-0 rounded-pill border px-4 py-2 text-[14px] font-semibold transition-colors duration-150", value === tb.value ? "border-ink bg-ink text-card" : "border-line bg-card text-ink hover:bg-paper-2")}
        >
          {tb.label}
          {typeof tb.count === "number" && tb.count > 0 && <span className={cx("ms-1.5 rounded-pill px-1.5 py-0.5 text-[11px] tabular", value === tb.value ? "bg-card/20 text-card" : "bg-paper-2 text-stone")}>{tb.count}</span>}
        </button>
      ))}
    </div>
  );
}

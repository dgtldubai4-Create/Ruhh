"use client";
import { cx } from "@/lib/format";
import { Skeleton } from "@/components/ui/primitives";

export function SectionTitle({ title, count, aside, className, id }: { title: React.ReactNode; count?: number; aside?: React.ReactNode; className?: string; id?: string }) {
  return (
    <div className={cx("mb-3 flex flex-wrap items-end justify-between gap-2", className)}>
      <div>
        <h2 id={id} className="display-sm flex items-center gap-2">
          {title}
          {typeof count === "number" && <span className="rounded-pill bg-paper-2 px-2 py-0.5 text-[12px] font-semibold tabular text-stone">{count}</span>}
        </h2>
      </div>
      {aside && <div className="flex flex-wrap items-center gap-2">{aside}</div>}
    </div>
  );
}

/** Page-level skeleton shown before the persisted state has been read. */
export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <Skeleton className="h-12 w-2/3 max-w-[420px]" />
      <Skeleton className="h-5 w-1/2 max-w-[320px]" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-card" />
    </div>
  );
}

/** Small label + value pair used inside cards. */
export function KV({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[12px] font-bold uppercase tracking-[0.12em] text-stone">{label}</div>
      <div className="mt-1 text-[14.5px]">{children}</div>
    </div>
  );
}

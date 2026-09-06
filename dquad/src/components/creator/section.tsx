"use client";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";

/** Section heading used across the creator portal: title, optional aside and link. */
export function SectionTitle({ title, href, linkLabel, className, aside }: { title: React.ReactNode; href?: string; linkLabel?: string; className?: string; aside?: React.ReactNode }) {
  const { dir, t } = useLang();
  return (
    <div className={cx("mb-4 flex items-end justify-between gap-3", className)}>
      <div>
        <h2 className="display-md">{title}</h2>
      </div>
      {aside}
      {href && (
        <Link href={href} className="btn-ghost btn-sm shrink-0">
          {linkLabel ?? t.common.viewAll} <ArrowRight size={16} weight="bold" className={dir === "rtl" ? "rotate-180" : ""} />
        </Link>
      )}
    </div>
  );
}
